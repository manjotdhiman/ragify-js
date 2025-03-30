import { QdrantClient } from "@qdrant/js-client-rest";
import type { VectorStore } from "../types";

/**
 * Qdrant Vector Store
 * Implements the VectorStore interface for Qdrant
 */
export class QdrantStore implements VectorStore {
  private client: QdrantClient;
  private readonly collectionName: string;

  constructor(apiKey: string, collectionName: string = "documents") {
    if (!apiKey) {
      throw new Error("Qdrant API key is required");
    }

    this.client = new QdrantClient({
      url: "http://localhost:6333",
      apiKey,
    });

    this.collectionName = collectionName;
    this.initializeCollection();
  }

  /**
   * Initialize the collection if it doesn't exist
   */
  private async initializeCollection(): Promise<void> {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536, // OpenAI ada-002 embedding size
            distance: "Cosine",
          },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize Qdrant collection: ${error.message}`);
      }
      throw new Error("Failed to initialize Qdrant collection");
    }
  }

  /**
   * Upsert vectors into the store
   */
  async upsert(
    vectors: Array<{
      id: string;
      vector: number[];
      payload?: Record<string, unknown>;
    }>
  ): Promise<void> {
    try {
      await this.client.upsert(this.collectionName, {
        points: vectors.map(v => ({
          id: v.id,
          vector: v.vector,
          payload: v.payload,
        })),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to upsert vectors: ${error.message}`);
      }
      throw new Error("Failed to upsert vectors");
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    topK: number,
    minScore: number
  ): Promise<Array<{ documentId: string; score: number; metadata?: Record<string, unknown> }>> {
    try {
      const results = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit: topK,
        score_threshold: minScore,
      });

      return results.map(result => ({
        documentId: String(result.id),
        score: result.score,
        metadata: result.payload as Record<string, unknown>,
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to search vectors: ${error.message}`);
      }
      throw new Error("Failed to search vectors");
    }
  }

  /**
   * Delete vectors by IDs
   */
  async delete(ids: string[]): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        points: ids,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete vectors: ${error.message}`);
      }
      throw new Error("Failed to delete vectors");
    }
  }

  /**
   * Clear all vectors from the store
   */
  async clear(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collectionName);
      await this.initializeCollection();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to clear vectors: ${error.message}`);
      }
      throw new Error("Failed to clear vectors");
    }
  }
}
