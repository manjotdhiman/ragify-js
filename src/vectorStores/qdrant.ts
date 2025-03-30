import { QdrantClient } from "@qdrant/js-client-rest";
import type { VectorStore, VectorStoreConfig } from "../types";

export class QdrantStore implements VectorStore {
  private client: QdrantClient;
  private collection: string;

  constructor(apiKey: string, collection: string = "documents") {
    this.client = new QdrantClient({
      url: "http://localhost:6333",
      apiKey
    });
    this.collection = collection;
    this.initializeCollection();
  }

  private async initializeCollection(): Promise<void> {
    try {
      console.log("initializing collection");
      const collections = await this.client.getCollections();
      console.log("collections", collections);

      if (!collections?.collections?.some(c => c.name === this.collection)) {
        await this.client.createCollection(this.collection, {
          vectors: {
            size: 1536,
            distance: "Cosine"
          }
        });
      }
    } catch (error) {
      console.error("Failed to initialize collection:", error);
      throw error;
    }
  }

  async upsert(points: { id: string; vector: number[]; payload: Record<string, unknown> }[]): Promise<void> {
    try {
      await this.client.upsert(this.collection, {
        points: points.map(point => ({
          id: point.id,
          vector: point.vector,
          payload: point.payload
        }))
      });
    } catch (error) {
      console.error("Failed to upsert points:", error);
      throw error;
    }
  }

  async search(
    vector: number[],
    limit: number = 5,
    minScore: number = 0.7
  ): Promise<{ documentId: string; score: number; metadata: Record<string, unknown> }[]> {
    try {
      const results = await this.client.search(this.collection, {
        vector,
        limit,
        filter: {
          must: [
            {
              key: "score",
              range: {
                gte: minScore
              }
            }
          ]
        }
      });

      return results.map(result => ({
        documentId: String(result.id),
        score: result.score,
        metadata: result.payload as Record<string, unknown>
      }));
    } catch (error) {
      console.error("Failed to search vectors:", error);
      throw error;
    }
  }

  async delete(ids: string[]): Promise<void> {
    try {
      await this.client.delete(this.collection, {
        points: ids
      });
    } catch (error) {
      console.error("Failed to delete points:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.deleteCollection(this.collection);
      await this.initializeCollection();
    } catch (error) {
      console.error("Failed to clear collection:", error);
      throw error;
    }
  }
}
