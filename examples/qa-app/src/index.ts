import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { createRAGEngine as createRAGEngineType } from "ragify-js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize RAG engine
let rag: ReturnType<typeof createRAGEngineType>;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
(async () => {
  try {
    const { createRAGEngine } = await import("ragify-js");
    rag = createRAGEngine({
      llmProvider: "openai",
      embeddingProvider: "openai",
      vectorStore: "qdrant",
      apiKeys: {
        openai: process.env.OPENAI_API_KEY || "",
        qdrant: process.env.QDRANT_API_KEY || "",
      },
      vectorStoreConfig: {
        baseURL: process.env.QDRANT_URL || "http://localhost:6333",
        collection: "qa-app",
      },
    });
    console.log("RAG engine initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RAG engine:", error);
    process.exit(1);
  }
})();

// Progress tracker for operations
const progressTracker = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onProgress: (progress: number, message: string) => {
    console.log(`Progress: ${progress.toFixed(1)}% - ${message}`);
  },
};

// Add a document
app.post("/documents", async (req: Request, res: Response) => {
  try {
    const { content, metadata } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const document = {
      id: uuidv4(),
      text: content,
      metadata: metadata || {},
    };

    await rag.ingestDocuments([document], progressTracker);

    res.json({
      message: "Document added successfully",
      documentId: document.id,
    });
  } catch (error) {
    console.error("Error adding document:", error);
    res.status(500).json({ error: "Failed to add document" });
  }
});

// Query documents
app.post("/query", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const results = await rag.query(query, 5, 0.7, progressTracker);

    res.json({
      results: results.map((result: { text: string; score: number; documentId: string }) => ({
        answer: result.text,
        confidence: result.score,
        documentId: result.documentId,
      })),
    });
  } catch (error) {
    console.error("Error querying documents:", error);
    res.status(500).json({ error: "Failed to query documents" });
  }
});

// Delete a document
app.delete("/documents/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await rag.deleteDocument(id, progressTracker);
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// Clear all documents
app.delete("/documents", async (_req: Request, res: Response) => {
  try {
    // Since clear is not available on RAGEngine, we'll remove this endpoint
    res.status(501).json({ error: "Clear operation is not supported" });
  } catch (error) {
    console.error("Error clearing documents:", error);
    res.status(500).json({ error: "Failed to clear documents" });
  }
});

// Get system stats
app.get("/stats", async (_req: Request, res: Response) => {
  try {
    // Since getStats is not available on RAGEngine, we'll remove this endpoint
    res.status(501).json({ error: "Stats operation is not supported" });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to get system stats" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
