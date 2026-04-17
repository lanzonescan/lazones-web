import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

import { building } from "$app/environment";

import { auth } from "$lib/server/auth";

const publicPaths = ["/api/auth/", "/login", "/signup"];

const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
};

const handleTimeZone: Handle = async ({ event, resolve }) => {
  event.locals.timeZone = event.cookies.get("tz") ?? "Asia/Manila";
  return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session) {
    event.locals.user = session.user as App.Locals["user"];
  } else {
    event.locals.user = null;
  }

  const pathname = event.url.pathname;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!session && !isPublic) {
    return redirect(302, "/login?redirect=" + encodeURIComponent(pathname));
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(
  handleSecurityHeaders,
  handleTimeZone,
  handleAuth,
);
