import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      "$env/static/private": path.resolve(
        __dirname,
        "./src/tests/helpers/env-mock.ts",
      ),
      "$env/static/public": path.resolve(
        __dirname,
        "./src/tests/helpers/env-public-mock.ts",
      ),
      "$app/server": path.resolve(
        __dirname,
        "./src/tests/helpers/app-server-mock.ts",
      ),
    },
  },
  test: {
    include: ["src/tests/**/*.test.ts"],
    setupFiles: ["src/tests/helpers/setup.ts"],
    globals: true,
    expect: { requireAssertions: true },
    coverage: {
      provider: "v8",
      include: ["src/lib/services/**/*.ts"],
    },
  },
});
