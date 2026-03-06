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
      const rows = response?.data ?? [];
      setOrders(
        Array.isArray(rows)
          ? rows.map((order: Record<string, unknown>) => {
              const comms = (order.commissions as Commission[]) ?? [];
              const earnings = comms.reduce((acc, c) => acc + (c.amount || 0), 0);
              const agent = order.agent as Record<string, string>;
              const customer = order.customer as Record<string, string>;
              return {
                id: order.id as number, name: customer?.name, total: order.amount,
                earnings, commissions: comms, agent: `${agent?.first_name ?? ''} ${agent?.last_name ?? ''}`,
                date: new Date(order.created_at as string).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
              } as OrderRow;
            })
          : []
      );
    }).catch(() => {
      setOrders([]);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="page-title">Ordini / Report</h1>
          <p className="page-subtitle">Storico degli ordini con filtri per data</p>
        </div>
      </div>

      {/* Filter card */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
        <div className="dash-card p-4 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Data inizio</span>
              <DatePicker
                value={startDate}
                onChange={(v) => v && setStartDate(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
                sx={{ ...datePickerSx, width: "100%" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Data fine</span>
              <DatePicker
                value={endDate}
                onChange={(v) => v && setEndDate(v)}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
                sx={{ ...datePickerSx, width: "100%" }}
              />
            </div>
          </div>
        </div>
      </LocalizationProvider>

      {/* Table */}
      <DataTable columns={columns} data={orders} showCheckbox />
    </div>
  );
}
