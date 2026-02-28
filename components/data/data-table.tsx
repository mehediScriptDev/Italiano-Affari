"use client";

import { useState, type ReactNode } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Checkbox, FormControl, Select, MenuItem,
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
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "10px",
        p: 2,
        mb: 3,
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      }}
    >
      <TextField
        variant="outlined"
        placeholder="Cerca..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "black" },
            "&.Mui-focused fieldset": { borderColor: "black" },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "black" }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "none" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
            <TableRow>
              {showCheckbox && (
                <TableCell>
                  <Checkbox
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.field}>
                  <Typography fontSize={14} fontWeight="bold">
                    {col.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.slice(0, rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                {showCheckbox && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.field}>
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

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography>Selezionati: {selectedRows.length}</Typography>
        <FormControl size="small" sx={{ width: 80 }}>
          <Select
            value={rowsPerPage}
            onChange={(e: SelectChangeEvent<number>) => setRowsPerPage(Number(e.target.value))}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
