import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  resolve: {
    dedupe: ["@internationalized/date", "bits-ui", "svelte", "runed"],
  },
  optimizeDeps: {
    exclude: ["@erp/ui", "@erp/utils", "@erp/services", "@erp/core"],
    include: ["zod"],
  },
  ssr: {
    noExternal: [
      "@erp/ui",
      "@erp/utils",
      "@erp/services",
      "@erp/core",
      "zod",
      "runed",
      "mode-watcher",
    ],
  },
});
