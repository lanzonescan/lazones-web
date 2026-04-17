import { vi } from "vitest";

vi.mock("$env/static/private", () => ({
  LANZONESSCAN_API_URL: "http://test-fastapi",
  LANZONESSCAN_JWT_SECRET: "test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  LANZONESSCAN_JWT_AUDIENCE: "lanzones-scan",
  LANZONESSCAN_JWT_TTL_SECONDS: "300",
  CLOUDINARY_CLOUD_NAME: "test-cloud",
  CLOUDINARY_API_KEY: "key",
  CLOUDINARY_API_SECRET: "secret",
  CLOUDINARY_FOLDER: "test",
  BETTER_AUTH_SECRET: "test-better-auth-secret-32-bytes-minimum-abc",
  TURSO_CONFIG: "dev",
  TURSO_CONNECTION_URL: "file:test.db",
  TURSO_AUTH_TOKEN: "",
}));

vi.mock("$env/static/public", () => ({
  PUBLIC_BASE_URL: "http://localhost:5175",
  PUBLIC_APP_TITLE: "Lanzones Scan",
}));
