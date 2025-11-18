import {resolve} from "path";
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), dts({tsconfigPath: "./tsconfig.app.json"})],
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            "@hook": resolve(__dirname, "./src/hooks")
        }
    },
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "vue-mvvm",
            fileName: (format) => `vue-mvvm.${format}.js`
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue"
                }
            }
        }
    }
})
