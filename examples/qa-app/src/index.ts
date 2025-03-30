import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { RAGEngine } from "ragify-js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize RAG engine
const rag = new RAGEngine({
  llmProvider: "openai",
  embeddingProvider: "openai",
  embeddingModel: "text-embedding-ada-002",
  vectorStore: "qdrant",
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || "",
    qdrant: process.env.QDRANT_API_KEY || ""
  },
  chunkingConfig: {
    maxTokens: 200,
    overlap: 50,
    preserveSentences: true
  },
  searchConfig: {
    topK: 5,
    minScore: 0.7
  }
});

// Progress tracker
const progressTracker = {
  onProgress: (progress: number, message: string) => {
    console.log(`Progress: ${progress.toFixed(1)}% - ${message}`);
  }
};

// Routes

// Add a document
app.post("/documents", async (req: Request, res: Response) => {
  try {
    const { content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const document = {
      id: uuidv4(),
      content,
      metadata: metadata || {}
    };

    await rag.ingestDocuments([document], progressTracker);
    
    res.json({
      message: "Document added successfully",
      documentId: document.id
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

    const results = await rag.query(query, progressTracker);
    
    res.json({
      results: results.map(result => ({
        answer: result.metadata?.chunk as string || "",
        confidence: result.score,
        documentId: result.documentId,
        metadata: result.metadata
      }))
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
    await rag.clear(progressTracker);
    res.json({ message: "All documents cleared successfully" });
  } catch (error) {
    console.error("Error clearing documents:", error);
    res.status(500).json({ error: "Failed to clear documents" });
  }
});

// Get system stats
app.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await rag.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to get system stats" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 