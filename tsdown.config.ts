import {defineConfig} from "tsdown";

export default defineConfig({
    entry: {
        "vue-mvvm": "./src/core/index.ts",
        "vue-mvvm-router": "./src/router/index.ts",
        "vue-mvvm-dialog": "./src/dialog/index.ts",
        "vue-mvvm-alert": "./src/alert/index.ts",
        "vue-mvvm-toast": "./src/toast/index.ts"
    },
    format: "esm",
    dts: true,
    unbundle: true
});