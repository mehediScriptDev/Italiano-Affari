"use client";

import { Card, CardContent, Typography } from "@mui/material";
import DataTable from "@/components/data/data-table";

export default function TransactionHistory() {
  const transactions: { id: string | number; [key: string]: unknown }[] = [];

  const columns = [
    { label: "Data e Ora", field: "date" },
    { label: "IBAN Destinatario", field: "IBAN" },
    { label: "Nome Benificiario", field: "nomeBenificiario" },
    { label: "Codice Fiscale / P.IVA", field: "codiceFiscale" },
    { label: "Importo", field: "importo" },
    { label: "Stato Transazione", field: "state" },
  ];

  return (
    <Card className="shadow" sx={{ borderRadius: 2, minHeight: "650px", position: "relative" }}>
      <CardContent>
        <h3 className="text-center">Storico Pagamenti</h3>
        <Typography align="center" variant="body1">
          In questa sezione puoi visualizzare i tuoi pagamenti, aggiungere un nuovo metodo di pagamento e gestire i tuoi asset
        </Typography>
        <hr className="w-full" />
        <div className="mt-1">
          <div className="flex justify-between items-center"><h5 className="mb-1">Storico Pagamenti</h5></div>
        </div>
        <DataTable columns={columns} data={transactions} showCheckbox />
      </CardContent>
    </Card>
  );
}
