import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// simple admin check: /api/leads?token=...  or  Authorization: Bearer ...
function isAuthed(req: NextRequest) {
  const token =
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return token === process.env.ADMIN_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 👇 tell TS these are strings
  const ids = (await kv.zrange("leads:index", 0, 199, { rev: true })) as string[];

  // 👇 now id is a string, so this type-checks
  const items = await Promise.all(
    ids.map((id) => kv.hgetall<Record<string, unknown>>(id))
  );

  return NextResponse.json({ items });
}
