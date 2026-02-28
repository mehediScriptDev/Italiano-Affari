"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { completeAssetData } from "@/lib/api/partners";
import "@/styles/asset-form.css";

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
    <div className="asset-form-container">
      <h2>Completa i tuoi dati</h2>
      {message && <div className="form-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit} className="asset-form">
        <label>Nome<input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required /></label>
        <label>Cognome<input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required /></label>
        <label>Indirizzo<input type="text" name="address" value={formData.address} onChange={handleChange} required /></label>
        <label>IBAN<input type="text" name="iban" value={formData.iban} onChange={handleChange} required /></label>
        <label>Codice Fiscale<input type="text" name="fiscal_code" value={formData.fiscal_code} onChange={handleChange} required /></label>
        <button type="submit" disabled={loading}>{loading ? "Salvataggio..." : "Invia"}</button>
      </form>
    </div>
  );
}
