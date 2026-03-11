import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_API = process.env.ADMIN_API_BASE;

function adminAuthHeaders() {
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

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = `${ADMIN_API}/filters`;
  try {
    const resp = await fetch(url, {
      headers: adminAuthHeaders(),
      cache: "no-store",
    });
    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(data, { status: resp.status });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
