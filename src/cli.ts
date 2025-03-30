import fs from "fs";
import path from "path";
import { createRAGEngine } from "./factory";
import { loadTextFromFile } from "./utils/fileLoader";
import * as dotenv from "dotenv";

dotenv.config();

const args = process.argv.slice(2);
const command = args[0];
const targetPath = args[1];

const openaiKey = process.env.OPENAI_API_KEY;
const qdrantKey = process.env.QDRANT_API_KEY;

if (!openaiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

if (!qdrantKey) {
  throw new Error("QDRANT_API_KEY environment variable is required");
}

const rag = createRAGEngine({
  llmProvider: "openai",
  embeddingProvider: "openai",
  vectorStore: "qdrant",
  apiKeys: {
    openai: openaiKey,
    qdrant: qdrantKey,
  },
});

async function ingestFromDirectory(dirPath: string): Promise<void> {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const text = await loadTextFromFile(fullPath);
    await rag.ingestDocuments([{ id: file, text }]);
    console.log(`Ingested: ${file}`);
  }
}

if (command === "ingest" && targetPath) {
  void ingestFromDirectory(targetPath);
} else {
  console.log("Usage: npx ragify-js ingest <directory>");
}
