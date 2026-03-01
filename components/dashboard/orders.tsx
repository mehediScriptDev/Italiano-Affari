"use client";

import { useEffect, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { InfoOutlined } from "@mui/icons-material";
import DataTable from "@/components/data/data-table";
import { fetchLatestOrders } from "@/lib/api/partners";
import type { Commission } from "@/lib/types";

interface OrderRow {
  id: number;
  name: string;
  total: number;
  earnings: number;
  commissions: Commission[];
  agent: string;
  date: string;
}

export default function Orders() {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const columns = [
    { label: "Nome", field: "name" },
    {
      label: "Importo (Guadagno)", field: "label",
      render: (row: OrderRow) => (
        <div className="flex items-center gap-2">
          <span>{`${row.total}€ (${row.earnings}€)`}</span>
          <Tooltip
            title={
              <div>
                {row.commissions?.filter((c) => c.amount !== 0).map((c, i) => {
                  const tipo = { direct: "Vendita Diretta", affiliate: "Affiliazione", level2: "Livello 2" }[c.type] ?? "Livello 3+";
                  return <div key={i}>{tipo}: {c.amount.toFixed(2)}€</div>;
                })}
              </div>
            }
            arrow
          >
            <IconButton size="small"><InfoOutlined fontSize="small" /></IconButton>
          </Tooltip>
        </div>
      ),
    },
    { label: "Agente", field: "agent" },
    { label: "Data di creazione", field: "date" },
  ];

  useEffect(() => {
    const tz = "Europe/Rome";
    const startUtc = formatInTimeZone(startDate, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");
    const endUtc = formatInTimeZone(endDate, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");

    fetchLatestOrders(startUtc, endUtc).then((response) => {
      setOrders(
        response.data.map((order: Record<string, unknown>) => {
          const comms = (order.commissions as Commission[]) ?? [];
          const earnings = comms.reduce((acc, c) => acc + (c.amount || 0), 0);
          const agent = order.agent as Record<string, string>;
          const customer = order.customer as Record<string, string>;
          return {
            id: order.id as number, name: customer?.name, total: order.amount,
            earnings, commissions: comms, agent: `${agent.first_name} ${agent.last_name}`,
            date: new Date(order.created_at as string).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          };
        })
      );
    });
  }, [startDate, endDate]);

  const datePickerSx = {
    width: "180px",
    "& .MuiInputBase-root": {
      color: "#13131f",
      borderRadius: "8px",
      backgroundColor: "#f6f8fb",
      "& fieldset": { borderColor: "transparent" },
      "&:hover fieldset": { borderColor: "#c4c8d0" },
      "&.Mui-focused fieldset": { borderColor: "#13131f" },
    },
    "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.5)", fontSize: "13px" },
    "& .MuiSvgIcon-root": { color: "#64748b" },
  };

  return (
    <div className="w-100 paddingContainer mt-3">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Ordini / Report</h1>
          <p className="page-subtitle">Storico degli ordini con filtri per data</p>
        </div>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-semibold text-slate-500 whitespace-nowrap">Data inizio:</label>
              <DatePicker value={startDate} onChange={(v) => v && setStartDate(v)} slotProps={{ textField: { size: "small" } }} sx={datePickerSx} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-semibold text-slate-500 whitespace-nowrap">Data fine:</label>
              <DatePicker value={endDate} onChange={(v) => v && setEndDate(v)} slotProps={{ textField: { size: "small" } }} sx={datePickerSx} />
            </div>
          </div>
        </LocalizationProvider>
      </div>
      <DataTable columns={columns} data={orders} showCheckbox />
    </div>
  );
}
