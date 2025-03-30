import { jest } from "@jest/globals";
import { OpenAIEmbedder } from "../../embeddings/openai";

describe("OpenAIEmbedder", () => {
  const mockApiKey = "test-api-key";
  const mockModel = "text-embedding-ada-002";
  let embedder: OpenAIEmbedder;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(async () => {
      throw new Error("Mock not implemented");
    }) as unknown as typeof fetch;
    embedder = new OpenAIEmbedder(mockApiKey, mockModel);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with provided configuration", () => {
      expect(embedder).toBeDefined();
    });

    it("should throw error if API key is not provided", () => {
      expect(() => new OpenAIEmbedder("")).toThrow("OpenAI API key is required");
    });
  });

  describe("embed", () => {
    const mockText = "test text";
    const mockEmbedding = [0.1, 0.2, 0.3];

    it("should generate embedding for text", async () => {
      const mockJsonPromise = Promise.resolve({
        data: [
          {
            embedding: mockEmbedding,
            index: 0,
            object: "embedding",
          },
        ],
        model: mockModel,
        object: "list",
        usage: {
          prompt_tokens: 1,
          total_tokens: 1,
        },
      });

      const mockResponse = {
        ok: true,
        json: () => mockJsonPromise,
      } as unknown as Response;

      (global.fetch as jest.Mock).mockImplementation(async () => mockResponse);

      const result = await embedder.embed(mockText);

      expect(global.fetch).toHaveBeenCalledWith("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          input: mockText,
          model: mockModel,
        }),
      });
      expect(result).toEqual(mockEmbedding);
    }, 10000);

    it("should handle API errors", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Unauthorized",
      } as unknown as Response;

      (global.fetch as jest.Mock).mockImplementation(async () => mockResponse);

      await expect(embedder.embed(mockText)).rejects.toThrow(
        "Failed to generate embedding: OpenAI API error: Unauthorized"
      );
    }, 10000);
  });

  describe("embedBatch", () => {
    const mockTexts = ["text1", "text2"];
    const mockEmbeddings = [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ];

    it("should generate embeddings for multiple texts", async () => {
      const mockJsonPromise = Promise.resolve({
        data: mockEmbeddings.map((embedding, index) => ({
          embedding,
          index,
          object: "embedding",
        })),
        model: mockModel,
        object: "list",
        usage: {
          prompt_tokens: 2,
          total_tokens: 2,
        },
      });

      const mockResponse = {
        ok: true,
        json: () => mockJsonPromise,
      } as unknown as Response;

      (global.fetch as jest.Mock).mockImplementation(async () => mockResponse);

      const result = await embedder.embedBatch(mockTexts);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockApiKey}`,
        },
        body: JSON.stringify({
          input: mockTexts,
          model: mockModel,
        }),
      });
      expect(result).toEqual(mockEmbeddings);
    }, 10000);

    it("should handle API errors in batch processing", async () => {
      const mockResponse = {
        ok: false,
        statusText: "Unauthorized",
      } as unknown as Response;

      (global.fetch as jest.Mock).mockImplementation(async () => mockResponse);

      await expect(embedder.embedBatch(mockTexts)).rejects.toThrow(
        "Failed to generate embeddings: OpenAI API error: Unauthorized"
      );
    }, 10000);
  });
});
