"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack,
  Groups,
  ShoppingCart,
  EuroSymbol,
  Person,
  ReceiptLong,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { fetchAdminAgentDetail } from "@/lib/api/admin";
import type { AdminAgentDetail } from "@/lib/types/admin";

interface TabPanelProps {
  value: number;
  index: number;
  children: React.ReactNode;
}
function TabPanel({ value, index, children }: TabPanelProps) {
  return value === index ? <Box pt={3}>{children}</Box> : null;
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AdminAgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchAdminAgentDetail(Number(id))
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress sx={{ color: "#12715b" }} />
      </Box>
    );
  }

  if (!data) {
    return (
      <div className="w-100 paddingContainer" style={{ backgroundColor: "#f6f8fb" }}>
        <div className="mt-3">
          <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2, color: "text.secondary" }}>
            Indietro
          </Button>
          <Typography color="error">Agente non trovato.</Typography>
        </div>
      </div>
    );
  }

  const { agent, stats, customers, orders, commissions_details } = data;

  return (
    <div className="w-100 paddingContainer" style={{ backgroundColor: "#f6f8fb" }}>
      <div className="mt-3 w-100 d-flex flex-column">
        {/* Back */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/admin/dashboard")}
          sx={{ mb: 2, color: "text.secondary", alignSelf: "flex-start", textTransform: "none", fontWeight: 600, fontSize: "13px" }}
        >
          Tutti gli agenti
        </Button>

        {/* Agent header card */}
        <Box
          sx={{
            backgroundColor: "#13131f",
            borderRadius: "6px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            p: 3,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
            mb: 3,
          }}
        >
          <Avatar sx={{ width: 52, height: 52, bgcolor: "#12715b", fontSize: 20, flexShrink: 0 }}>
            {agent.first_name?.charAt(0)}{agent.last_name?.charAt(0)}
          </Avatar>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {agent.first_name} {agent.last_name}
            </Typography>
            <Typography sx={{ color: "#b2b2b2", fontSize: "14px", mt: 0.25 }}>
              {agent.email}
            </Typography>
            <div className="d-flex gap-1 flex-wrap mt-2">
              {agent.coupon && (
                <Chip label={`Coupon: ${agent.coupon}`} size="small" sx={{ bgcolor: "rgba(18,113,91,0.2)", color: "#4ade80", fontWeight: 600, fontSize: 11 }} />
              )}
              {agent.commission_plan && (
                <Chip
                  label={`Piano: ${
                    typeof agent.commission_plan === "object"
                      ? ((agent.commission_plan as { name?: string }).name ?? Object.values(agent.commission_plan as object)[0] ?? "—")
                      : agent.commission_plan
                  }`}
                  size="small"
                  sx={{ bgcolor: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontWeight: 600, fontSize: 11 }}
                />
              )}
            </div>
          </div>
        </Box>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Box sx={{
            backgroundColor: "white", borderRadius: "6px", border: "1px solid #eef0f4", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", p: 3,
            display: "flex", alignItems: "flex-start", gap: 1.5,
          }}>
            <Box sx={{ backgroundColor: "#12715b1a", borderRadius: "6px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Groups style={{ color: "#12715b", fontSize: "22px" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#64748b", fontSize: "16px", fontWeight: 500, lineHeight: 1.3 }}>Clienti registrati</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#13131f", lineHeight: 1.3, mt: 0.25 }}>{stats.customers_count ?? 0}</Typography>
            </Box>
          </Box>
          <Box sx={{
            backgroundColor: "white", borderRadius: "6px", border: "1px solid #eef0f4", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", p: 3,
            display: "flex", alignItems: "flex-start", gap: 1.5,
          }}>
            <Box sx={{ backgroundColor: "#6366f11a", borderRadius: "6px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShoppingCart style={{ color: "#6366f1", fontSize: "22px" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#64748b", fontSize: "16px", fontWeight: 500, lineHeight: 1.3 }}>Ordini completati</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#13131f", lineHeight: 1.3, mt: 0.25 }}>{stats.orders_count ?? 0}</Typography>
            </Box>
          </Box>
          <Box sx={{
            backgroundColor: "white", borderRadius: "6px", border: "1px solid #eef0f4", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", p: 3,
            display: "flex", alignItems: "flex-start", gap: 1.5,
          }}>
            <Box sx={{ backgroundColor: "#f59e0b1a", borderRadius: "6px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <EuroSymbol style={{ color: "#f59e0b", fontSize: "22px" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#64748b", fontSize: "16px", fontWeight: 500, lineHeight: 1.3 }}>Commissioni totali</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#13131f", lineHeight: 1.3, mt: 0.25 }}>{`€ ${(stats.total_commissions ?? 0).toFixed(2)}`}</Typography>
            </Box>
          </Box>
        </div>

        {/* Tabs */}
        <div className="dash-card mb-6" style={{ overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 2,
              borderBottom: "1px solid #eef0f4",
              "& .MuiTab-root": { fontWeight: 600, fontSize: 14, textTransform: "none" },
              "& .Mui-selected": { color: "#12715b!" },
              "& .MuiTabs-indicator": { bgcolor: "#12715b" },
            }}
          >
            <Tab label={`Clienti (${customers?.length ?? 0})`} icon={<Person fontSize="small" />} iconPosition="start" />
            <Tab label={`Ordini (${orders?.length ?? 0})`} icon={<ReceiptLong fontSize="small" />} iconPosition="start" />
            <Tab label={`Commissioni (${commissions_details?.length ?? 0})`} icon={<AccountBalanceWallet fontSize="small" />} iconPosition="start" />
          </Tabs>

          <Box px={3} pb={3}>
            {/* Customers tab */}
            <TabPanel value={tab} index={0}>
              <TableContainer component={Paper} sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
                    <TableRow>
                      {["ID", "Nome", "Email", "Data registrazione"].map((label) => (
                        <TableCell key={label} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                          <span className="text-[14px] whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(customers ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, borderBottom: "1px solid #eef0f4", color: "#94a3b8", fontSize: 14 }}>
                          Nessun cliente.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((c) => (
                        <TableRow key={c.id} sx={{ transition: "background-color 0.15s ease", "&:hover": { backgroundColor: "#f8f9fb" }, "&:last-child td": { borderBottom: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#94a3b8" }}>{c.id}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333", fontWeight: 500 }}>
                            {c.name ?? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>{c.email}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString("it-IT") : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Orders tab */}
            <TabPanel value={tab} index={1}>
              <TableContainer component={Paper} sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
                    <TableRow>
                      {["ID", "Cliente", "Stato", "Totale", "Data"].map((label) => (
                        <TableCell key={label} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                          <span className="text-[14px] whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(orders ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, borderBottom: "1px solid #eef0f4", color: "#94a3b8", fontSize: 14 }}>
                          Nessun ordine.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((o) => (
                        <TableRow key={o.id} sx={{ transition: "background-color 0.15s ease", "&:hover": { backgroundColor: "#f8f9fb" }, "&:last-child td": { borderBottom: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#94a3b8" }}>{o.id}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333", fontWeight: 500 }}>{o.customer_name ?? "—"}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                            <Chip label={o.status ?? "completato"} size="small" sx={{ bgcolor: "#e8f5e9", color: "#12715b", fontWeight: 600, fontSize: 11 }} />
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#12715b", fontWeight: 600 }}>
                            € {(o.total ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                            {o.created_at ? new Date(o.created_at).toLocaleDateString("it-IT") : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Commissions tab */}
            <TabPanel value={tab} index={2}>
              <TableContainer component={Paper} sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
                    <TableRow>
                      {["ID", "Tipo", "Ordine #", "Importo", "Data"].map((label) => (
                        <TableCell key={label} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                          <span className="text-[14px] whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(commissions_details ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, borderBottom: "1px solid #eef0f4", color: "#94a3b8", fontSize: 14 }}>
                          Nessuna commissione.
                        </TableCell>
                      </TableRow>
                    ) : (
                      commissions_details.map((c) => (
                        <TableRow key={c.id} sx={{ transition: "background-color 0.15s ease", "&:hover": { backgroundColor: "#f8f9fb" }, "&:last-child td": { borderBottom: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#94a3b8" }}>{c.id}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                            <Chip
                              label={c.type}
                              size="small"
                              sx={{
                                bgcolor: c.type === "direct" ? "#e8f5e9" : c.type === "affiliate" ? "#ede9fe" : "#fff3e0",
                                color: c.type === "direct" ? "#12715b" : c.type === "affiliate" ? "#6366f1" : "#f59e0b",
                                fontWeight: 600, fontSize: 11,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>{c.order_id ?? "—"}</TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#12715b", fontWeight: 600 }}>
                            € {(c.amount ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                            {c.created_at ? new Date(c.created_at).toLocaleDateString("it-IT") : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Box>
        </div>
      </div>
    </div>
  );
}
