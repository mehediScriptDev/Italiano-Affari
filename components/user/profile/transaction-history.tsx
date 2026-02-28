"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
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
        // API may not be available yet — show empty table
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
    <Card className="card-shadow" sx={{ borderRadius: 2, minHeight: "650px", position: "relative" }}>
      <CardContent>
        <h3 className="text-center">Storico Pagamenti</h3>
        <Typography align="center" variant="body1">
          In questa sezione puoi visualizzare i tuoi pagamenti, aggiungere un nuovo metodo di pagamento e gestire i tuoi asset
        </Typography>
        <hr style={{ width: "100%" }} />
        <div className="mt-1">
          <div className="d-flex justify-between align-center"><h5 className="mb-1">Storico Pagamenti</h5></div>
        </div>
        {loading ? (
          <Typography align="center" sx={{ mt: 4 }}>Caricamento...</Typography>
        ) : (
          <DataTable columns={columns} data={transactions} showCheckbox />
        )}
      </CardContent>
    </Card>
  );
}
