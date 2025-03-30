
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export async function loadTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    return fs.promises.readFile(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    const dataBuffer = await fs.promises.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  throw new Error("Unsupported file type: " + ext);
}
