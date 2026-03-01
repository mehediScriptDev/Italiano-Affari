"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { completeAssetData } from "@/lib/api/partners";

export default function AssetCompletionForm() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get("id");

  const [formData, setFormData] = useState({
    id: assetId ?? "",
    first_name: "",
    last_name: "",
    address: "",
    company_name: "",
    iban: "",
    fiscal_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await completeAssetData(formData);
      setMessage("Dati salvati correttamente.");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto my-10 p-8 bg-white rounded-2xl border border-[#e5e7ec] shadow-sm font-[Inter,sans-serif]">
      <h2 className="text-[22px] font-bold mb-6 text-[#13131f] tracking-tight">Completa i tuoi dati</h2>
      {message && <div className="bg-emerald-50 text-emerald-800 px-4 py-3.5 mb-5 border-l-4 border-emerald-600 rounded-[10px] text-sm font-medium flex items-center gap-2">{message}</div>}
      {error && <div className="bg-red-50 text-red-800 px-4 py-3.5 mb-5 border-l-4 border-red-600 rounded-[10px] text-sm font-medium flex items-center gap-2">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <label className="flex flex-col font-semibold text-[13px] text-[#13131f] tracking-tight">Nome<input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="mt-1.5 px-3.5 py-[11px] text-[15px] border border-[#e5e7ec] rounded-[10px] bg-white text-[#13131f] outline-none transition-all hover:border-[#c4c8d0] focus:border-[#13131f] focus:ring-[3px] focus:ring-[#13131f]/[0.06] placeholder:text-gray-400" /></label>
        <label className="flex flex-col font-semibold text-[13px] text-[#13131f] tracking-tight">Cognome<input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="mt-1.5 px-3.5 py-[11px] text-[15px] border border-[#e5e7ec] rounded-[10px] bg-white text-[#13131f] outline-none transition-all hover:border-[#c4c8d0] focus:border-[#13131f] focus:ring-[3px] focus:ring-[#13131f]/[0.06] placeholder:text-gray-400" /></label>
        <label className="flex flex-col font-semibold text-[13px] text-[#13131f] tracking-tight">Indirizzo<input type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1.5 px-3.5 py-[11px] text-[15px] border border-[#e5e7ec] rounded-[10px] bg-white text-[#13131f] outline-none transition-all hover:border-[#c4c8d0] focus:border-[#13131f] focus:ring-[3px] focus:ring-[#13131f]/[0.06] placeholder:text-gray-400" /></label>
        <label className="flex flex-col font-semibold text-[13px] text-[#13131f] tracking-tight">IBAN<input type="text" name="iban" value={formData.iban} onChange={handleChange} required className="mt-1.5 px-3.5 py-[11px] text-[15px] border border-[#e5e7ec] rounded-[10px] bg-white text-[#13131f] outline-none transition-all hover:border-[#c4c8d0] focus:border-[#13131f] focus:ring-[3px] focus:ring-[#13131f]/[0.06] placeholder:text-gray-400" /></label>
        <label className="flex flex-col font-semibold text-[13px] text-[#13131f] tracking-tight">Codice Fiscale<input type="text" name="fiscal_code" value={formData.fiscal_code} onChange={handleChange} required className="mt-1.5 px-3.5 py-[11px] text-[15px] border border-[#e5e7ec] rounded-[10px] bg-white text-[#13131f] outline-none transition-all hover:border-[#c4c8d0] focus:border-[#13131f] focus:ring-[3px] focus:ring-[#13131f]/[0.06] placeholder:text-gray-400" /></label>
        <button type="submit" disabled={loading} className="py-3.5 bg-gradient-to-br from-[#13131f] to-[#1e1e30] text-white text-[15px] font-semibold border-none rounded-[10px] cursor-pointer tracking-tight transition-all hover:not-disabled:from-[#1a1a2e] hover:not-disabled:to-[#252540] hover:not-disabled:shadow-lg hover:not-disabled:-translate-y-px active:not-disabled:translate-y-0 disabled:bg-[#e5e7ec] disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-none">{loading ? "Salvataggio..." : "Invia"}</button>
      </form>
    </div>
  );
}
