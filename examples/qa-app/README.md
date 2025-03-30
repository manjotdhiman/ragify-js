# Ragify.js Q&A Demo

A simple demonstration of Ragify.js using a document Q&A system with a web interface.

## Features

- Document ingestion with metadata support
- Natural language question answering
- Real-time progress tracking
- Simple web interface
- RESTful API

## Prerequisites

- Node.js 16 or higher
- Yarn package manager
- OpenAI API key
- Qdrant API key

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Configure environment variables:

   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```
     OPENAI_API_KEY=your-openai-api-key
     QDRANT_API_KEY=your-qdrant-api-key
     ```

3. Start the server:

   ```bash
   yarn dev
   ```

4. Open the web interface:
   - Navigate to `http://localhost:3000` in your browser

## API Endpoints

### Add Document

```http
POST /documents
Content-Type: application/json

{
  "content": "Your document content",
  "metadata": {
    "source": "example",
    "author": "John Doe"
  }
}
```

### Ask Question

```http
POST /query
Content-Type: application/json

{
  "query": "Your question here"
}
```

### Delete Document

```http
DELETE /documents/:documentId
```

### Get System Stats

```http
GET /stats
```

## Example Usage

1. Add a document:

   ```json
   {
     "content": "Ragify.js is a powerful RAG library for Node.js and TypeScript. It supports multiple embedding providers and vector stores, making it easy to build context-aware AI applications.",
     "metadata": {
       "source": "documentation",
       "category": "introduction"
     }
   }
   ```

2. Ask a question:
   ```json
   {
     "query": "What is Ragify.js?"
   }
   ```

## Development

- The server uses TypeScript and Express
- The frontend is a simple HTML/JavaScript application
- Hot reloading is enabled for development
- TypeScript strict mode is enabled

## Testing

Run the test suite:

```bash
yarn test
```

## License

MIT License - see LICENSE file for details.
