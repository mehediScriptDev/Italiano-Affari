import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_API = process.env.ADMIN_API_BASE;

function adminAuthHeaders() {
  return {
    "X-Admin-Email": process.env.ADMIN_EMAIL ?? "",
    "X-Admin-Password": process.env.ADMIN_PASSWORD ?? "",
  };
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_token")?.value;
}

// POST /api/admin/contents  →  POST /api/contents (create)
export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const url = `${ADMIN_API}/contents`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: adminAuthHeaders(),
      body: formData,
    });

    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Backend error (${resp.status})` }, { status: resp.status });
    }
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[admin/contents POST] Fetch error:", err);
    return NextResponse.json({ error: "Failed to reach API" }, { status: 502 });
  }
}

// GET /api/admin/contents  →  list (if backend supports it)
export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  const url = `${ADMIN_API}/contents${query ? `?${query}` : ""}`;

  try {
    const resp = await fetch(url, {
      headers: { ...adminAuthHeaders(), "Content-Type": "application/json" },
      cache: "no-store",
    });

    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Backend error (${resp.status})` }, { status: resp.status });
    }
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[admin/contents GET] Fetch error:", err);
    return NextResponse.json({ error: "Failed to reach API" }, { status: 502 });
  }
}
