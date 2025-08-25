import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// Allow auth via ?token=... or Authorization: Bearer <token>
function isAuthed(req: NextRequest) {
  const fromQuery = req.nextUrl.searchParams.get("token");
  const fromHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = fromQuery || fromHeader;
  return token && token === process.env.ADMIN_TOKEN;
}

// GET /api/leads -> returns latest leads as JSON
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Most recent 200 leads
  const ids = await kv.zrevrange<string[]>("leads:index", 0, 199);

  // Fetch each lead hash
  const items = await Promise.all(
    ids.map((id) => kv.hgetall<Record<string, any>>(id))
  );

  return NextResponse.json({ items });
}
