import { SignJWT } from "jose";

import {
  LANZONESSCAN_API_URL,
  LANZONESSCAN_JWT_AUDIENCE,
  LANZONESSCAN_JWT_SECRET,
  LANZONESSCAN_JWT_TTL_SECONDS,
} from "$env/static/private";
import { env } from "$env/dynamic/private";

import type { Detection } from "$lib/server/db/schema";

export class UpstreamAuthError extends Error {}
export class UpstreamRateLimitError extends Error {
  retryAfter: number | null;
  constructor(retryAfter: string | null) {
    super("Rate limited");
    this.retryAfter = retryAfter ? Number(retryAfter) : null;
  }
}
export class UpstreamImageError extends Error {}
export class UpstreamBlockedError extends Error {}
export class UpstreamError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AnalyzeResult = {
  filename: string;
  image_size: { width: number; height: number };
  detections: Detection[];
  annotated_image: string | null;
};

const secret = new TextEncoder().encode(LANZONESSCAN_JWT_SECRET);
const ttl = Number(LANZONESSCAN_JWT_TTL_SECONDS);

export async function analyzeImage(
  bytes: Uint8Array,
  filename: string,
  contentType: string,
  userId: string,
): Promise<AnalyzeResult> {
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setAudience(LANZONESSCAN_JWT_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + ttl)
    .sign(secret);

  const body = new FormData();
  body.append("file", new Blob([bytes as BlobPart], { type: contentType }), filename);

  const headers: Record<string, string> = { Authorization: `Bearer ${jwt}` };
  const proxySecret = env.LANZONESSCAN_PROXY_SECRET;
  if (proxySecret) headers["X-Proxy-Secret"] = proxySecret;

  const res = await fetch(`${LANZONESSCAN_API_URL}/analyze`, {
    method: "POST",
    headers,
    body,
  });

  if (res.status === 401) throw new UpstreamAuthError();
  if (res.status === 429) throw new UpstreamRateLimitError(res.headers.get("Retry-After"));
  if (res.status === 400 || res.status === 413 || res.status === 415) {
    throw new UpstreamImageError(await res.text());
  }
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 403 && /cf_chl_opt|challenge-platform|Just a moment/.test(text)) {
      throw new UpstreamBlockedError("Blocked by upstream bot protection");
    }
    throw new UpstreamError(res.status, text);
  }
  return res.json();
}
