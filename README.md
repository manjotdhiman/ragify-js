# Ragify.js

A powerful and flexible Retrieval-Augmented Generation (RAG) library for Node.js and TypeScript.
<img width="905" alt="image" src="https://github.com/user-attachments/assets/0517967d-fdcd-4887-8642-beba3d55be18" />

## Features

- 🔄 **Multiple Embedding Providers**

  - OpenAI (default)
  - Cohere (coming soon)
  - HuggingFace (coming soon)

- 💾 **Multiple Vector Stores**

  - Qdrant (default)
  - Pinecone (coming soon)
  - Milvus (coming soon)

- 🚀 **Performance Optimizations**

  - Batch processing
  - Caching support
  - Rate limiting
  - Retry logic with exponential backoff

- 📊 **Progress Tracking**

  - Real-time progress updates
  - Detailed status messages
  - Optional progress callbacks

- 🔧 **Flexible Configuration**
  - Customizable chunking
  - Configurable search parameters
  - Adjustable concurrency
  - Cache settings

## Installation

```bash
yarn add ragify-js
```

## Quick Start

```typescript
import { createRAGEngine } from "ragify-js";

// Initialize the RAG engine
const rag = createRAGEngine({
  llmProvider: "openai",
  embeddingProvider: "openai",
  embeddingModel: "text-embedding-ada-002",
  vectorStore: "qdrant",
  apiKeys: {
    openai: "your-openai-key",
    qdrant: "your-qdrant-key",
  },
});

// Add progress tracking
const progressTracker = {
  onProgress: (progress: number, message: string) => {
    console.log(`Progress: ${progress.toFixed(1)}% - ${message}`);
  },
};

// Ingest documents
await rag.ingestDocuments(
  [
    {
      id: "doc1",
      content: "Your document content here",
      metadata: { source: "example" },
    },
  ],
  progressTracker
);

// Query the system
const results = await rag.query("Your question here", progressTracker);
console.log(results);
```

## Configuration

### Basic Configuration

```typescript
const config = {
  llmProvider: "openai",
  embeddingProvider: "openai",
  vectorStore: "qdrant",
  apiKeys: {
    openai: "your-openai-key",
    qdrant: "your-qdrant-key",
  },
};
```

### Advanced Configuration

```typescript
const config = {
  llmProvider: "openai",
  embeddingProvider: "openai",
  embeddingModel: "text-embedding-ada-002",
  vectorStore: "qdrant",
  apiKeys: {
    openai: "your-openai-key",
    qdrant: "your-qdrant-key",
  },
  chunkingConfig: {
    maxTokens: 200,
    overlap: 50,
    preserveSentences: true,
  },
  searchConfig: {
    topK: 5,
    minScore: 0.7,
  },
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
  },
  vectorStoreConfig: {
    baseURL: "http://localhost:6333",
    collection: "ragify",
    cacheConfig: {
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  },
  maxConcurrentChunks: 10,
};
```

## API Reference

### createRAGEngine

The main factory function for creating a RAG engine instance.

#### Parameters

- `config`: Configuration object for the RAG engine
  ```typescript
  interface RAGEngineConfig {
    llmProvider: "openai";
    embeddingProvider: "openai" | "cohere" | "huggingface";
    embeddingModel?: string;
    vectorStore: "qdrant" | "pinecone" | "milvus";
    apiKeys: {
      openai: string;
      qdrant: string;
      cohere?: string;
      huggingface?: string;
    };
    chunkingConfig?: {
      maxTokens: number;
      overlap: number;
      preserveSentences: boolean;
    };
    searchConfig?: {
      topK: number;
      minScore: number;
    };
    retryConfig?: {
      maxRetries: number;
      initialDelay: number;
      maxDelay: number;
    };
    vectorStoreConfig?: {
      baseURL: string;
      collection: string;
      cacheConfig?: {
        maxSize: number;
        ttl: number;
      };
    };
    maxConcurrentChunks?: number;
  }
  ```

#### Returns

A configured RAG engine instance.

### Methods

#### ingestDocuments

```typescript
async ingestDocuments(
  docs: Document[],
  tracker?: ProgressTracker
): Promise<void>
```

Ingests documents into the RAG system.

##### Parameters

- `docs`: Array of documents to ingest
  ```typescript
  interface Document {
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
  }
  ```
- `tracker`: Optional progress tracker
  ```typescript
  interface ProgressTracker {
    onProgress: (progress: number, message: string) => void;
  }
  ```

##### Returns

Promise that resolves when all documents are ingested.

#### query

```typescript
async query(
  queryText: string,
  tracker?: ProgressTracker
): Promise<QueryResult[]>
```

Queries the RAG system for relevant information.

##### Parameters

- `queryText`: The query text to search for
- `tracker`: Optional progress tracker

##### Returns

Promise that resolves to an array of query results:

```typescript
interface QueryResult {
  context: string;
  score: number;
  documentId: string;
  metadata?: Record<string, unknown>;
}
```

#### deleteDocument

```typescript
async deleteDocument(
  documentId: string,
  tracker?: ProgressTracker
): Promise<void>
```

Deletes a document and all its chunks from the system.

#### clear

```typescript
async clear(tracker?: ProgressTracker): Promise<void>
```

Clears all documents from the system.

#### getStats

```typescript
async getStats(): Promise<{
  totalDocuments: number;
  totalChunks: number;
  averageChunksPerDocument: number;
  lastUpdateTime: Date;
}>
```

Gets statistics about the system.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
