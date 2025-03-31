# Ragify.js

A powerful Retrieval-Augmented Generation (RAG) library for JavaScript/TypeScript.

[![npm version](https://img.shields.io/npm/v/ragify-js.svg)](https://www.npmjs.com/package/ragify-js)
[![npm downloads](https://img.shields.io/npm/dm/ragify-js.svg)](https://www.npmjs.com/package/ragify-js)
[![License](https://img.shields.io/npm/l/ragify-js.svg)](https://github.com/manjotdhiman/ragify-js/blob/main/LICENSE)
[![CI](https://github.com/manjotdhiman/ragify-js/actions/workflows/ci.yml/badge.svg)](https://github.com/manjotdhiman/ragify-js/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://manjotdhiman.github.io/ragify-js/)
[![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/manjotdhiman/ragify-js/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/manjotdhiman/ragify-js/pulls)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/manjotdhiman/ragify-js/graphs/commit-activity)
[![GitHub stars](https://img.shields.io/github/stars/manjotdhiman/ragify-js.svg?style=social)](https://github.com/manjotdhiman/ragify-js/stargazers)

## Documentation

📚 [View the full documentation](https://manjotdhiman.github.io/ragify-js/)

A powerful and flexible Retrieval-Augmented Generation (RAG) library for Node.js and TypeScript. Built with OpenAI embeddings and Qdrant vector store.

## Features

- 🤖 OpenAI embeddings integration
- 📚 Qdrant vector store support
- 📝 Smart text chunking with sentence boundary preservation
- 🔍 Semantic search with configurable similarity thresholds
- 📦 TypeScript support with full type definitions
- 🚀 Easy-to-use CLI interface

## Installation

```bash
# Using npm
npm install ragify-js

# Using yarn
yarn add ragify-js

# Using pnpm
pnpm add ragify-js
```

## Version History

- **0.1.1**: Initial stable release
  - OpenAI embeddings integration
  - Qdrant vector store support
  - Smart text chunking
  - CLI interface

## Quick Start

```typescript
import { Ragify } from "ragify-js";
import { createEmbeddingProvider } from "ragify-js/factory";

// Initialize Ragify
const ragify = new Ragify({
  embeddingProvider: createEmbeddingProvider("openai", "your-openai-api-key"),
  collectionName: "my-documents",
  qdrantApiKey: "your-qdrant-api-key",
});

// Initialize the vector store
await ragify.initialize();

// Ingest documents
await ragify.ingest({
  text: "Your document text here...",
  metadata: { source: "example" }
});

// Query the documents
const results = await ragify.query("Your query here", {
  topK: 5,
  threshold: 0.7
});

console.log(results);
```

## CLI Usage

```bash
# Ingest documents
npx ragify-js ingest file1.txt file2.txt --collection my-docs

# Query documents
npx ragify-js query "Your question here" --collection my-docs --top-k 5
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `QDRANT_API_KEY`: Your Qdrant API key

### Options

#### RagifyConfig

```typescript
interface RagifyConfig {
  embeddingProvider: EmbeddingProvider;
  collectionName?: string;
  qdrantUrl?: string;
  qdrantApiKey?: string;
  chunkingConfig?: ChunkingConfig;
}
```

#### ChunkingConfig

```typescript
interface ChunkingConfig {
  chunkSize?: number;
  chunkOverlap?: number;
  splitter?: (text: string) => string[];
}
```

## API Reference

### Ragify Class

#### Methods

- `initialize()`: Initialize the vector store collection
- `ingest(doc: string | Document, options?: IngestOptions)`: Ingest a document
- `query(query: string, options?: QueryOptions)`: Query the vector store

### CLI Commands

- `ingest <files...>`: Ingest one or more files
- `query <query>`: Query the vector store

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
