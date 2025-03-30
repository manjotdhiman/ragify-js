import { chunkText } from "./utils/chunker";
import type { Embedder, VectorStore, ProgressTracker, ChunkingConfig } from "./types";
import { v4 as uuidv4 } from "uuid";

interface ChunkWithMetadata {
  id: string;
  text: string;
  metadata: {
    documentId: string;
  };
}

const defaultChunkingConfig: ChunkingConfig = {
  maxTokens: 1000,
  overlap: 200,
  preserveSentences: true,
};

/**
 * Process chunks in batches with progress tracking
 */
async function processChunksInBatches<T>(
  items: T[],
  batchSize: number,
  processItem: (item: T) => Promise<void>,
  tracker?: ProgressTracker
): Promise<void> {
  const totalItems = items.length;
  let processedItems = 0;

  for (let i = 0; i < totalItems; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(item => processItem(item)));
    processedItems += batch.length;

    if (tracker?.onProgress) {
      tracker.onProgress(processedItems / totalItems, "Processing chunks");
    }
  }
}

/**
 * RAG Engine
 * Manages document ingestion, querying, and deletion
 */
export class RAGEngine {
  private embedder: Embedder;
  private vectorStore: VectorStore;
  private chunkingConfig: ChunkingConfig;

  constructor(
    embedder: Embedder,
    vectorStore: VectorStore,
    chunkingConfig = defaultChunkingConfig
  ) {
    this.embedder = embedder;
    this.vectorStore = vectorStore;
    this.chunkingConfig = chunkingConfig;
  }

  /**
   * Ingest documents into the vector store
   */
  async ingestDocuments(
    documents: Array<{ id: string; text: string }>,
    tracker?: ProgressTracker
  ): Promise<void> {
    const chunks = documents.flatMap(doc => {
      const textChunks = chunkText(doc.text, {
        maxTokens: this.chunkingConfig.maxTokens,
        overlap: this.chunkingConfig.overlap,
        preserveSentences: this.chunkingConfig.preserveSentences,
      });

      return textChunks.map(chunk => ({
        id: uuidv4().replace(/-/g, ""),
        text: chunk,
        metadata: { documentId: doc.id },
      }));
    });

    if (tracker?.onProgress) {
      tracker.onProgress(0.5, "Chunking documents");
    }

    const batchSize = 10;
    await processChunksInBatches(
      chunks,
      batchSize,
      async (chunk: ChunkWithMetadata) => {
        const embedding = await this.embedder.embed(chunk.text);
        await this.vectorStore.upsert([
          {
            id: chunk.id,
            vector: embedding,
            payload: { text: chunk.text, ...chunk.metadata },
          },
        ]);
      },
      tracker
    );
  }

  /**
   * Query the vector store for similar documents
   */
  async query(
    query: string,
    topK = 5,
    minScore = 0.7,
    tracker?: ProgressTracker
  ): Promise<Array<{ documentId: string; text: string; score: number }>> {
    if (tracker?.onProgress) {
      tracker.onProgress(0.5, "Generating query embedding");
    }

    const queryEmbedding = await this.embedder.embed(query);

    if (tracker?.onProgress) {
      tracker.onProgress(1, "Searching vector store");
    }

    const results = await this.vectorStore.search(queryEmbedding, topK, minScore);

    return results.map(result => ({
      documentId: result.metadata?.documentId as string,
      text: result.metadata?.text as string,
      score: result.score,
    }));
  }

  /**
   * Delete a document from the vector store
   */
  async deleteDocument(documentId: string, tracker?: ProgressTracker): Promise<void> {
    if (tracker?.onProgress) {
      tracker.onProgress(0.5, "Deleting document");
    }

    const queryEmbedding = await this.embedder.embed(documentId);
    const results = await this.vectorStore.search(queryEmbedding, 100, 0);

    const chunkIds = results
      .filter(result => result.metadata?.documentId === documentId)
      .map(result => result.documentId);

    await this.vectorStore.delete(chunkIds);

    if (tracker?.onProgress) {
      tracker.onProgress(1, "Document deleted");
    }
  }
}
