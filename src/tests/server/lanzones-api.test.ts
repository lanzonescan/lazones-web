import "../helpers/setup";
import { jwtVerify } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  analyzeImage,
  UpstreamAuthError,
  UpstreamImageError,
  UpstreamRateLimitError,
} from "$lib/server/lanzones-api";

const secret = new TextEncoder().encode(
  "test-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
);

afterEach(() => vi.restoreAllMocks());

function mockFetchOnce(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", ...headers },
    }),
  );
}

describe("analyzeImage", () => {
  it("signs a JWT with the user id as sub and forwards to FastAPI", async () => {
    const spy = mockFetchOnce(200, {
      filename: "leaf.jpg",
      image_size: { width: 100, height: 100 },
      detections: [],
      annotated_image: null,
    });

    const result = await analyzeImage(
      new Uint8Array([1, 2, 3]),
      "leaf.jpg",
      "image/jpeg",
      "user-42",
    );

    expect(result.detections).toEqual([]);
    expect(spy).toHaveBeenCalledTimes(1);
    const [url, init] = spy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://test-fastapi/analyze");
    const auth = (init.headers as Record<string, string>).Authorization;
    expect(auth).toMatch(/^Bearer /);
    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, secret, {
      audience: "lanzones-scan",
    });
    expect(payload.sub).toBe("user-42");
  });

  it("throws UpstreamAuthError on 401", async () => {
    mockFetchOnce(401, { detail: "Invalid token" });
    await expect(
      analyzeImage(new Uint8Array([1]), "a.jpg", "image/jpeg", "u"),
    ).rejects.toBeInstanceOf(UpstreamAuthError);
  });

  it("throws UpstreamRateLimitError with retry-after", async () => {
    mockFetchOnce(429, { detail: "Rate limit exceeded" }, { "Retry-After": "42" });
    try {
      await analyzeImage(new Uint8Array([1]), "a.jpg", "image/jpeg", "u");
      throw new Error("expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(UpstreamRateLimitError);
      expect((e as UpstreamRateLimitError).retryAfter).toBe(42);
    }
  });

  it("throws UpstreamImageError on 400", async () => {
    mockFetchOnce(400, "Invalid image");
    await expect(
      analyzeImage(new Uint8Array([1]), "a.jpg", "image/jpeg", "u"),
    ).rejects.toBeInstanceOf(UpstreamImageError);
  });
});
