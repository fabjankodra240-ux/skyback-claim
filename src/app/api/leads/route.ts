// src/app/api/leads/route.ts
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

// allow ?token=... or Authorization: Bearer <token>
function isAuthed(req: NextRequest) {
  const urlToken = req.nextUrl.searchParams.get("token") ?? undefined;
  const headerToken =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? undefined;
  const token = urlToken ?? headerToken;
  return token === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // newest first (replace zrevrange with zrange + { rev: true })
  const ids = await kv.zrange("leads:index", 0, 199, { rev: true });

  // fetch each lead hash
 const items = await Promise.all(
  ids.map((id) => kv.hgetall<Record<string, unknown>>(id))
);
return NextResponse.json({ items });

  return NextResponse.json({ items });
}
