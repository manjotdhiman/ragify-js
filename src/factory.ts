import { OpenAIEmbedder } from "./embeddings/openai";
import { QdrantStore } from "./vectorStores/qdrant";
import type { Embedder, VectorStore } from "./types";

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
}): VectorStore {
  switch (config.provider) {
    case "qdrant":
      return new QdrantStore(config.apiKey);
    default:
      throw new Error(`Unsupported vector store provider: ${config.provider}`);
  }
} 