import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

function isAuthed(req: NextRequest) {
  const token =
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return token === process.env.ADMIN_TOKEN;
}

function toCSV(rows: Record<string, unknown>[]) {
  const headers = [
    "createdAt",
    "fullName",
    "email",
    "phone",
    "airline",
    "pnr",
    "origin",
    "destination",
    "delayhours",
    "cause",
    "consent",
    "note",
    "source",
  ];

  const esc = (v: unknown) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => esc(r[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // newest first
  const ids = (await kv.zrange("leads:index", 0, 999, { rev: true })) as string[];

  // hgetall can return null, so fetch then narrow
  type Lead = Record<string, unknown>;
  const raw = await Promise.all(ids.map((id) => kv.hgetall<Lead>(id)));
  const items: Lead[] = raw.filter((r): r is Lead => r !== null); // <-- type-safe filter

  const csv = toCSV(items);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=leads.csv",
      "cache-control": "no-store",
    },
  });
}

