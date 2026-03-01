"use client";

import { useState, type ReactNode } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Checkbox, FormControl, Select, MenuItem,
  InputAdornment, TextField, type SelectChangeEvent,
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
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String((row as Record<string, unknown>)[col.field] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === filteredData.length
        ? []
        : filteredData.map((row) => row.id)
    );
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="dash-card p-5 mb-6">
      <TextField
        variant="outlined"
        placeholder="Cerca..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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

      <TableContainer
        component={Paper}
        sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
            <TableRow>
              {showCheckbox && (
                <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                  <Checkbox
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                    onChange={handleSelectAll}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.field} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {col.label}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.slice(0, rowsPerPage).map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  transition: "background-color 0.15s ease",
                  "&:hover": { backgroundColor: "#f8f9fb" },
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                {showCheckbox && (
                  <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
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
                    sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}
                  >
                    {typeof col.render === "function"
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.field] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-[13px] text-slate-500">Selezionati: {selectedRows.length}</span>
        <FormControl size="small" sx={{ width: 80 }}>
          <Select
            value={rowsPerPage}
            onChange={(e: SelectChangeEvent<number>) => setRowsPerPage(Number(e.target.value))}
            sx={{
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
      </div>
    </div>
  );
}
