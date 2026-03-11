import type {
  AdminAgentsResponse,
  AdminAgentDetail,
  AdminContent,
  CreateContentPayload,
  UpdateContentPayload,
} from "@/lib/types/admin";

const BASE = "/api/admin";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(
      (err.error as string) ?? (err.message as string) ?? `Request failed: ${res.status}`
    );
  }
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ ok: boolean }>(res);
}

export async function adminLogout() {
  await fetch(`${BASE}/auth/logout`, { method: "POST" });
}

// ─── Agents ───────────────────────────────────────────────────────────────

export async function fetchAdminAgents(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<AdminAgentsResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  if (params?.search) qs.set("search", params.search);

  const res = await fetch(`${BASE}/agents${qs.toString() ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  return handleResponse<AdminAgentsResponse>(res);
}

export async function fetchAdminAgentDetail(id: number): Promise<AdminAgentDetail> {
  const res = await fetch(`${BASE}/agents/${id}`, { cache: "no-store" });
  return handleResponse<AdminAgentDetail>(res);
}

// ─── Contents ─────────────────────────────────────────────────────────────

export async function fetchAdminContents(page = 1, perPage = 50): Promise<{ data: AdminContent[]; total: number; last_page: number }> {
  const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const res = await fetch(`${BASE}/contents?${qs}`, { cache: "no-store" });
  const result = await handleResponse<AdminContent[] | { data: AdminContent[]; total: number; last_page: number }>(res);
  // API returns paginated object { data: [...], total, last_page, ... }
  if (Array.isArray(result)) return { data: result, total: result.length, last_page: 1 };
  return { data: result.data ?? [], total: result.total ?? 0, last_page: result.last_page ?? 1 };
}

export async function createContent(payload: CreateContentPayload): Promise<AdminContent> {
  const form = new FormData();
  form.append("user_id", String(payload.user_id));
  form.append("title", payload.title);
  form.append("gender", payload.gender);
  form.append("category", payload.category);
  payload.tags.forEach((t) => form.append("tags[]", t));
  form.append("file", payload.file);
  if (payload.description) form.append("description", payload.description);
  if (payload.canva_design_id) form.append("canva_design_id", payload.canva_design_id);
  if (payload.canva_project_id) form.append("canva_project_id", payload.canva_project_id);
  if (payload.canva_url) form.append("canva_url", payload.canva_url);
  if (payload.canva_data) form.append("canva_data", payload.canva_data);

  const res = await fetch(`${BASE}/contents`, { method: "POST", body: form });
  return handleResponse<AdminContent>(res);
}

export async function updateContent(
  id: number,
  payload: UpdateContentPayload
): Promise<AdminContent> {
  const form = new FormData();
  if (payload.title) form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  if (payload.gender) form.append("gender", payload.gender);
  if (payload.category) form.append("category", payload.category);
  if (payload.tags) payload.tags.forEach((t) => form.append("tags[]", t));
  if (payload.file) form.append("file", payload.file);

  const res = await fetch(`${BASE}/contents/${id}`, { method: "PUT", body: form });
  return handleResponse<AdminContent>(res);
}

export async function deleteContent(id: number): Promise<void> {
  const res = await fetch(`${BASE}/contents/${id}`, { method: "DELETE" });
  await handleResponse<{ message: string }>(res);
}

// ─── Meta (categories & filters for form dropdowns) ─────────────────────────

export async function fetchAdminCategories(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${BASE}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function fetchAdminFilters(): Promise<{ id: number; name: string }[]> {
  const res = await fetch(`${BASE}/filters`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => []);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
