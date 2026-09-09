import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const here = dirname(fileURLToPath(import.meta.url));
const meta = readFileSync(resolve(here, "./src/meta.js"), "utf8").trim();
const version = meta.match(/@version\s+(\S+)/)?.[1] || "0.0.0";

/** @type {import('vite').Plugin} */
const userscriptBanner = {
  name: "userscript-banner",
  generateBundle(_options, bundle) {
    for (const fileName of Object.keys(bundle)) {
      if (!fileName.endsWith(".user.js")) continue;
      const chunk = bundle[fileName];
      if (!chunk || typeof chunk.code !== "string") continue;
      chunk.code = `${meta}\n\n${chunk.code}`;
      writeFileSync(resolve(here, "./x-im.user.js"), chunk.code);
    }
  },
};

export default defineConfig({
  plugins: [userscriptBanner],
  define: {
    __XIM_VERSION__: JSON.stringify(version),
  },
  build: {
    lib: {
      entry: "src/main.js",
      name: "XIM",
      formats: ["iife"],
      fileName: () => "x-im.user.js",
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
