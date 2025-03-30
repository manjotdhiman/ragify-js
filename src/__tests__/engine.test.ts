import { jest } from "@jest/globals";
import { createEmbedder } from "../embeddings";
import { createVectorStore } from "../vectorStores";
import { createRAGEngine } from "../factory";
import type { RAGEngineConfig, Embedder, VectorStore } from "../types";

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
      qdrant: "test-qdrant-key",
    },
    vectorStoreConfig: {
      collection: "test-collection",
    },
  };

  const mockEmbedder: jest.Mocked<Embedder> = {
    embed: jest.fn(),
    embedBatch: jest.fn(),
  };

  const mockVectorStore: jest.Mocked<VectorStore> = {
    upsert: jest.fn(),
    search: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createEmbedder as jest.Mock).mockReturnValue(mockEmbedder);
    (createVectorStore as jest.Mock).mockReturnValue(mockVectorStore);
  });

  describe("ingestDocuments", () => {
    const mockDocs = [
      {
        id: "doc1",
        text: "This is a test document.",
        metadata: { source: "test" },
      },
    ];

    it("should process and store documents correctly", async () => {
      const engine = createRAGEngine(mockConfig);
      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbedder.embed.mockResolvedValue(mockEmbedding);
      mockVectorStore.upsert.mockResolvedValue();

      await engine.ingestDocuments(mockDocs);

      expect(createEmbedder).toHaveBeenCalledWith({
        provider: "openai",
        apiKey: "test-openai-key",
        model: "text-embedding-ada-002",
      });

      expect(createVectorStore).toHaveBeenCalledWith({
        provider: "qdrant",
        apiKey: "test-qdrant-key",
        collection: "test-collection",
      });

      expect(mockEmbedder.embed).toHaveBeenCalledWith("This is a test document.");
      expect(mockVectorStore.upsert).toHaveBeenCalledWith([
        {
          id: expect.any(String),
          payload: {
            documentId: "doc1",
            text: "This is a test document.",
          },
          vector: mockEmbedding,
        },
      ]);
    });

    it("should handle errors during ingestion", async () => {
      const engine = createRAGEngine(mockConfig);
      mockEmbedder.embed.mockRejectedValue(new Error("Embedding failed"));

      await expect(engine.ingestDocuments(mockDocs)).rejects.toThrow("Embedding failed");
    });

    it("should report progress if tracker is provided", async () => {
      const engine = createRAGEngine(mockConfig);
      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbedder.embed.mockResolvedValue(mockEmbedding);
      mockVectorStore.upsert.mockResolvedValue();

      const mockTracker = {
        onProgress: jest.fn(),
      };

      await engine.ingestDocuments(mockDocs, mockTracker);

      expect(mockTracker.onProgress).toHaveBeenCalledWith(0.5, "Chunking documents");
      expect(mockTracker.onProgress).toHaveBeenCalledWith(1, "Processing chunks");
    });
  });

  describe("query", () => {
    const mockQueryText = "test query";
    const mockQueryEmbedding = [0.1, 0.2, 0.3];

    it("should perform search correctly", async () => {
      const engine = createRAGEngine(mockConfig);
      mockEmbedder.embed.mockResolvedValue(mockQueryEmbedding);
      mockVectorStore.search.mockResolvedValue([
        {
          documentId: "doc1",
          score: 0.9,
          metadata: {
            documentId: "doc1",
            text: "This is a test document.",
            source: "test",
          },
        },
      ]);

      const results = await engine.query(mockQueryText, 5, 0.7);

      expect(createEmbedder).toHaveBeenCalledWith({
        provider: "openai",
        apiKey: "test-openai-key",
        model: "text-embedding-ada-002",
      });

      expect(createVectorStore).toHaveBeenCalledWith({
        provider: "qdrant",
        apiKey: "test-qdrant-key",
        collection: "test-collection",
      });

      expect(mockEmbedder.embed).toHaveBeenCalledWith(mockQueryText);
      expect(mockVectorStore.search).toHaveBeenCalledWith(mockQueryEmbedding, 5, 0.7);
      expect(results).toEqual([
        {
          documentId: "doc1",
          score: 0.9,
          text: "This is a test document.",
        },
      ]);
    });

    it("should handle search errors", async () => {
      const engine = createRAGEngine(mockConfig);
      mockEmbedder.embed.mockRejectedValue(new Error("Search failed"));

      await expect(engine.query(mockQueryText, 5, 0.7)).rejects.toThrow("Search failed");
    });

    it("should report progress if tracker is provided", async () => {
      const engine = createRAGEngine(mockConfig);
      mockEmbedder.embed.mockResolvedValue(mockQueryEmbedding);
      mockVectorStore.search.mockResolvedValue([
        {
          documentId: "doc1",
          score: 0.9,
          text: "This is a test document.",
        },
      ]);

      const mockTracker = {
        onProgress: jest.fn(),
      };

      await engine.query(mockQueryText, 5, 0.7, mockTracker);

      expect(mockTracker.onProgress).toHaveBeenCalledWith(0.5, "Generating query embedding");
      expect(mockTracker.onProgress).toHaveBeenCalledWith(1, "Searching vector store");
    });
  });

  describe("deleteDocument", () => {
    const mockDocumentId = "doc1";
    const mockChunks = [
      {
        documentId: "chunk1",
        score: 1.0,
        metadata: { documentId: "doc1" },
      },
      {
        documentId: "chunk2",
        score: 1.0,
        metadata: { documentId: "doc1" },
      },
    ];

    it("should delete document correctly", async () => {
      const engine = createRAGEngine(mockConfig);
      mockVectorStore.search.mockResolvedValue(mockChunks);
      mockVectorStore.delete.mockResolvedValue();

      await engine.deleteDocument(mockDocumentId);

      expect(createVectorStore).toHaveBeenCalledWith({
        provider: "qdrant",
        apiKey: "test-qdrant-key",
        collection: "test-collection",
      });

      expect(mockVectorStore.search).toHaveBeenCalledWith(expect.any(Array), 100, 0);
      expect(mockVectorStore.delete).toHaveBeenCalledWith(["chunk1", "chunk2"]);
    });

    it("should handle deletion errors", async () => {
      const engine = createRAGEngine(mockConfig);
      mockVectorStore.search.mockResolvedValue(mockChunks);
      mockVectorStore.delete.mockRejectedValue(new Error("Deletion failed"));

      await expect(engine.deleteDocument(mockDocumentId)).rejects.toThrow("Deletion failed");
    });

    it("should report progress if tracker is provided", async () => {
      const engine = createRAGEngine(mockConfig);
      mockVectorStore.search.mockResolvedValue(mockChunks);
      mockVectorStore.delete.mockResolvedValue();

      const mockTracker = {
        onProgress: jest.fn(),
      };

      await engine.deleteDocument(mockDocumentId, mockTracker);

      expect(mockTracker.onProgress).toHaveBeenCalledWith(0.5, "Deleting document");
      expect(mockTracker.onProgress).toHaveBeenCalledWith(1, "Document deleted");
    });
  });
});
