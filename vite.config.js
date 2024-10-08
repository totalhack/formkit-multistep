const path = require("path")
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/components/index.js"),
      name: "FormKitMultiStep",
      fileName: (format) => `formkit-multistep.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "@formkit/vue", "@formkit/core"],
      output: {
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          vue: "Vue",
          "@formkit/vue": "FormKitVue",
          "@formkit/core": "FormKitCore",
        },
      },
    },
  },
  plugins: [vue()],
})
