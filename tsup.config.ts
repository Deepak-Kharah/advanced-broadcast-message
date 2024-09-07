import { defineConfig } from "tsup";
import packageJson from "./package.json";

export default defineConfig((options) => {
  return {
    entry: ["src/index.ts"],
    sourcemap: options.watch ? "inline" : true,
    define: {
      "process.env.PACKAGE_VERSION": `"${packageJson.version}"`,
    },
    minify: !options.watch,
    format: ["cjs", "esm"],
    clean: true,
    dts: true,
  };
});
