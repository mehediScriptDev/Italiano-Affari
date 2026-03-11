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

// PUT /api/admin/contents/[id]  →  POST with _method=PUT (Laravel method override)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await req.formData();
  formData.set("_method", "PUT");

  const url = `${ADMIN_API}/contents/${id}`;
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
    console.error("[admin/contents/id PUT] Fetch error:", err);
    return NextResponse.json({ error: "Failed to reach API" }, { status: 502 });
  }
}

// DELETE /api/admin/contents/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = `${ADMIN_API}/contents/${id}`;
  try {
    const resp = await fetch(url, {
      method: "DELETE",
      headers: { ...adminAuthHeaders(), "Content-Type": "application/json" },
    });

    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Backend error (${resp.status})` }, { status: resp.status });
    }
    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("[admin/contents/id DELETE] Fetch error:", err);
    return NextResponse.json({ error: "Failed to reach API" }, { status: 502 });
  }
}
