import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/node";

import {
  TURSO_AUTH_TOKEN,
  TURSO_CONFIG,
  TURSO_CONNECTION_URL,
} from "$env/static/private";

import * as schema from "./schema";

const url = TURSO_CONFIG === "dev" ? "file:local.db" : TURSO_CONNECTION_URL;

const client = createClient({
  url: url!,
  authToken: TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
