import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "happy-dom",
    coverage: {
      all: true,
    },
    globals: true,
  },
});
