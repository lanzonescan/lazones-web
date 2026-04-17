// See https://kit.svelte.dev/docs/types#app
import type { User } from "$lib/server/db/schema";

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      timeZone: string;
    }
    interface PageData {
      user?: User | null;
    }
  }
}

export {};
