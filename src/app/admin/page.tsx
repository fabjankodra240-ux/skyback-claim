// Server Component – can read env + KV directly
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

type Lead = Record<string, unknown>;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams?.token ?? "";
  if (token !== process.env.ADMIN_TOKEN) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Unauthorized</h1>
        <p>Add ?token=YOUR_ADMIN_TOKEN to the URL.</p>
      </div>
    );
  }

  // get latest 200 leads (newest first)
  const ids = (await kv.zrange("leads:index", 0, 199, { rev: true })) as string[];
  const items = await Promise.all(ids.map((id) => kv.hgetall<Lead>(id)));

  return (
    <main style={{ padding: 24 }}>
      <h1>Leads ({items.length})</h1>

      <p style={{ margin: "12px 0" }}>
        <a
          href={`/api/leads.csv?token=${encodeURIComponent(token)}`}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ddd",
            textDecoration: "none",
          }}
        >
          ⬇️ Download CSV
        </a>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table cellPadding={6} style={{ borderCollapse: "collapse", minWidth: 800 }}>
          <thead>
            <tr>
              {[
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
              ].map((h) => (
                <th key={h} style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                {[
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
                ].map((k) => (
                  <td key={k} style={{ borderBottom: "1px solid #f6f6f6" }}>
                    {row?.[k] as string | number | boolean | undefined ?? ""}
                  </td>
                ))}
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={13} style={{ padding: 16, color: "#777" }}>
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
