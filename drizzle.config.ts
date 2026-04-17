import { Config } from "drizzle-kit";

const { TURSO_AUTH_TOKEN, TURSO_CONFIG, TURSO_CONNECTION_URL } = process.env;
const url = TURSO_CONFIG === "dev" ? "file:local.db" : TURSO_CONNECTION_URL;

console.log(url);
console.log(TURSO_AUTH_TOKEN);

export default {
  schema: "./src/lib/server/db/schema",
  out: "./src/lib/server/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: url!,
    authToken: TURSO_AUTH_TOKEN,
  },
} satisfies Config;
