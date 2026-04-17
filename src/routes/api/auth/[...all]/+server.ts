import { auth } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

const handler: RequestHandler = async ({ request }) => auth.handler(request);

export const GET = handler;
export const POST = handler;
