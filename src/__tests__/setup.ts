import dotenv from "dotenv";
import { jest, describe, beforeEach, afterEach } from "@jest/globals";

// Load environment variables from .env.test if it exists
dotenv.config({ path: ".env.test" });

describe("Global Test Setup", () => {
  // Mock console methods to keep test output clean
  const originalConsole = { ...console };

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
  });
}); 