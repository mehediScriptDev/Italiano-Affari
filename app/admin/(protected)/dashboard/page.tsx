"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Groups,
  ShoppingCart,
  EuroSymbol,
  OpenInNew,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchAdminAgents } from "@/lib/api/admin";
import type { AdminAgent, AdminAgentsResponse } from "@/lib/types/admin";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminAgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminAgents({
        page,
        per_page: rowsPerPage,
        search: search || undefined,
      });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const agents = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const totalCommissions = agents.reduce((s, a) => s + (a.total_commissions ?? 0), 0);
  const totalOrders = agents.reduce((s, a) => s + (a.orders_count ?? 0), 0);

  return (
    <div className="w-100 paddingContainer" style={{ backgroundColor: "#f6f8fb" }}>
      <div className="mt-3 w-100 d-flex flex-column">
        {/* Page header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="page-title">Panoramica Agenti</h1>
            <p className="page-subtitle">Monitora la rete agenti, le commissioni e gli ordini.</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Agenti totali */}
          <Box sx={{
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            p: 3,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}>
            <Box sx={{ backgroundColor: "#12715b1a", borderRadius: "6px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Groups style={{ color: "#12715b", fontSize: "22px" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#64748b", fontSize: "16px", fontWeight: 500, lineHeight: 1.3 }}>Agenti totali</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#13131f", lineHeight: 1.3, mt: 0.25 }}>{loading ? "—" : total}</Typography>
            </Box>
          </Box>
          {/* Ordini completati */}
          <Box sx={{
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            p: 3,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}>
            <Box sx={{ backgroundColor: "#6366f11a", borderRadius: "6px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShoppingCart style={{ color: "#6366f1", fontSize: "22px" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#64748b", fontSize: "16px", fontWeight: 500, lineHeight: 1.3 }}>Ordini completati</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#13131f", lineHeight: 1.3, mt: 0.25 }}>{loading ? "—" : totalOrders}</Typography>
            </Box>
          </Box>
          {/* Commissioni totali */}
          <Box sx={{
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            p: 3,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}>
            <Box sx={{ backgroundColor: "#f59e0b1a", borderRadius: "6px", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <EuroSymbol style={{ color: "#f59e0b", fontSize: "22px" }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#64748b", fontSize: "16px", fontWeight: 500, lineHeight: 1.3 }}>Commissioni totali</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "22px", color: "#13131f", lineHeight: 1.3, mt: 0.25 }}>{loading ? "—" : `€ ${totalCommissions.toFixed(2)}`}</Typography>
            </Box>
          </Box>
        </div>

        {/* Table section */}
        <div className="mt-2">
          <h5 className="mb-1 text-lg font-medium">Lista Agenti</h5>
        </div>

        <div className="dash-card p-5 mb-6">
          {/* Search */}
          <TextField
            variant="outlined"
            placeholder="Cerca per nome o email…"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="mb-4!"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#f6f8fb",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#c4c8d0" },
                "&.Mui-focused fieldset": { borderColor: "#13131f" },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748b", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Mobile cards */}
          {isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress size={32} sx={{ color: "#12715b" }} /></Box>
              ) : agents.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, padding: "24px 0" }}>Nessun agente trovato</p>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent.id}
                    style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", cursor: "pointer" }}
                    onClick={() => router.push(`/admin/agents/${agent.id}`)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agente</span>
                          <span style={{ fontSize: 16, color: "#1e293b" }}>{agent.first_name} {agent.last_name}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</span>
                          <span style={{ fontSize: 16, color: "#1e293b", wordBreak: "break-word" }}>{agent.email}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Clienti / Ordini</span>
                          <span style={{ fontSize: 16, color: "#1e293b" }}>{agent.customers_count ?? 0} / {agent.orders_count ?? 0}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Commissioni</span>
                          <span style={{ fontSize: 16, color: "#12715b", fontWeight: 600 }}>€ {(agent.total_commissions ?? 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); router.push(`/admin/agents/${agent.id}`); }}>
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Desktop table */}
          {!isMobile && (
            <TableContainer component={Paper} sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
                  <TableRow>
                    {["Agente", "Email", "Clienti", "Ordini", "Commissioni", "Dettagli"].map((label) => (
                      <TableCell key={label} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                        <span className="text-[14px] whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "1px solid #eef0f4" }}>
                        <CircularProgress size={32} sx={{ color: "#12715b" }} />
                      </TableCell>
                    </TableRow>
                  ) : agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: "1px solid #eef0f4", color: "#94a3b8", fontSize: 14 }}>
                        Nessun agente trovato.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent: AdminAgent) => (
                      <TableRow
                        key={agent.id}
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:hover": { backgroundColor: "#f8f9fb" },
                          "&:last-child td": { borderBottom: 0 },
                        }}
                        onClick={() => router.push(`/admin/agents/${agent.id}`)}
                      >
                        <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: "#13131f", fontSize: 13 }}>
                              {agent.first_name?.charAt(0)}{agent.last_name?.charAt(0)}
                            </Avatar>
                            <span style={{ fontWeight: 600 }}>{agent.first_name} {agent.last_name}</span>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                          {agent.email}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                          <Chip label={agent.customers_count ?? 0} size="small" sx={{ bgcolor: "#e8f5e9", color: "#12715b", fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                          <Chip label={agent.orders_count ?? 0} size="small" sx={{ bgcolor: "#ede9fe", color: "#6366f1", fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#12715b", fontWeight: 600 }}>
                          € {(agent.total_commissions ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }} onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="Visualizza dettagli">
                            <IconButton size="small" onClick={() => router.push(`/admin/agents/${agent.id}`)}>
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination — matches partner DataTable exactly */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-1 gap-3">
            {/* Left: Mostra [N] righe per pagina */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-400 whitespace-nowrap">Mostra</span>
              <FormControl size="small" sx={{ width: 68 }}>
                <Select
                  value={rowsPerPage}
                  onChange={(e: SelectChangeEvent<number>) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  sx={{
                    height: 32,
                    borderRadius: "8px",
                    fontSize: 13,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7ec" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c4c8d0" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#13131f" },
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <span className="text-[13px] text-slate-400 whitespace-nowrap hidden sm:inline">righe per pagina</span>
            </div>

            {/* Right: Precedente  1  2  3 …  Successivo */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Precedente (desktop) */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  height: 32, padding: "0 12px", borderRadius: 6,
                  border: "1px solid", borderColor: page === 1 ? "#f1f3f5" : "#e5e7ec",
                  backgroundColor: "transparent", color: page === 1 ? "#cbd5e1" : "#374151",
                  fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", transition: "all 0.15s",
                  display: isMobile ? "none" : "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => { if (page !== 1) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f6f8fb"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#c4c8d0"; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = page === 1 ? "#f1f3f5" : "#e5e7ec"; }}
              >
                Precedente
              </button>

              {/* Mobile prev arrow */}
              {isMobile && (
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ height: 32, width: 32, borderRadius: 6, border: "1px solid", borderColor: page === 1 ? "#f1f3f5" : "#e5e7ec", backgroundColor: "transparent", color: page === 1 ? "#cbd5e1" : "#374151", fontSize: 16, cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ‹
                </button>
              )}

              {/* Page number pills */}
              {(() => {
                const pills: (number | "ellipsis-l" | "ellipsis-r")[] = [];
                if (isMobile) {
                  pills.push(page);
                } else if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pills.push(i);
                } else {
                  pills.push(1);
                  if (page > 3) pills.push("ellipsis-l");
                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);
                  for (let i = start; i <= end; i++) pills.push(i);
                  if (page < totalPages - 2) pills.push("ellipsis-r");
                  pills.push(totalPages);
                }
                return pills.map((p, idx) =>
                  typeof p === "string" ? (
                    <span key={p + idx} style={{ fontSize: 13, color: "#94a3b8", width: 24, textAlign: "center" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        height: 32, minWidth: 32, paddingLeft: 4, paddingRight: 4, borderRadius: 6,
                        border: p === page ? "none" : "1px solid transparent",
                        backgroundColor: p === page ? "#12715b" : "transparent",
                        color: p === page ? "#fff" : "#374151",
                        fontSize: 13, fontWeight: p === page ? 600 : 400,
                        cursor: p === page ? "default" : "pointer",
                        transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      onMouseEnter={(e) => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f6f8fb"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7ec"; } }}
                      onMouseLeave={(e) => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; } }}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              {/* Mobile next arrow */}
              {isMobile && (
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ height: 32, width: 32, borderRadius: 6, border: "1px solid", borderColor: page === totalPages ? "#f1f3f5" : "#e5e7ec", backgroundColor: "transparent", color: page === totalPages ? "#cbd5e1" : "#374151", fontSize: 16, cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ›
                </button>
              )}

              {/* Successivo (desktop) */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  height: 32, padding: "0 12px", borderRadius: 6,
                  border: "1px solid", borderColor: page === totalPages ? "#f1f3f5" : "#e5e7ec",
                  backgroundColor: "transparent", color: page === totalPages ? "#cbd5e1" : "#374151",
                  fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", transition: "all 0.15s",
                  display: isMobile ? "none" : "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => { if (page !== totalPages) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f6f8fb"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#c4c8d0"; } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = page === totalPages ? "#f1f3f5" : "#e5e7ec"; }}
              >
                Successivo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
