"use client";

import { Fragment, useState, type ReactNode } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, FormControl, Select, MenuItem, InputAdornment,
  TextField, Collapse, type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import "@/styles/dynamic-table.css";

export interface DynamicColumn {
  label: string;
  field: string;
  width?: string;
  maxWidth?: string;
  renderCell?: (row: DynamicRow) => ReactNode;
}

export interface DynamicRow {
  id: string | number;
  subagents?: DynamicRow[];
  [key: string]: unknown;
}

interface DynamicDataTableProps {
  columns: DynamicColumn[];
  data: DynamicRow[];
  showCheckbox?: boolean;
}

export default function DynamicDataTable({ columns, data }: DynamicDataTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  const toggleColWidth = "10%";
  const otherColsWidth = `${90 / columns.length}%`;

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      String(row[col.field] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const toggleExpand = (id: string | number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderRow = (row: DynamicRow, level = 0): ReactNode => {
    const hasSubagents = row.subagents && row.subagents.length > 0;
    const paddingLeft = `${level * 7}px`;

    return (
      <Fragment key={row.id}>
        <TableRow>
          <TableCell className="p-0" sx={{ width: toggleColWidth, position: "relative", marginLeft: 10 }}>
            <div
              className="d-flex justify-start align-center ms-1"
              onClick={() => toggleExpand(row.id)}
              style={{ paddingLeft, cursor: "pointer" }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "4px",
                  height: "54px",
                  top: "-1px",
                  bottom: "0px",
                  width: "3px",
                  backgroundColor: "#12715b",
                  marginLeft: paddingLeft,
                }}
              />
              {hasSubagents && (
                <hr
                  className="opacity1 border-0 position-relative"
                  style={{ backgroundColor: "#12715b", height: "3px", right: "2px" }}
                />
              )}
              {hasSubagents &&
                (expandedRows[row.id] ? (
                  <IndeterminateCheckBoxIcon className="position-relative" style={{ right: "5px" }} color="secondary" />
                ) : (
                  <CheckBoxOutlineBlankIcon className="position-relative" style={{ right: "5px" }} color="primary" />
                ))}
            </div>
          </TableCell>
          {columns.map((col) => (
            <TableCell
              key={col.field}
              sx={{
                width: col.width || otherColsWidth,
                maxWidth: col.maxWidth || "none",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {col.field === "action" && typeof col.renderCell === "function"
                ? col.renderCell(row)
                : String(row[col.field] ?? "")}
            </TableCell>
          ))}
        </TableRow>

        {hasSubagents && (
          <TableRow>
            <TableCell className="p-0" colSpan={columns.length + 1}>
              <Collapse in={expandedRows[row.id]} timeout="auto" unmountOnExit>
                <Box>
                  <Table size="small" sx={{ width: "100%", tableLayout: "auto" }}>
                    <colgroup>
                      <col style={{ width: toggleColWidth }} />
                      {columns.map((col) => (
                        <col key={col.field} style={{ width: col.width || otherColsWidth }} />
                      ))}
                    </colgroup>
                    <TableBody sx={{ m: 0, p: 0 }}>
                      {row.subagents!.map((subRow) => renderRow(subRow, level + 1))}
                    </TableBody>
                  </Table>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: "white", borderRadius: "10px", p: 2, mb: 3,
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        overflowX: "auto", minWidth: "600px", width: "100%",
      }}
    >
      <TextField
        variant="outlined" placeholder="Cerca..." size="small"
        value={search} onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, "& .MuiOutlinedInput-root": { "&:hover fieldset": { borderColor: "black" }, "&.Mui-focused fieldset": { borderColor: "black" } } }}
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

      <TableContainer component={Paper} sx={{ borderRadius: "10px", boxShadow: "none", width: "100%", overflowX: "auto" }}>
        <Table size="small" sx={{ tableLayout: "auto" }}>
          <colgroup>
            <col style={{ width: toggleColWidth }} />
            {columns.map((col) => (
              <col key={col.field} style={{ width: col.width || otherColsWidth }} />
            ))}
          </colgroup>
          <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
            <TableRow>
              <TableCell />
              {columns.map((col) => (
                <TableCell key={col.field}>
                  <Typography fontSize={14} fontWeight="bold">{col.label}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{filteredData.slice(0, rowsPerPage).map((row) => renderRow(row))}</TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2}>
        <FormControl size="small" sx={{ width: 80 }}>
          <Select value={rowsPerPage} onChange={(e: SelectChangeEvent<number>) => setRowsPerPage(Number(e.target.value))}>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
