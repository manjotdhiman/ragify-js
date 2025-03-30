import { OpenAIEmbedder } from "./embeddings/openai";
import { QdrantStore } from "./vectorStores/qdrant";
import type { Embedder, VectorStore } from "./types";
import { RAGEngine } from "./engine";
import { createEmbedder as createEmbedderImpl } from "./embeddings";
import { createVectorStore as createVectorStoreImpl } from "./vectorStores";
import type { RAGEngineConfig } from "./types";

/**
 * Creates an embedder instance based on the provided configuration
 * @param config Configuration for the embedder
 * @returns An embedder instance
 */
export function createEmbedder(config: {
  provider: "openai";
  apiKey: string;
  model: string;
}): Embedder {
  switch (config.provider) {
    case "openai":
      return new OpenAIEmbedder(config.apiKey, config.model);
    default:
      throw new Error(`Unsupported embedder provider: ${config.provider}`);
  }
}

/**
 * Creates a vector store instance based on the provided configuration
 * @param config Configuration for the vector store
 * @returns A vector store instance
 */
export function createVectorStore(config: {
  provider: "qdrant";
  apiKey: string;
  collection?: string;
}): VectorStore {
  switch (config.provider) {
    case "qdrant":
      return new QdrantStore(config.apiKey, config.collection);
    default:
      throw new Error(`Unsupported vector store provider: ${config.provider}`);
  }
}

/**
 * Creates a RAG engine instance based on the provided configuration
 * @param config Configuration for the RAG engine
 * @returns A RAG engine instance
 */
export function createRAGEngine(config: RAGEngineConfig): RAGEngine {
  const embedder = createEmbedderImpl({
    provider: "openai", // Currently only OpenAI is supported
    apiKey: config.apiKeys.openai,
    model: config.embeddingModel || "text-embedding-ada-002",
  });

  const vectorStore = createVectorStoreImpl({
    provider: "qdrant", // Currently only Qdrant is supported
    apiKey: config.apiKeys.qdrant,
    collection: config.vectorStoreConfig?.collection,
  });

  return new RAGEngine(embedder, vectorStore, config.chunkingConfig);
}
