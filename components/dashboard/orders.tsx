"use client";

import { useEffect, useState } from "react";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { InfoOutlined } from "@mui/icons-material";
import "@/styles/orders.css";
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
        <Box display="flex" alignItems="center" gap={1}>
          <span>{`${row.total}€ (${row.earnings}€)`}</span>
          <Tooltip
            title={
              <Box>
                {row.commissions?.filter((c) => c.amount !== 0).map((c, i) => {
                  const tipo = { direct: "Vendita Diretta", affiliate: "Affiliazione", level2: "Livello 2" }[c.type] ?? "Livello 3+";
                  return <div key={i}>{tipo}: {c.amount.toFixed(2)}€</div>;
                })}
              </Box>
            }
            arrow
          >
            <IconButton size="small"><InfoOutlined fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
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
    "& .MuiInputBase-root": { color: "black", borderColor: "rgba(0,0,0,0.3)", "& fieldset": { borderColor: "rgba(0,0,0,0.3)" }, "&:hover fieldset": { borderColor: "rgba(0,0,0,0.5)" } },
    "& .MuiInputLabel-root": { color: "rgba(0,0,0,0.7)" },
    "& .MuiSvgIcon-root": { color: "black" },
  };

  return (
    <div className="d-flex justify-center px-2" style={{ backgroundColor: "#f6f8fb" }}>
      <div style={{ maxWidth: "1200px" }} className="w-100 d-flex flex-column justify-center paddingContainer p-0">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}><h5 className="mb-0">Ordini / Report</h5></Grid>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", sm: "flex-end" }, gap: 1 }}>
              <label className="fw-bold">Data inizio: </label>
              <DatePicker value={startDate} onChange={(v) => v && setStartDate(v)} slotProps={{ textField: { size: "small" } }} sx={datePickerSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", sm: "flex-end" }, gap: 1 }}>
              <label className="fw-bold">Data fine: </label>
              <DatePicker value={endDate} onChange={(v) => v && setEndDate(v)} slotProps={{ textField: { size: "small" } }} sx={datePickerSx} />
            </Grid>
          </LocalizationProvider>
        </Grid>
        <div className="mt-2"><DataTable columns={columns} data={orders} showCheckbox /></div>
      </div>
    </div>
  );
}
