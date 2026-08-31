import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const meta = readFileSync("./src/meta.js", "utf8").trim();
const version = meta.match(/@version\s+(\S+)/)?.[1] || "0.0.0";

/** @type {import('vite').Plugin} */
const userscriptBanner = {
  name: "userscript-banner",
  generateBundle(_options, bundle) {
    for (const fileName of Object.keys(bundle)) {
      if (fileName.endsWith(".user.js")) {
        const chunk = bundle[fileName];
        if (chunk && typeof chunk.code === "string") {
          chunk.code = `${meta}\n\n${chunk.code}`;
        }
      }
    }
  },
};

export default defineConfig({
  plugins: [userscriptBanner],
  // 版本单一来源 = src/meta.js，代码内用 __IM_VERSION__ 引用，杜绝 banner 与 @version 漂移
  define: {
    __IM_VERSION__: JSON.stringify(version),
  },
  build: {
    lib: {
      entry: "src/main.js",
      name: "LinuxDoIM",
      formats: ["iife"],
      fileName: () => "linuxdo-im.user.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
