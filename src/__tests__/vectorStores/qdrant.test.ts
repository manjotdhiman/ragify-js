import { jest } from "@jest/globals";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantStore } from "../../vectorStores/qdrant";

jest.mock("@qdrant/js-client-rest");

describe("QdrantStore", () => {
  const mockApiKey = "test-api-key";
  const mockCollection = "test-collection";

  let store: QdrantStore;
  let mockClient: jest.Mocked<QdrantClient>;

  beforeEach(() => {
    mockClient = {
      getCollections: jest.fn(),
      createCollection: jest.fn(),
      upsert: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      deleteCollection: jest.fn(),
    } as unknown as jest.Mocked<QdrantClient>;

    (QdrantClient as unknown as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with provided configuration and create collection if needed", async () => {
      mockClient.getCollections.mockResolvedValueOnce({
        collections: [],
      });

      mockClient.createCollection.mockResolvedValueOnce(true);

      store = new QdrantStore(mockApiKey, mockCollection);

      expect(QdrantClient).toHaveBeenCalledWith({
        url: "http://localhost:6333",
        apiKey: mockApiKey,
      });

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockClient.getCollections).toHaveBeenCalled();
      expect(mockClient.createCollection).toHaveBeenCalledWith(mockCollection, {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      });
      expect(store).toBeDefined();
    });

    it("should not create collection if it already exists", async () => {
      mockClient.getCollections.mockResolvedValueOnce({
        collections: [{ name: mockCollection }],
      });

      store = new QdrantStore(mockApiKey, mockCollection);

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockClient.getCollections).toHaveBeenCalled();
      expect(mockClient.createCollection).not.toHaveBeenCalled();
    });
  });

  describe("upsert", () => {
    const mockPoints = [
      {
        id: "1",
        vector: [0.1, 0.2],
        payload: { text: "test" },
      },
    ];

    beforeEach(() => {
      mockClient.getCollections.mockResolvedValue({
        collections: [{ name: mockCollection }],
      });
      store = new QdrantStore(mockApiKey, mockCollection);
    });

    it("should upsert points successfully", async () => {
      mockClient.upsert.mockResolvedValueOnce({
        operation_id: 1,
        status: "completed",
      });

      await store.upsert(mockPoints);

      expect(mockClient.upsert).toHaveBeenCalledWith(mockCollection, {
        points: mockPoints,
      });
    });
  });

  describe("search", () => {
    const mockVector = [0.1, 0.2];

    beforeEach(() => {
      mockClient.getCollections.mockResolvedValue({
        collections: [{ name: mockCollection }],
      });
      store = new QdrantStore(mockApiKey, mockCollection);
    });

    it("should search for similar vectors", async () => {
      const mockResults = [
        {
          id: "1",
          version: 1,
          score: 0.9,
          payload: { text: "test" },
        },
      ];

      mockClient.search.mockResolvedValueOnce(mockResults);

      const result = await store.search(mockVector, 10, 0.7);

      expect(mockClient.search).toHaveBeenCalledWith(mockCollection, {
        vector: mockVector,
        limit: 10,
        score_threshold: 0.7,
      });
      expect(result).toEqual([
        {
          documentId: "1",
          score: 0.9,
          metadata: { text: "test" },
        },
      ]);
    });
  });

  describe("delete", () => {
    beforeEach(() => {
      mockClient.getCollections.mockResolvedValue({
        collections: [{ name: mockCollection }],
      });
      store = new QdrantStore(mockApiKey, mockCollection);
    });

    it("should delete points by IDs", async () => {
      mockClient.delete.mockResolvedValueOnce({
        operation_id: 1,
        status: "completed",
      });

      await store.delete(["1", "2"]);

      expect(mockClient.delete).toHaveBeenCalledWith(mockCollection, {
        points: ["1", "2"],
      });
    });
  });

  describe("clear", () => {
    beforeEach(() => {
      mockClient.getCollections.mockResolvedValue({
        collections: [{ name: mockCollection }],
      });
      store = new QdrantStore(mockApiKey, mockCollection);
    });

    it("should delete the collection", async () => {
      mockClient.deleteCollection.mockResolvedValueOnce(true);

      await store.clear();

      expect(mockClient.deleteCollection).toHaveBeenCalledWith(mockCollection);
    });
  });
});
