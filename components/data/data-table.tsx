"use client";

import { useState, type ReactNode } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface TableColumn<T = Record<string, unknown>> {
  label: string;
  field: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string | number }> {
  columns: TableColumn<T>[];
  data: T[];
  showCheckbox?: boolean;
}

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  showCheckbox = false,
}: DataTableProps<T>) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  const isMobile = useMediaQuery("(max-width: 900px)");

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String((row as Record<string, unknown>)[col.field] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const pagedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === filteredData.length
        ? []
        : filteredData.map((row) => row.id),
    );
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  return (
    <div className="dash-card p-5 mb-6">
      <TextField
        variant="outlined"
        placeholder="Cerca..."
        size="small"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

      {isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
          {pagedData.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, padding: "24px 0" }}>Nessun risultato trovato</p>
          ) : (
            pagedData.map((row) => {
              const dataColumns = columns.filter((c) => c.field !== "action");
              const actionColumn = columns.find((c) => c.field === "action");
              return (
                <div key={row.id} style={{ background: "#fff", border: "1px solid #eef0f4", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      {dataColumns.map((col) => (
                        <div key={col.field} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</span>
                          <span style={{ fontSize: 16, color: "#1e293b", wordBreak: "break-word" }}>
                            {typeof col.render === "function"
                              ? col.render(row)
                              : String((row as Record<string, unknown>)[col.field] ?? "")}
                          </span>
                        </div>
                      ))}
                    </div>
                    {actionColumn && (
                      <div style={{ flexShrink: 0 }}>
                        {typeof actionColumn.render === "function"
                          ? actionColumn.render(row)
                          : String((row as Record<string, unknown>)[actionColumn.field] ?? "")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {!isMobile && <TableContainer
        component={Paper}
        sx={{
          borderRadius: "8px",
          boxShadow: "none",
          border: "1px solid #e5e7ec",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
            <TableRow>
              {showCheckbox && (
                <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                  <Checkbox
                    checked={
                      selectedRows.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < filteredData.length
                    }
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}
                >
                  <span className="text-[14px] whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wide">
                    {col.label}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedData.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  transition: "background-color 0.15s ease",
                  "&:hover": { backgroundColor: "#f8f9fb" },
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                {showCheckbox && (
                  <TableCell
                    sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}
                  >
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      size="small"
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.field}
                    sx={{
                      borderBottom: "1px solid #eef0f4",
                      py: 1.5,
                      fontSize: 14,
                      color: "#333",
                    }}
                  >
                    {typeof col.render === "function"
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[col.field] ?? "",
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>}

      {/* Footer */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Precedente */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              border: '1px solid',
              borderColor: page === 1 ? '#f1f3f5' : '#e5e7ec',
              backgroundColor: 'transparent',
              color: page === 1 ? '#cbd5e1' : '#374151',
              fontSize: 13,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => { if (page !== 1) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f6f8fb'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4c8d0'; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = page === 1 ? '#f1f3f5' : '#e5e7ec'; }}
          >
            Precedente
          </button>

          {/* Mobile prev arrow */}
          {isMobile && (
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ height: 32, width: 32, borderRadius: 6, border: '1px solid', borderColor: page === 1 ? '#f1f3f5' : '#e5e7ec', backgroundColor: 'transparent', color: page === 1 ? '#cbd5e1' : '#374151', fontSize: 16, cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ‹
            </button>
          )}

          {/* Page number pills */}
          {(() => {
            const pills: (number | 'ellipsis-l' | 'ellipsis-r')[] = [];
            if (isMobile) {
              pills.push(page);
            } else if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pills.push(i);
            } else {
              pills.push(1);
              if (page > 3) pills.push('ellipsis-l');
              const start = Math.max(2, page - 1);
              const end   = Math.min(totalPages - 1, page + 1);
              for (let i = start; i <= end; i++) pills.push(i);
              if (page < totalPages - 2) pills.push('ellipsis-r');
              pills.push(totalPages);
            }
            return pills.map((p, idx) =>
              typeof p === 'string' ? (
                <span key={p + idx} style={{ fontSize: 13, color: '#94a3b8', width: 24, textAlign: 'center' }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    height: 32,
                    minWidth: 32,
                    paddingLeft: 4,
                    paddingRight: 4,
                    borderRadius: 6,
                    border: p === page ? 'none' : '1px solid transparent',
                    backgroundColor: p === page ? '#12715b' : 'transparent',
                    color: p === page ? '#fff' : '#374151',
                    fontSize: 13,
                    fontWeight: p === page ? 600 : 400,
                    cursor: p === page ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f6f8fb'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7ec'; } }}
                  onMouseLeave={(e) => { if (p !== page) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; } }}
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
              style={{ height: 32, width: 32, borderRadius: 6, border: '1px solid', borderColor: page === totalPages ? '#f1f3f5' : '#e5e7ec', backgroundColor: 'transparent', color: page === totalPages ? '#cbd5e1' : '#374151', fontSize: 16, cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ›
            </button>
          )}

          {/* Successivo */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              height: 32,
              padding: '0 12px',
              borderRadius: 6,
              border: '1px solid',
              borderColor: page === totalPages ? '#f1f3f5' : '#e5e7ec',
              backgroundColor: 'transparent',
              color: page === totalPages ? '#cbd5e1' : '#374151',
              fontSize: 13,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => { if (page !== totalPages) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f6f8fb'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4c8d0'; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = page === totalPages ? '#f1f3f5' : '#e5e7ec'; }}
          >
            Successivo
          </button>
        </div>
      </div>
    </div>
  );
}
