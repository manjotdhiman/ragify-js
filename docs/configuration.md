# Configuration

This guide covers all configuration options available in Ragify.js.

## Environment Variables

### Required Variables

```bash
# OpenAI API key for embeddings
OPENAI_API_KEY=your-openai-api-key

# Qdrant API key for vector store
QDRANT_API_KEY=your-qdrant-api-key
```

### Optional Variables

```bash
# Qdrant server URL (default: http://localhost:6333)
QDRANT_URL=your-qdrant-url
```

## Ragify Configuration

### Basic Configuration

```typescript
interface RagifyConfig {
  // Required
  embeddingProvider: EmbeddingProvider;

  // Optional
  collectionName?: string;      // Default: "default"
  qdrantUrl?: string;          // Default: "http://localhost:6333"
  qdrantApiKey?: string;       // Required if using Qdrant Cloud
  chunkingConfig?: ChunkingConfig;
}
```

### Chunking Configuration

```typescript
interface ChunkingConfig {
  // Optional
  chunkSize?: number;          // Default: 1000
  chunkOverlap?: number;       // Default: 200
  splitter?: (text: string) => string[]; // Custom text splitter
}
```

## Embedding Provider Configuration

### OpenAI Embeddings

```typescript
interface OpenAIEmbeddingsConfig {
  apiKey: string;
  model?: "text-embedding-3-small" | "text-embedding-3-large" | "text-embedding-ada-002";
  batchSize?: number;
}
```

## Vector Store Configuration

### Qdrant Configuration

```typescript
interface QdrantConfig {
  url?: string;
  apiKey?: string;
  collectionName?: string;
  distance?: "Cosine" | "Euclid" | "Dot" | "Manhattan";
}
```

## Configuration Examples

### Basic Setup

```typescript
const ragify = new Ragify({
  embeddingProvider: createEmbeddingProvider("openai", "your-api-key"),
  collectionName: "my-docs"
});
```

### Advanced Setup

```typescript
const ragify = new Ragify({
  embeddingProvider: createEmbeddingProvider("openai", "your-api-key", {
    model: "text-embedding-3-small",
    batchSize: 100
  }),
  collectionName: "my-docs",
  qdrantUrl: "https://your-qdrant-instance.com",
  qdrantApiKey: "your-qdrant-key",
  chunkingConfig: {
    chunkSize: 500,
    chunkOverlap: 100,
    splitter: (text) => text.split(/[.!?]+/).map(s => s.trim())
  }
});
```

### CLI Configuration

```bash
# Basic usage
npx ragify-js ingest file.txt

# With options
npx ragify-js ingest file.txt \
  --collection my-docs \
  --batch-size 100 \
  --chunk-size 500 \
  --chunk-overlap 100
```

## Environment Setup

### Development

```bash
# .env.development
OPENAI_API_KEY=your-dev-key
QDRANT_URL=http://localhost:6333
```

### Production

```bash
# .env.production
OPENAI_API_KEY=your-prod-key
QDRANT_URL=https://your-qdrant-instance.com
QDRANT_API_KEY=your-qdrant-key
```

## Best Practices

1. **Environment Variables**
   - Use different keys for development and production
   - Never commit API keys to version control
   - Use environment-specific .env files

2. **Chunking Configuration**
   - Adjust chunk size based on content type
   - Use overlap to maintain context
   - Consider custom splitters for specific needs

3. **Performance Tuning**
   - Adjust batch sizes based on API limits
   - Monitor memory usage with large documents
   - Use appropriate distance metrics

4. **Security**
   - Use environment variables for sensitive data
   - Implement proper access controls
   - Monitor API usage and costs 