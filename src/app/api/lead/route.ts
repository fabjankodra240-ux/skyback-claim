import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null);
  if (!data || !data.fullName || !data.email) {
    return NextResponse.json({ ok: false, error: "Missing fullName or email" }, { status: 400 });
  }
  const id = `lead:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  await kv.hset(id, { ...data, createdAt: new Date().toISOString(), source: "skybackclaim.com" });
  await kv.zadd("leads:index", { score: Date.now(), member: id });
  return NextResponse.json({ ok: true });
}

