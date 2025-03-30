import { QdrantStore } from "./qdrant";
import type { VectorStore } from "../types";

export type VectorStoreProvider = "qdrant" | "pinecone" | "milvus";

export interface VectorStoreConfig {
  provider: VectorStoreProvider;
  apiKey: string;
  baseURL?: string;
  collection?: string;
  cacheConfig?: {
    maxSize?: number;
    ttl?: number;
  };
}

export function createVectorStore(config: VectorStoreConfig): VectorStore {
  switch (config.provider) {
    case "qdrant":
      return new QdrantStore(config.apiKey, config.collection);
    case "pinecone":
      throw new Error("Pinecone vector store not yet implemented");
    case "milvus":
      throw new Error("Milvus vector store not yet implemented");
    default:
      throw new Error(`Unsupported vector store provider: ${config.provider}`);
  }
}
