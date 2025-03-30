import type { Embedder, EmbeddingConfig } from "../types";
import { OpenAIEmbedder } from "./openai";

export type { EmbeddingConfig };

export function createEmbedder(config: EmbeddingConfig): Embedder {
  switch (config.provider) {
    case "openai":
      return new OpenAIEmbedder(config.apiKey, config.model);
    case "cohere":
      throw new Error("Cohere embeddings not yet implemented");
    case "huggingface":
      throw new Error("HuggingFace embeddings not yet implemented");
    default:
      throw new Error(`Unsupported embedding provider: ${config.provider}`);
  }
}
