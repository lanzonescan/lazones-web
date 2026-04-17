import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";

import { getRequestEvent } from "$app/server";
import { BETTER_AUTH_SECRET } from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";

import { db } from "./db";
import { generateId } from "./db/utils";

export const auth = betterAuth({
  baseURL: PUBLIC_BASE_URL,
  secret: BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  database: drizzleAdapter(db, { provider: "sqlite" }),
  plugins: [sveltekitCookies(getRequestEvent)],
  user: {
    modelName: "users",
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  advanced: {
    database: {
      generateId() {
        return generateId();
      },
    },
  },
});
