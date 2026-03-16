import path from "path";
import { fileURLToPath } from "url";

/** @type {import("typedoc").TypeDocOptions} */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  entryPointStrategy: "expand",

  entryPoints: [
    path.resolve(__dirname, "./src/core/index.ts"),
    path.resolve(__dirname, "./src/router/index.ts"),
    path.resolve(__dirname, "./src/dialog/index.ts"),
    path.resolve(__dirname, "./src/alert/index.ts")
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

  textContentMappings: {
    "title.indexPage": "API Reference",
    "title.memberPage": "{name}"
  },

  indexFormat: "table",
  useCodeBlocks: true
};