import OpenAI from "openai";
import type { Embedder } from "../types";

interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
    object: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    code: string;
    param: string | null;
  };
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

/**
 * OpenAI Embedding Provider
 * Implements the Embedder interface for OpenAI's embedding API
 */
export class OpenAIEmbedder implements Embedder {
  private client: OpenAI;
  private readonly model: string = "text-embedding-ada-002";
  private readonly baseURL: string = "https://api.openai.com/v1";
  private readonly retryConfig: RetryConfig;
  private lastRequestTime: number = 0;
  private readonly minRequestInterval: number = 1000; // 1 second between requests

  constructor(apiKey: string, model: string = "text-embedding-ada-002", retryConfig: Partial<RetryConfig> = {}) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.client = new OpenAI({
      apiKey
    });

    this.retryConfig = {
      maxRetries: retryConfig.maxRetries ?? 3,
      initialDelay: retryConfig.initialDelay ?? 1000,
      maxDelay: retryConfig.maxDelay ?? 10000
    };
  }

  /**
   * Wait for rate limiting
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Exponential backoff retry logic
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.retryConfig.maxRetries) {
        if (error instanceof Error) {
          const errorMessage = error.message.includes("data") 
            ? "API Error" 
            : error.message;
          throw new Error(`OpenAI API error: ${errorMessage}`);
        }
        throw new Error(`Unexpected error: ${String(error)}`);
      }

      const delay = Math.min(
        this.retryConfig.initialDelay * Math.pow(2, retryCount),
        this.retryConfig.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, retryCount + 1);
    }
  }

  /**
   * Generate embeddings for a single text input
   * @param text - The text to generate embeddings for
   * @returns Promise containing the embedding vector
   * @throws Error if the API request fails
   */
  async embed(text: string): Promise<number[]> {
    return this.retryWithBackoff(async () => {
      await this.waitForRateLimit();
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text
      });

      return response.data[0].embedding;
    });
  }

  /**
   * Generate embeddings for multiple texts in parallel
   * @param texts - Array of texts to generate embeddings for
   * @returns Promise containing array of embedding vectors
   * @throws Error if the API request fails
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    return this.retryWithBackoff(async () => {
      await this.waitForRateLimit();
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts
      });

      return response.data.map(item => item.embedding);
    });
  }
}
