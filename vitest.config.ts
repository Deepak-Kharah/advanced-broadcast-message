import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "happy-dom",
    coverage: {
      all: true,
      reporter: ["text", "json-summary", "json", "html"],
      reportOnFailure: true,
    },
    globals: true,
  },
});
