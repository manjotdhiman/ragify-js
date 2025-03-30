/**
 * Core types for the RAG library
 */

export type EmbeddingProvider = "openai" | "cohere" | "huggingface";
export type VectorStoreProvider = "qdrant" | "pinecone" | "milvus";

export interface Document {
  /** Unique identifier for the document */
  id: string;
  /** The actual content of the document */
  content: string;
  /** Optional metadata associated with the document */
  metadata?: Record<string, unknown>;
}

export interface Embedding {
  /** The vector representation of the text */
  vector: number[];
  /** The original text that was embedded */
  text: string;
  /** Optional metadata associated with the embedding */
  metadata?: Record<string, unknown>;
}

export interface ChunkingConfig {
  /** Maximum number of tokens per chunk */
  maxTokens: number;
  /** Number of tokens to overlap between chunks */
  overlap: number;
  /** Whether to preserve sentence boundaries */
  preserveSentences: boolean;
}

export interface SearchConfig {
  /** Number of results to return */
  topK: number;
  /** Minimum similarity score threshold */
  minScore: number;
}

export interface RetryConfig {
  /** Maximum number of retries */
  maxRetries: number;
  /** Initial delay between retries in milliseconds */
  initialDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
}

export interface VectorStoreConfig {
  /** Base URL for the vector store service */
  baseURL?: string;
  /** Collection name in the vector store */
  collection?: string;
  /** Cache configuration */
  cacheConfig?: {
    /** Maximum number of items to cache */
    maxSize?: number;
    /** Time to live for cache entries in milliseconds */
    ttl?: number;
  };
}

export interface RAGEngineConfig {
  /** The LLM provider to use (e.g., "openai", "anthropic") */
  llmProvider: "openai";
  /** The embedding provider to use (e.g., "openai", "cohere") */
  embeddingProvider: EmbeddingProvider;
  /** The embedding model to use */
  embeddingModel?: string;
  /** The vector store to use (e.g., "qdrant", "pinecone") */
  vectorStore: VectorStoreProvider;
  /** API keys for various services */
  apiKeys: {
    openai: string;
    qdrant: string;
    cohere?: string;
    huggingface?: string;
  };
  /** Configuration for text chunking */
  chunkingConfig?: ChunkingConfig;
  /** Configuration for similarity search */
  searchConfig?: SearchConfig;
  /** Configuration for retry logic */
  retryConfig?: RetryConfig;
  /** Configuration for vector store */
  vectorStoreConfig?: VectorStoreConfig;
  /** Maximum number of chunks to process concurrently */
  maxConcurrentChunks?: number;
}

export interface QueryResult {
  documentId: string;
  score: number;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface ProgressTracker {
  onProgress: (progress: number, message: string) => void;
}

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  apiKey: string;
  model?: string;
}

export interface Embedder {
  /** Generate embeddings for the given text */
  embed(text: string): Promise<number[]>;
  /** Generate embeddings for multiple texts in parallel */
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  upsert(
    vectors: Array<{
      id: string;
      vector: number[];
      payload?: Record<string, unknown>;
    }>
  ): Promise<void>;
  search(
    queryVector: number[],
    topK: number,
    minScore: number
  ): Promise<
    Array<{
      documentId: string;
      score: number;
      metadata?: Record<string, unknown>;
    }>
  >;
  delete(ids: string[]): Promise<void>;
  clear(): Promise<void>;
}
