# Ragify.js

A powerful and flexible Retrieval-Augmented Generation (RAG) library for Node.js and TypeScript.

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
import { RAGEngine } from "ragify-js";

// Initialize the RAG engine
const rag = new RAGEngine({
  llmProvider: "openai",
  embeddingProvider: "openai",
  embeddingModel: "text-embedding-ada-002",
  vectorStore: "qdrant",
  apiKeys: {
    openai: "your-openai-key",
    qdrant: "your-qdrant-key"
  }
});

// Add progress tracking
const progressTracker = {
  onProgress: (progress: number, message: string) => {
    console.log(`Progress: ${progress.toFixed(1)}% - ${message}`);
  }
};

// Ingest documents
await rag.ingestDocuments([
  {
    id: "doc1",
    content: "Your document content here",
    metadata: { source: "example" }
  }
], progressTracker);

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
    qdrant: "your-qdrant-key"
  }
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
    qdrant: "your-qdrant-key"
  },
  chunkingConfig: {
    maxTokens: 200,
    overlap: 50,
    preserveSentences: true
  },
  searchConfig: {
    topK: 5,
    minScore: 0.7
  },
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000
  },
  vectorStoreConfig: {
    baseURL: "http://localhost:6333",
    collection: "ragify",
    cacheConfig: {
      maxSize: 1000,
      ttl: 5 * 60 * 1000 // 5 minutes
    }
  },
  maxConcurrentChunks: 10
};
```

## API Reference

### RAGEngine

The main class for interacting with the RAG system.

#### Constructor

```typescript
constructor(config: RAGEngineConfig)
```

#### Methods

##### ingestDocuments

```typescript
async ingestDocuments(
  docs: Document[],
  tracker?: ProgressTracker
): Promise<void>
```

Ingests documents into the RAG system.

##### query

```typescript
async query(
  queryText: string,
  tracker?: ProgressTracker
): Promise<QueryResult[]>
```

Queries the RAG system for relevant information.

##### deleteDocument

```typescript
async deleteDocument(
  documentId: string,
  tracker?: ProgressTracker
): Promise<void>
```

Deletes a document and all its chunks from the system.

##### clear

```typescript
async clear(tracker?: ProgressTracker): Promise<void>
```

Clears all documents from the system.

##### getStats

```typescript
async getStats(): Promise<{
  totalDocuments: number;
  totalChunks: number;
  averageChunksPerDocument: number;
  lastUpdateTime: Date;
}>
```

Gets statistics about the system.

### Types

#### Document

```typescript
interface Document {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}
```

#### QueryResult

```typescript
interface QueryResult {
  context: string;
  score: number;
  documentId: string;
  metadata?: Record<string, unknown>;
}
```

#### ProgressTracker

```typescript
interface ProgressTracker {
  onProgress: (progress: number, message: string) => void;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
