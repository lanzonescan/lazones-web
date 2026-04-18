import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

import pkg from "./package.json" with { type: "json" };

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    version: { name: pkg.version || "1.0.0" },
  },
  vitePlugin: {
    inspector:
      process.env.NODE_ENV === "development"
        ? {
            toggleButtonPos: "top-right",
            holdMode: true,
            inspectorPosition: "right",
            toggleKeyCombo: "meta-shift",
          }
        : false,
  },
};

export default config;
