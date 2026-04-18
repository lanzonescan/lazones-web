import { fail, redirect } from "@sveltejs/kit";

import {
  analyzeImage,
  UpstreamAuthError,
  UpstreamBlockedError,
  UpstreamImageError,
  UpstreamRateLimitError,
} from "$lib/server/lanzones-api";
import { deleteImage, uploadImage } from "$lib/server/cloudinary";
import { db } from "$lib/server/db";
import { scans } from "$lib/server/db/schema";
import { generateId } from "$lib/server/db/utils";
import { buildAdvice } from "$lib/server/plant-care";

import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: "Unauthorized" });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return fail(400, { error: "Please select an image file." });
    }
    if (!file.type.startsWith("image/")) {
      return fail(400, { error: "File must be an image (JPEG, PNG, or WebP)." });
    }
    if (file.size > 10 * 1024 * 1024) {
      return fail(413, { error: "Image is larger than 10 MB." });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const userId = locals.user.id;

    let cloud;
    try {
      cloud = await uploadImage(bytes, file.name);
    } catch {
      return fail(502, { error: "Image upload failed. Please retry." });
    }

    let analysis;
    try {
      analysis = await analyzeImage(bytes, file.name, file.type, userId);
    } catch (e) {
      console.error("[scan] analysis failed", e);
      await deleteImage(cloud.public_id).catch(() => {});
      if (e instanceof UpstreamRateLimitError) {
        return fail(429, {
          error: `Rate limited. Try again in ${e.retryAfter ?? 60} seconds.`,
        });
      }
      if (e instanceof UpstreamAuthError) {
        return fail(502, { error: "Upstream auth misconfigured." });
      }
      if (e instanceof UpstreamBlockedError) {
        return fail(502, {
          error: "Upstream blocked the request (bot protection). Try again shortly.",
        });
      }
      if (e instanceof UpstreamImageError) {
        return fail(400, { error: e.message || "Couldn't read that image." });
      }
      return fail(502, { error: "Analysis failed. Please retry." });
    }

    const id = generateId();
    await db.insert(scans).values({
      id,
      userId,
      filename: file.name,
      cloudinaryUrl: cloud.secure_url,
      cloudinaryPublicId: cloud.public_id,
      detections: analysis.detections,
      advice: buildAdvice(analysis.detections),
      imageWidth: cloud.width,
      imageHeight: cloud.height,
      conf: 0.25,
    });

    throw redirect(303, `/history/${id}`);
  },
};
