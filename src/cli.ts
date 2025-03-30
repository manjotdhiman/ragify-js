
import { RAGEngine } from "./engine";
import { loadTextFromFile } from "./utils/fileLoader";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const args = process.argv.slice(2);
const command = args[0];
const targetPath = args[1];

const rag = new RAGEngine({
  llmProvider: "openai",
  embeddingProvider: "openai",
  vectorStore: "qdrant",
  apiKeys: {
    openai: process.env.OPENAI_API_KEY!,
    qdrant: process.env.QDRANT_API_KEY!
  },
});

async function ingestFromDirectory(dirPath: string) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const text = await loadTextFromFile(fullPath);
    await rag.ingestDocuments([{ id: file, content: text }]);
    console.log(`Ingested: ${file}`);
  }
}

if (command === "ingest" && targetPath) {
  ingestFromDirectory(targetPath);
} else {
  console.log("Usage: npx ragify-js ingest <directory>");
}
