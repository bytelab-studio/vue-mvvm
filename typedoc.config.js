import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** @type {import("typedoc").TypeDocOptions} */
export default {
  entryPointStrategy: "expand",

  entryPoints: [
    path.resolve(__dirname, "./src/core/index.ts"),
    path.resolve(__dirname, "./src/router/index.ts"),
    path.resolve(__dirname, "./src/dialog/index.ts"),
    path.resolve(__dirname, "./src/alert/index.ts"),
    path.resolve(__dirname, "./src/toast/index.ts")
  ],

  tsconfig: path.resolve(__dirname, "./tsconfig.json"),

  out: "./docs/capi",

  plugin: [
    "typedoc-plugin-markdown",
    "typedoc-vitepress-theme"
  ],

  readme: "none",

  cleanOutputDir: true,
  disableSources: true,
  categorizeByGroup: true,
  excludeInternal: true,

  textContentMappings: {
    "title.indexPage": "API Reference",
    "title.memberPage": "{name}"
  },

  indexFormat: "table",
  useCodeBlocks: true
};