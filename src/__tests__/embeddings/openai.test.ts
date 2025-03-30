import { jest } from "@jest/globals";
import { OpenAI } from "openai";
import { OpenAIEmbedder } from "../../embeddings/openai";
import type { CreateEmbeddingResponse } from "openai/resources";

jest.mock("openai");

describe("OpenAIEmbedder", () => {
  const mockApiKey = "test-api-key";
  const mockModel = "text-embedding-ada-002";
  let embedder: OpenAIEmbedder;
  let mockClient: jest.Mocked<OpenAI>;

  beforeEach(() => {
    mockClient = {
      embeddings: {
        create: jest.fn()
      }
    } as unknown as jest.Mocked<OpenAI>;

    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockClient);
    embedder = new OpenAIEmbedder(mockApiKey, mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with provided configuration", () => {
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: mockApiKey
      });
      expect(embedder).toBeDefined();
    });
  });

  describe("embed", () => {
    const mockText = "test text";
    const mockEmbedding = [0.1, 0.2, 0.3];

    it("should generate embedding for text", async () => {
      const mockResponse: CreateEmbeddingResponse = {
        data: [
          {
            embedding: mockEmbedding,
            index: 0,
            object: "embedding"
          }
        ],
        model: mockModel,
        object: "list",
        usage: {
          prompt_tokens: 1,
          total_tokens: 1
        }
      };

      mockClient.embeddings.create.mockResolvedValueOnce(mockResponse);

      const result = await embedder.embed(mockText);

      expect(mockClient.embeddings.create).toHaveBeenCalledWith({
        model: mockModel,
        input: mockText
      });
      expect(result).toEqual(mockEmbedding);
    }, 10000);

    it("should handle API errors", async () => {
      const mockError = new Error("API Error");
      mockClient.embeddings.create.mockRejectedValueOnce(mockError);

      await expect(embedder.embed(mockText)).rejects.toThrow(
        "OpenAI API error: API Error"
      );
    }, 10000);
  });

  describe("embedBatch", () => {
    const mockTexts = ["test text 1", "test text 2"];
    const mockEmbeddings = [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6]
    ];

    it("should generate embeddings for multiple texts", async () => {
      const mockResponse: CreateEmbeddingResponse = {
        data: mockEmbeddings.map((embedding, index) => ({
          embedding,
          index,
          object: "embedding"
        })),
        model: mockModel,
        object: "list",
        usage: {
          prompt_tokens: 2,
          total_tokens: 2
        }
      };

      mockClient.embeddings.create.mockResolvedValueOnce(mockResponse);

      const result = await embedder.embedBatch(mockTexts);

      expect(mockClient.embeddings.create).toHaveBeenCalledWith({
        model: mockModel,
        input: mockTexts
      });
      expect(result).toEqual(mockEmbeddings);
    }, 10000);

    it("should handle API errors in batch processing", async () => {
      const mockError = new Error("API Error");
      mockClient.embeddings.create.mockRejectedValueOnce(mockError);

      await expect(embedder.embedBatch(mockTexts)).rejects.toThrow(
        "OpenAI API error: API Error"
      );
    }, 10000);
  });
}); 