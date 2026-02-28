import api, { API_URL } from "./client";
import type { UserProfile } from "@/lib/types";

export async function fetchAllAssets() {
  const response = await api.get(`${API_URL}/payment-assets`);
  return response.status === 200 ? response.data : [];
}

export async function createAsset(asset: {
  entity_type: string;
  first_name?: string;
  address?: string;
  last_name?: string;
  company_name?: string;
  iban?: string;
  vat_number?: string;
  fiscal_code?: string;
  percentage: number;
}) {
  const response = await api.post(`${API_URL}/payment-assets`, asset);
  return response.status === 200 ? response.data : [];
}

export async function deleteAsset(assetId: number) {
  const response = await api.delete(`${API_URL}/payment-assets/${assetId}`);
  return response.status === 200 ? response.data : [];
}

export async function fetchLatestOrders(startDate?: string, endDate?: string) {
  const response = await api.get(`${API_URL}/reports/latest-orders`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.status === 200 ? response.data : [];
}

export async function fetchSubAgents() {
  return api.get(`${API_URL}/agents/sub-agents`);
}

export async function inviteSubAgent(data: {
  email: string;
  parent_id: number | null;
}) {
  return api.post(`${API_URL}/agents/invite`, data);
}

export async function fetchEarnings(startDate?: Date | null, endDate?: Date | null) {
  const response = await api.get(`${API_URL}/report/earnings`, {
    params: {
      start_date: startDate ?? null,
      end_date: endDate ?? null,
    },
  });
  return response.status === 200 ? response.data : [];
}

export async function fetchSales(startDate?: Date | null, endDate?: Date | null) {
  const response = await api.get(`${API_URL}/report/sales`, {
    params: {
      start_date: startDate ?? null,
      end_date: endDate ?? null,
    },
  });
  return response.status === 200 ? response.data : [];
}

export async function fetchAffiliates(startDate?: Date | null, endDate?: Date | null) {
  const response = await api.get(`${API_URL}/report/affiliates`, {
    params: {
      start_date: startDate ?? null,
      end_date: endDate ?? null,
    },
  });
  return response.status === 200 ? response.data : [];
}

export async function updateProfile(profile: Record<string, unknown> | UserProfile) {
  const response = await api.put(`${API_URL}/agents/update`, profile);
  if (response.status === 200) return response.data;
  throw { status: response.status, message: "Errore nella risposta dal server" };
}

export async function fetchNetwork() {
  const response = await api.get(`${API_URL}/report/network`);
  if (response.status === 200) return response.data;
  throw { status: response.status, message: "Errore nella risposta dal server" };
}

export async function fetchDiscounts() {
  const response = await api.get(`${API_URL}/partner-coupon`);
  if (response.status === 200) return response.data;
  throw { status: response.status, message: "Errore nella risposta dal server" };
}

export async function createDiscount(discount: {
  code: string;
  value: number;
  type: string;
}) {
  const response = await api.post(`${API_URL}/partner-coupon`, discount);
  if (response.status === 200) return response.data;
  throw { status: response.status, message: "Errore nella risposta dal server" };
}

export async function deleteDiscount(code: string) {
  const response = await api.delete(`${API_URL}/partner-coupon?code=${code}`);
  if (response.status === 200) return response.data;
  throw { status: response.status, message: "Errore nella risposta dal server" };
}

export async function fetchContacts() {
  const response = await api.get(`${API_URL}/contacts`);
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function createContact(contactData: { name: string; email: string }) {
  const response = await api.post(`${API_URL}/contacts`, contactData);
  if (response.status === 201 || response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function updateContact(
  contactId: number,
  contactData: { name: string; email: string }
) {
  const response = await api.put(`${API_URL}/contacts/${contactId}`, contactData);
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function deleteContact(contactId: number) {
  const response = await api.delete(`${API_URL}/contacts/${contactId}`);
  if (response.status === 204 || response.status === 200) return true;
  throw new Error(`Errore: ${response.status}`);
}

export async function importContactsCsv(
  contactsArray: { name: string; email: string }[]
) {
  const response = await api.post(`${API_URL}/import-contacts`, {
    contacts: contactsArray,
  });
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function getAllCredits() {
  const response = await api.get(`${API_URL}/credits`);
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function generateCoupon(amount: number) {
  const code = `CPN${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
  const response = await api.post(`${API_URL}/generate-coupon`, { amount, code });
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function getCoupons() {
  const response = await api.get(`${API_URL}/coupons`);
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function deleteCoupon(couponId: number) {
  const response = await api.post(`${API_URL}/delete-coupon`, {
    coupon_id: couponId,
  });
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function createAssetWithEmail(email: string, percentage: number) {
  const response = await api.post(`${API_URL}/assets/request`, {
    email,
    percentage,
  });
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function completeAssetData(assetData: Record<string, unknown>) {
  const response = await api.post(`${API_URL}/assets/complete`, assetData);
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function downloadAssetFile() {
  const response = await api.get(`${API_URL}/assets/partner-tools`, {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });

  if (response.status === 200) {
    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;

    const disposition = response.headers["content-disposition"];
    const fileNameMatch = disposition?.match(/filename="(.+)"/);
    a.download = fileNameMatch?.[1] ?? "Strumenti Partner.pdf";

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export async function fetchTransactionHistory() {
  const response = await api.get(`${API_URL}/transactions`);
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}

export async function fetchContents(params?: {
  tag?: string;
  category?: string;
  gender?: string;
  type?: string;
}) {
  const response = await api.get(`${API_URL}/contents`, { params });
  if (response.status === 200) return response.data;
  throw new Error(`Errore: ${response.status}`);
}
