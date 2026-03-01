"use client";

import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import DataTable from "@/components/data/data-table";
import { fetchTransactionHistory } from "@/lib/api/partners";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<
    { id: string | number; [key: string]: unknown }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTransactionHistory();
        const data = res?.data ?? res ?? [];
        setTransactions(
          Array.isArray(data)
            ? data.map((t: Record<string, unknown>, i: number) => ({
                id: (t.id as string | number) ?? i,
                date: t.date ?? t.created_at ?? "",
                IBAN: t.iban ?? t.IBAN ?? "",
                nomeBenificiario: t.beneficiary_name ?? t.nomeBenificiario ?? "",
                codiceFiscale: t.fiscal_code ?? t.codiceFiscale ?? "",
                importo: t.amount ?? t.importo ?? "",
                state: t.status ?? t.state ?? "",
              }))
            : []
        );
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = [
    { label: "Data e Ora", field: "date" },
    { label: "IBAN Destinatario", field: "IBAN" },
    { label: "Nome Benificiario", field: "nomeBenificiario" },
    { label: "Codice Fiscale / P.IVA", field: "codiceFiscale" },
    { label: "Importo", field: "importo" },
    { label: "Stato Transazione", field: "state" },
  ];

  return (
    <div className="dash-card p-7 min-h-125">
      <h2 className="text-xl font-bold tracking-tight text-center text-[#13131f] mb-1">Storico Pagamenti</h2>
      <p className="text-sm text-slate-500 text-center mb-5">
        In questa sezione puoi visualizzare i tuoi pagamenti, aggiungere un nuovo metodo di pagamento e gestire i tuoi asset
      </p>

      <hr className="border-0 border-t border-[#eef0f4] my-5" />

      <h3 className="text-base font-bold text-[#13131f] mb-3">Storico Pagamenti</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <DataTable columns={columns} data={transactions} showCheckbox />
      )}
    </div>
  );
}
