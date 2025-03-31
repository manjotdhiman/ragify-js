# Getting Started with Ragify.js

This guide will help you get started with Ragify.js, from installation to basic usage.

## Installation

Ragify.js can be installed using your preferred package manager:

```bash
# Using npm
npm install ragify-js

# Using yarn
yarn add ragify-js

# Using pnpm
pnpm add ragify-js
```

## Quick Start

Here's a simple example to get you started:

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

## Basic Usage

### 1. Setting Up Environment Variables

Before using Ragify.js, make sure to set up your environment variables:

```bash
# .env file
OPENAI_API_KEY=your-openai-api-key
QDRANT_API_KEY=your-qdrant-api-key
```

### 2. Using the CLI

Ragify.js provides a convenient CLI interface:

```bash
# Ingest documents
npx ragify-js ingest file1.txt file2.txt --collection my-docs

# Query documents
npx ragify-js query "Your question here" --collection my-docs --top-k 5
```

### 3. Working with Documents

You can ingest documents in various formats:

```typescript
// Simple text document
await ragify.ingest("This is a simple text document");

// Document with metadata
await ragify.ingest({
  text: "This is a document with metadata",
  metadata: {
    source: "example",
    author: "John Doe",
    date: "2024-02-20"
  }
});
```

### 4. Querying Documents

Query your documents with various options:

```typescript
// Basic query
const results = await ragify.query("What is the capital of France?");

// Query with options
const results = await ragify.query("What is the capital of France?", {
  topK: 5,        // Number of results to return
  threshold: 0.7   // Minimum similarity score
});
```

## Next Steps

- Learn about [Core Concepts](./core-concepts.md)
- Explore [Configuration Options](./configuration.md)
- Check out [Advanced Topics](./advanced-topics.md)
- View [Examples](./examples.md) 