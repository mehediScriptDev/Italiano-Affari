import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_API = process.env.ADMIN_API_BASE;

function adminHeaders() {
  return {
    "X-Admin-Email": process.env.ADMIN_EMAIL ?? "",
    "X-Admin-Password": process.env.ADMIN_PASSWORD ?? "",
    "Content-Type": "application/json",
  };
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_token")?.value;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = `${ADMIN_API}/admin/overview/agents/${id}`;

  try {
    const resp = await fetch(url, {
      headers: adminHeaders(),
      cache: "no-store",
    });

    const text = await resp.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("[admin/agents/id] Non-JSON response:", text.slice(0, 300));
      return NextResponse.json({ error: `Backend error (${resp.status})` }, { status: resp.status });
    }

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[admin/agents/id] Fetch error:", err);
    return NextResponse.json({ error: "Failed to reach API" }, { status: 502 });
  }
}
