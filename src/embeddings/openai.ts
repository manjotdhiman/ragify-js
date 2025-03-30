import type { Embedder } from "../types";

/**
 * OpenAI Embedder
 * Implements the Embedder interface for OpenAI's embedding API
 */
export class OpenAIEmbedder implements Embedder {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly retryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
  };

  constructor(
    apiKey: string,
    model = "text-embedding-ada-002",
    retryConfig = {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffFactor: 2,
    }
  ) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.apiKey = apiKey;
    this.model = model;
    this.retryConfig = retryConfig;
  }

  /**
   * Generate embeddings for a single text input
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.retryWithBackoff(async () => {
        const result = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            input: text,
            model: this.model,
          }),
        });

        if (!result.ok) {
          throw new Error(`OpenAI API error: ${result.statusText}`);
        }

        const data = await result.json();
        return data.data[0].embedding;
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embedding: ${error.message}`);
      }
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Generate embeddings for multiple text inputs
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.retryWithBackoff(async () => {
        const result = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            input: texts,
            model: this.model,
          }),
        });

        if (!result.ok) {
          throw new Error(`OpenAI API error: ${result.statusText}`);
        }

        const data = await result.json();
        return data.data.map((item: { embedding: number[] }) => item.embedding);
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embeddings: ${error.message}`);
      }
      throw new Error("Failed to generate embeddings");
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let delay = this.retryConfig.initialDelayMs;
    let attempt = 0;

    while (attempt < this.retryConfig.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt === this.retryConfig.maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * this.retryConfig.backoffFactor, this.retryConfig.maxDelayMs);
      }
    }

    throw new Error("Max retries exceeded");
  }
}
