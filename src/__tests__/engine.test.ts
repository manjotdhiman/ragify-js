import { jest } from "@jest/globals";
import { RAGEngine } from "../engine";
import { createEmbedder } from "../embeddings";
import { createVectorStore } from "../vectorStores";
import type { Document, RAGEngineConfig, Embedder, VectorStore } from "../types";

jest.mock("../embeddings");
jest.mock("../vectorStores");

describe("RAGEngine", () => {
  const mockConfig: RAGEngineConfig = {
    llmProvider: "openai",
    embeddingProvider: "openai",
    embeddingModel: "text-embedding-ada-002",
    vectorStore: "qdrant",
    apiKeys: {
      openai: "test-openai-key",
      qdrant: "test-qdrant-key"
    },
    vectorStoreConfig: {
      baseURL: "http://localhost:6333",
      collection: "test-collection"
    }
  };

  const mockEmbedder: jest.Mocked<Embedder> = {
    embed: jest.fn(),
    embedBatch: jest.fn()
  };

  const mockVectorStore: jest.Mocked<VectorStore> = {
    upsert: jest.fn(),
    search: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createEmbedder as jest.Mock).mockReturnValue(mockEmbedder);
    (createVectorStore as jest.Mock).mockReturnValue(mockVectorStore);
  });

  describe("ingestDocuments", () => {
    const mockDocs: Document[] = [
      {
        id: "doc1",
        content: "This is a test document.",
        metadata: { source: "test" }
      }
    ];

    it("should process and store documents correctly", async () => {
      const engine = new RAGEngine(mockConfig);
      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbedder.embed.mockResolvedValue(mockEmbedding);
      mockVectorStore.upsert.mockResolvedValue();

      await engine.ingestDocuments(mockDocs);

      expect(createEmbedder).toHaveBeenCalledWith({
        provider: "openai",
        apiKey: "test-openai-key",
        model: "text-embedding-ada-002"
      });

      expect(createVectorStore).toHaveBeenCalledWith({
        provider: "qdrant",
        apiKey: "test-qdrant-key",
        baseURL: "http://localhost:6333",
        collection: "test-collection"
      });

      expect(mockEmbedder.embed).toHaveBeenCalledWith("This is a test document.");
      expect(mockVectorStore.upsert).toHaveBeenCalledWith([
        expect.objectContaining({
          vector: mockEmbedding,
          payload: expect.objectContaining({
            documentId: "doc1",
            source: "test",
            chunk: "This is a test document."
          })
        })
      ]);
    });

    it("should handle errors during ingestion", async () => {
      const engine = new RAGEngine(mockConfig);
      mockEmbedder.embed.mockRejectedValue(new Error("Embedding failed"));

      await expect(engine.ingestDocuments(mockDocs)).rejects.toThrow(
        "Failed to process document doc1: Embedding failed"
      );
    });

    it("should report progress if tracker is provided", async () => {
      const engine = new RAGEngine(mockConfig);
      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbedder.embed.mockResolvedValue(mockEmbedding);
      mockVectorStore.upsert.mockResolvedValue();

      const mockTracker = {
        onProgress: jest.fn()
      };

      await engine.ingestDocuments(mockDocs, mockTracker);

      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        100,
        "Processed document 1 of 1"
      );
    });
  });

  describe("query", () => {
    const mockQueryText = "test query";
    const mockQueryEmbedding = [0.1, 0.2, 0.3];
    const mockResults = [
      {
        documentId: "doc1",
        score: 0.9,
        metadata: {
          chunk: "This is a test document.",
          source: "test"
        }
      }
    ];

    it("should perform search correctly", async () => {
      const engine = new RAGEngine(mockConfig);
      mockEmbedder.embed.mockResolvedValue(mockQueryEmbedding);
      mockVectorStore.search.mockResolvedValue(mockResults);

      const results = await engine.query(mockQueryText);

      expect(createEmbedder).toHaveBeenCalledWith({
        provider: "openai",
        apiKey: "test-openai-key",
        model: "text-embedding-ada-002"
      });

      expect(createVectorStore).toHaveBeenCalledWith({
        provider: "qdrant",
        apiKey: "test-qdrant-key",
        baseURL: "http://localhost:6333",
        collection: "test-collection"
      });

      expect(mockEmbedder.embed).toHaveBeenCalledWith(mockQueryText);
      expect(mockVectorStore.search).toHaveBeenCalledWith(
        mockQueryEmbedding,
        5,
        0.7
      );
      expect(results).toEqual(mockResults);
    });

    it("should handle search errors", async () => {
      const engine = new RAGEngine(mockConfig);
      mockEmbedder.embed.mockRejectedValue(new Error("Search failed"));

      await expect(engine.query(mockQueryText)).rejects.toThrow(
        "Failed to generate query embedding: Search failed"
      );
    });

    it("should report progress if tracker is provided", async () => {
      const engine = new RAGEngine(mockConfig);
      mockEmbedder.embed.mockResolvedValue(mockQueryEmbedding);
      mockVectorStore.search.mockResolvedValue(mockResults);

      const mockTracker = {
        onProgress: jest.fn()
      };

      await engine.query(mockQueryText, mockTracker);

      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        0,
        "Generating query embedding..."
      );
      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        50,
        "Searching vector store..."
      );
      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        100,
        "Search complete"
      );
    });
  });

  describe("deleteDocument", () => {
    const mockDocumentId = "doc1";
    const mockChunks = [
      {
        documentId: "chunk1",
        score: 1.0,
        metadata: { documentId: "doc1" }
      },
      {
        documentId: "chunk2",
        score: 1.0,
        metadata: { documentId: "doc1" }
      }
    ];

    it("should delete document correctly", async () => {
      const engine = new RAGEngine(mockConfig);
      mockVectorStore.search.mockResolvedValue(mockChunks);
      mockVectorStore.delete.mockResolvedValue();

      await engine.deleteDocument(mockDocumentId);

      expect(createVectorStore).toHaveBeenCalledWith({
        provider: "qdrant",
        apiKey: "test-qdrant-key",
        baseURL: "http://localhost:6333",
        collection: "test-collection"
      });

      expect(mockVectorStore.search).toHaveBeenCalledWith(
        expect.any(Array),
        1000,
        0
      );
      expect(mockVectorStore.delete).toHaveBeenCalledWith(["chunk1"]);
      expect(mockVectorStore.delete).toHaveBeenCalledWith(["chunk2"]);
    });

    it("should handle deletion errors", async () => {
      const engine = new RAGEngine(mockConfig);
      mockVectorStore.search.mockResolvedValue(mockChunks);
      mockVectorStore.delete.mockRejectedValue(new Error("Deletion failed"));

      await expect(engine.deleteDocument(mockDocumentId)).rejects.toThrow(
        "Failed to delete document: Deletion failed"
      );
    });

    it("should report progress if tracker is provided", async () => {
      const engine = new RAGEngine(mockConfig);
      mockVectorStore.search.mockResolvedValue(mockChunks);
      mockVectorStore.delete.mockResolvedValue();

      const mockTracker = {
        onProgress: jest.fn()
      };

      await engine.deleteDocument(mockDocumentId, mockTracker);

      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        0,
        "Found 2 chunks to delete"
      );
      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        50,
        "Deleted chunk 1 of 2"
      );
      expect(mockTracker.onProgress).toHaveBeenCalledWith(
        100,
        "Deleted chunk 2 of 2"
      );
    });
  });
}); 