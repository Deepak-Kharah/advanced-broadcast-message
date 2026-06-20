import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "happy-dom",
    coverage: {
      // `coverage.all` was removed in Vitest 4; use `include` to count
      // untested source files in the report instead.
      include: ["src/**"],
      reporter: ["text", "json-summary", "json", "html"],
      reportOnFailure: true,
    },
    globals: true,
  },
});
