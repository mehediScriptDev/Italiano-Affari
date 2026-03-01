"use client";

import { Fragment, useState, type ReactNode } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, FormControl, Select, MenuItem, InputAdornment,
  TextField, Collapse, type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";


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
                  backgroundColor: "#13131f",
                  marginLeft: paddingLeft,
                }}
              />
              {hasSubagents && (
                <hr
                  className="!opacity-100 border-0 position-relative"
                  style={{ backgroundColor: "#13131f", height: "3px", right: "2px" }}
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
            <TableCell style={{ padding: 0 }} colSpan={columns.length + 1}>
              <Collapse in={expandedRows[row.id]} timeout="auto" unmountOnExit>
                <div>
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
                </div>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    );
  };

  return (
    <div className="dash-card mb-6 overflow-x-auto min-w-150 w-full">
      <div className="p-4 pb-0">
        <TextField
          variant="outlined" placeholder="Cerca..." size="small"
          value={search} onChange={(e) => setSearch(e.target.value)}
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
      </div>

      <TableContainer component={Paper} sx={{ borderRadius: "0 0 12px 12px", boxShadow: "none", width: "100%", overflowX: "auto" }}>
        <Table size="small" sx={{ tableLayout: "auto" }}>
          <colgroup>
            <col style={{ width: toggleColWidth }} />
            {columns.map((col) => (
              <col key={col.field} style={{ width: col.width || otherColsWidth }} />
            ))}
          </colgroup>
          <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
            <TableRow>
              <TableCell />
              {columns.map((col) => (
                <TableCell key={col.field} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{col.label}</span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{filteredData.slice(0, rowsPerPage).map((row) => renderRow(row))}</TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-end items-center p-3">
        <FormControl size="small" sx={{ width: 80 }}>
          <Select
            value={rowsPerPage}
            onChange={(e: SelectChangeEvent<number>) => setRowsPerPage(Number(e.target.value))}
            sx={{
              borderRadius: "8px",
              fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7ec" },
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
