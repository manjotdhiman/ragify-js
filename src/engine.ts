import { createEmbedder, EmbeddingConfig } from "./embeddings";
import { createVectorStore, VectorStoreConfig } from "./vectorStores";
import type {
  Document,
  QueryResult,
  ProgressTracker,
  RAGEngineConfig,
  ChunkingConfig,
  SearchConfig,
  RetryConfig,
  VectorStoreProvider
} from "./types";
import { v4 as uuidv4 } from "uuid";

interface ChunkWithEmbedding {
  chunk: string;
  embedding: number[];
}

/**
 * RAG (Retrieval-Augmented Generation) Engine
 * Implements a flexible RAG system with configurable components
 */
export class RAGEngine {
  private embedding: EmbeddingConfig;
  private vectorStore: VectorStoreConfig;
  private chunkingConfig: ChunkingConfig;
  private searchConfig: SearchConfig;
  private retryConfig: RetryConfig;
  private maxConcurrentChunks: number;

  constructor(config: RAGEngineConfig) {
    this.embedding = {
      provider: config.embeddingProvider,
      apiKey: config.apiKeys[config.embeddingProvider] || "",
      model: config.embeddingModel
    };

    this.vectorStore = {
      provider: config.vectorStore as VectorStoreProvider,
      apiKey: config.apiKeys[config.vectorStore as keyof typeof config.apiKeys] || "",
      baseURL: config.vectorStoreConfig?.baseURL,
      collection: config.vectorStoreConfig?.collection,
      cacheConfig: config.vectorStoreConfig?.cacheConfig
    };

    this.chunkingConfig = config.chunkingConfig || {
      maxTokens: 200,
      overlap: 50,
      preserveSentences: true
    };

    this.searchConfig = config.searchConfig || {
      topK: 5,
      minScore: 0.7
    };

    this.retryConfig = config.retryConfig || {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    };

    this.maxConcurrentChunks = config.maxConcurrentChunks || 10;
  }

  /**
   * Process chunks in batches to avoid overwhelming the system
   */
  private async processChunksInBatches<T>(
    chunks: T[],
    processFn: (chunk: T, index: number) => Promise<void>
  ): Promise<void> {
    const batches = [];
    for (let i = 0; i < chunks.length; i += this.maxConcurrentChunks) {
      batches.push(chunks.slice(i, i + this.maxConcurrentChunks));
    }

    for (const batch of batches) {
      await Promise.all(batch.map(processFn));
    }
  }

  /**
   * Ingest documents into the RAG system
   * @param docs - Array of documents to ingest
   * @param tracker - Optional progress tracker
   * @throws Error if document ingestion fails
   */
  async ingestDocuments(
    docs: Document[],
    tracker?: ProgressTracker
  ): Promise<void> {
    const embedder = createEmbedder(this.embedding);
    const vectorStore = createVectorStore(this.vectorStore);

    let processedDocs = 0;
    const totalDocs = docs.length;

    for (const doc of docs) {
      try {
        // Chunk the document
        const chunks = this.chunkDocument(doc.content);
        
        // Generate embeddings
        const embeddings = await Promise.all(
          chunks.map(async (chunk) => ({
            chunk,
            embedding: await embedder.embed(chunk)
          }))
        );

        // Store in vector store
        await this.processChunksInBatches(
          embeddings,
          async ({ chunk, embedding }, index) => {
            await vectorStore.upsert([
              {
                id: uuidv4(),
                vector: embedding,
                payload: {
                  ...doc.metadata,
                  chunk,
                  documentId: doc.id
                }
              }
            ]);
          }
        );

        processedDocs++;
        if (tracker) {
          tracker.onProgress(
            (processedDocs / totalDocs) * 100,
            `Processed document ${processedDocs} of ${totalDocs}`
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to process document ${doc.id}: ${error.message}`);
        }
        throw new Error(`Failed to process document ${doc.id}: ${String(error)}`);
      }
    }
  }

  /**
   * Query the RAG system
   * @param queryText - The query text
   * @param tracker - Optional progress tracker
   * @returns Array of relevant results with context and scores
   * @throws Error if query fails
   */
  async query(
    queryText: string,
    tracker?: ProgressTracker
  ): Promise<QueryResult[]> {
    const embedder = createEmbedder(this.embedding);
    const vectorStore = createVectorStore(this.vectorStore);

    try {
      if (tracker) {
        tracker.onProgress(0, "Generating query embedding...");
      }

      const queryEmbedding = await embedder.embed(queryText);

      if (tracker) {
        tracker.onProgress(50, "Searching vector store...");
      }

      const results = await vectorStore.search(
        queryEmbedding,
        this.searchConfig.topK,
        this.searchConfig.minScore
      );

      if (tracker) {
        tracker.onProgress(100, "Search complete");
      }

      return results;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate query embedding: ${error.message}`);
      }
      throw new Error(`Failed to generate query embedding: ${String(error)}`);
    }
  }

  /**
   * Delete a document and all its chunks from the system
   * @param documentId - The ID of the document to delete
   * @param tracker - Optional progress tracker
   * @throws Error if deletion fails
   */
  async deleteDocument(
    documentId: string,
    tracker?: ProgressTracker
  ): Promise<void> {
    const vectorStore = createVectorStore(this.vectorStore);
    
    try {
      // Find all chunks associated with this document
      const chunksToDelete = await vectorStore.search(
        new Array(1536).fill(0), // Dummy vector for metadata search
        1000,
        0
      );

      const documentChunks = chunksToDelete
        .filter((result: { metadata?: { documentId?: string } }) => result.metadata?.documentId === documentId)
        .map((result: { documentId: string }) => result.documentId);

      if (tracker) {
        tracker.onProgress(0, `Found ${documentChunks.length} chunks to delete`);
      }

      await this.processChunksInBatches(
        documentChunks,
        async (chunkId, index) => {
          await vectorStore.delete([chunkId]);
          if (tracker) {
            tracker.onProgress(
              ((index + 1) / documentChunks.length) * 100,
              `Deleted chunk ${index + 1} of ${documentChunks.length}`
            );
          }
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }
      throw new Error(`Failed to delete document: ${String(error)}`);
    }
  }

  /**
   * Clear all documents from the system
   * @param tracker - Optional progress tracker
   * @throws Error if clearing fails
   */
  async clear(tracker?: ProgressTracker): Promise<void> {
    const vectorStore = createVectorStore(this.vectorStore);
    try {
      await vectorStore.clear();
      if (tracker) {
        tracker.onProgress(100, "Vector store cleared");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to clear vector store: ${error.message}`);
      }
      throw new Error(`Failed to clear vector store: ${String(error)}`);
    }
  }

  /**
   * Get statistics about the system
   * @returns Object containing system statistics
   */
  getStats(): {
    totalDocuments: number;
    totalChunks: number;
    lastUpdateTime: Date;
  } {
    // TODO: Implement actual stats collection
    return {
      totalDocuments: 0,
      totalChunks: 0,
      lastUpdateTime: new Date()
    };
  }

  private chunkDocument(content: string): string[] {
    // TODO: Implement document chunking
    return [content];
  }
}
