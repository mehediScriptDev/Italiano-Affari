"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Tooltip,
  Autocomplete,
  FormControl,
  Select,
  useMediaQuery,
  type SelectChangeEvent,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PhotoLibrary,
  CloudUpload,
  Close,
} from "@mui/icons-material";
import {
  fetchAdminContents,
  createContent,
  updateContent,
  deleteContent,
  fetchAdminCategories,
  fetchAdminFilters,
} from "@/lib/api/admin";
import type { AdminContent, CreateContentPayload, UpdateContentPayload } from "@/lib/types/admin";

const GENDER_OPTIONS = [
  { value: "male", label: "Uomo" },
  { value: "female", label: "Donna" },
  { value: "all", label: "Tutti" },
];

const EMPTY_FORM = {
  user_id: "",
  title: "",
  description: "",
  gender: "all" as "male" | "female" | "all",
  category: "",
  tags: "",
};

type FormMode = "create" | "edit";

// ── Drag & Drop Upload Zone ──
function DropZone({
  file,
  mode,
  fileInputRef,
  onFileChange,
}: {
  file: File | null;
  mode: FormMode;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (f: File) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFileChange(dropped);
    },
    [onFileChange]
  );

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(f); }}
      />
      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragging ? "#12715b" : "#cbd5e1"}`,
          borderRadius: "12px",
          bgcolor: dragging ? "#f0fdf4" : "#fafbfc",
          cursor: "pointer",
          py: 3.5,
          px: 2,
          textAlign: "center",
          transition: "border-color 0.2s, background-color 0.2s",
          "&:hover": { borderColor: "#12715b", bgcolor: "#f0fdf4" },
        }}
      >
        {file ? (
          <>
            <CloudUpload sx={{ fontSize: 36, color: "#12715b", mb: 0.5 }} />
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#12715b" }}>
              {file.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.25 }}>
              {(file.size / 1024).toFixed(1)} KB — clicca per cambiare
            </Typography>
          </>
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 36, color: "#94a3b8", mb: 0.5 }} />
            <Typography sx={{ fontSize: 13, color: "#475569" }}>
              <Box component="span" sx={{ fontWeight: 700, color: "#12715b" }}>
                Browse your device
              </Box>
              {" "}or{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#12715b" }}>
                drag &apos;n drop
              </Box>
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.5 }}>
              {mode === "edit" ? "Optional — replaces existing file" : "Maximum file size is 2 MB"}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default function AdminContentsPage() {
  const isMobile = useMediaQuery("(max-width: 900px)");

  // ALL items fetched at once (backend ignores per_page — always 10/page, so we
  // drain all API pages on mount and do pagination entirely client-side).
  const [allContents, setAllContents] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Client-side pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Drain all backend pages and collect every item
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const all: AdminContent[] = [];
      let pg = 1;
      while (true) {
        const res = await fetchAdminContents(pg, 10); // backend always returns 10
        all.push(...res.data);
        if (pg >= res.last_page) break;
        pg++;
      }
      setAllContents(all);

      // Rebuild option lists from actual data
      const catSet = new Set<string>();
      const tagSet = new Set<string>();
      all.forEach((item) => {
        item.categories?.forEach((c) => catSet.add(c.name));
        item.filters?.forEach((f) => tagSet.add(f.name));
      });

      // Also fetch from the dedicated endpoints and merge
      try {
        const [cats, filters] = await Promise.all([fetchAdminCategories(), fetchAdminFilters()]);
        cats.forEach((c) => catSet.add(c.name));
        filters.forEach((f) => tagSet.add(f.name));
      } catch { /* ignore */ }

      setCategoryOptions([...catSet].sort());
      setFilterOptions([...tagSet].sort());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Derived client-side slice
  const totalPages = Math.max(1, Math.ceil(allContents.length / perPage));
  const safePage = Math.min(page, totalPages);
  const contents = allContents.slice((safePage - 1) * perPage, safePage * perPage);

  const openCreate = () => {
    setMode("create");
    setForm(EMPTY_FORM);
    setSelectedTags([]);
    setFile(null);
    setFormError("");
    setSelectedId(null);
    setDialogOpen(true);
  };

  const openEdit = (c: AdminContent) => {
    setMode("edit");
    setSelectedId(c.id);
    const catName = c.categories?.[0]?.name ?? c.category ?? "";
    const tagArr = c.filters?.map((f) => f.name) ?? c.tags ?? [];
    setForm({
      user_id: String(c.user_id),
      title: c.title,
      description: c.description ?? "",
      gender: c.gender,
      category: catName,
      tags: tagArr.join(", "),
    });
    setSelectedTags(tagArr);
    setFile(null);
    setFormError("");
    setDialogOpen(true);
  };

  const openDelete = (id: number) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.title || !form.gender || !form.category) {
      setFormError("Titolo, genere e categoria sono obbligatori.");
      return;
    }
    if (mode === "create" && !file) {
      setFormError("Seleziona un file multimediale.");
      return;
    }

    setSaving(true);
    try {
      const tags = selectedTags;

      if (mode === "create") {
        const payload: CreateContentPayload = {
          user_id: Number(form.user_id) || 1,
          title: form.title,
          description: form.description || undefined,
          file: file!,
          gender: form.gender,
          category: form.category,
          tags,
        };
        const created = await createContent(payload);
        // Use the API response directly (includes eager-loaded categories/filters)
        setAllContents((prev) => [created, ...prev]);
      } else if (selectedId !== null) {
        const payload: UpdateContentPayload = {
          title: form.title,
          description: form.description || undefined,
          gender: form.gender,
          category: form.category,
          tags,
          file: file ?? undefined,
        };
        const updated = await updateContent(selectedId, payload);
        // Replace the item in the list with the full response
        setAllContents((prev) => prev.map((c) => (c.id === selectedId ? updated : c)));
      }

      setDialogOpen(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedId === null) return;
    setSaving(true);
    try {
      await deleteContent(selectedId);
      setAllContents((prev) => prev.filter((c) => c.id !== selectedId));
      setDeleteDialogOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const genderColor = (g: string) => {
    if (g === "male") return { bgcolor: "#ede9fe", color: "#6366f1" };
    if (g === "female") return { bgcolor: "#fce7f3", color: "#ec4899" };
    return { bgcolor: "#e8f5e9", color: "#12715b" };
  };

  return (
    <div className="w-100 paddingContainer" style={{ backgroundColor: "#f6f8fb" }}>
      <div className="mt-3 w-100 d-flex flex-column">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h1 className="page-title">Gestione Contenuti</h1>
            <p className="page-subtitle">Crea, modifica ed elimina i contenuti multimediali.</p>
          </div>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={openCreate}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "14px", borderRadius: "8px" }}
          >
            Nuovo contenuto
          </Button>
        </div>

        {/* Table / Cards */}
        <div className={isMobile ? "mb-6" : "dash-card p-4 mb-6"}>

          {/* ── Mobile card view ── */}
          {isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                  <CircularProgress size={32} sx={{ color: "#12715b" }} />
                </Box>
              ) : contents.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <PhotoLibrary sx={{ fontSize: 48, color: "#e0e0e0", mb: 1, display: "block", mx: "auto" }} />
                  <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>Nessun contenuto trovato. Creane uno!</Typography>
                </Box>
              ) : (
                contents.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      padding: "16px 18px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderLeft: "4px solid #12715b",
                    }}
                  >
                    {/* Top: title + actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.title}
                        </div>
                        {c.description && (
                          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>
                            {c.description}
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", gap: 4 }}>
                        <IconButton size="small" onClick={() => openEdit(c)} sx={{ color: "#64748b", bgcolor: "#f1f5f9", borderRadius: "8px", "&:hover": { bgcolor: "#e2e8f0" } }}>
                          <Edit sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => openDelete(c.id)} sx={{ color: "#ef4444", bgcolor: "#fef2f2", borderRadius: "8px", "&:hover": { bgcolor: "#fee2e2" } }}>
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#f1f5f9", margin: "10px 0" }} />

                    {/* Meta: category + gender + tags */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Categoria</span>
                          <span style={{ fontSize: 14, color: "#1e293b" }}>{c.categories?.[0]?.name ?? c.category ?? "—"}</span>
                        </div>
                        <Chip label={c.gender} size="small" sx={{ ...genderColor(c.gender), fontWeight: 600, fontSize: 11, height: 22 }} />
                      </div>
                      {((c.filters?.length ?? c.tags?.length ?? 0) > 0) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tag</span>
                          {(c.filters?.map((f) => f.name) ?? c.tags ?? []).map((t) => (
                            <Chip key={t} label={t} size="small" sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: 11, height: 22 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Desktop table ── */}
          {!isMobile && <TableContainer component={Paper} sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}>
            <Table sx={{ tableLayout: "fixed", minWidth: 700 }}>
              <colgroup>
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
                <TableRow>
                  {[
                    "Titolo",
                    "Categoria",
                    "Genere",
                    "Tag",
                    "Azioni",
                  ].map((label) => (
                    <TableCell key={label} sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                      <span className="text-[15px] whitespace-nowrap font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, borderBottom: "1px solid #eef0f4" }}>
                      <CircularProgress size={32} sx={{ color: "#12715b" }} />
                    </TableCell>
                  </TableRow>
                ) : contents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8, borderBottom: "1px solid #eef0f4" }}>
                      <PhotoLibrary sx={{ fontSize: 48, color: "#e0e0e0", mb: 1, display: "block", mx: "auto" }} />
                      <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
                        Nessun contenuto trovato. Creane uno!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map((c) => (
                    <TableRow key={c.id} sx={{ transition: "background-color 0.15s ease", "&:hover": { backgroundColor: "#f8f9fb" }, "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 16, color: "#333", overflow: "hidden" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 16, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.title}
                        </Typography>
                        {c.description && (
                          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        {c.categories?.[0]?.name ?? c.category ?? "—"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                        <Chip label={c.gender} size="small" sx={{ ...genderColor(c.gender), fontWeight: 600, fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        <Box display="flex" gap={0.5} flexWrap="wrap" maxWidth={200}>
                          {(
                            c.filters?.map((f) => f.name) ?? c.tags ?? []
                          ).slice(0, 3).map((t) => (
                            <Chip key={t} label={t} size="small" sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: 11 }} />
                          ))}
                          {(c.filters?.length ?? c.tags?.length ?? 0) > 3 && (
                            <Chip label={`+${(c.filters?.length ?? c.tags?.length ?? 0) - 3}`} size="small" sx={{ bgcolor: "#f1f5f9", fontSize: 11 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        <Tooltip title="Modifica">
                          <IconButton size="small" onClick={() => openEdit(c)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Elimina">
                          <IconButton size="small" onClick={() => openDelete(c.id)} sx={{ color: "#ef4444", ml: 0.5 }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>}

          {/* ── Pagination footer — same style as DataTable ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-1 gap-3">
            {/* Left: rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-400 whitespace-nowrap">Mostra</span>
              <FormControl size="small" sx={{ width: 68 }}>
                <Select
                  value={perPage}
                  onChange={(e: SelectChangeEvent<number>) => { setPerPage(Number(e.target.value)); setPage(1); }}
                  sx={{
                    height: 32, borderRadius: "8px", fontSize: 13,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7ec" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c4c8d0" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#13131f" },
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <span className="text-[13px] text-slate-400 whitespace-nowrap hidden sm:inline">righe per pagina</span>
            </div>

            {/* Right: page navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{ height: 32, padding: "0 12px", borderRadius: 6, border: "1px solid", borderColor: safePage === 1 ? "#f1f3f5" : "#e5e7ec", backgroundColor: "transparent", color: safePage === 1 ? "#cbd5e1" : "#374151", fontSize: 13, cursor: safePage === 1 ? "not-allowed" : "pointer", whiteSpace: "nowrap", transition: "all 0.15s", display: isMobile ? "none" : "flex", alignItems: "center" }}
              >Precedente</button>

              {isMobile && (
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  style={{ height: 32, width: 32, borderRadius: 6, border: "1px solid", borderColor: safePage === 1 ? "#f1f3f5" : "#e5e7ec", backgroundColor: "transparent", color: safePage === 1 ? "#cbd5e1" : "#374151", fontSize: 16, cursor: safePage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >&#8249;</button>
              )}

              {(() => {
                const pills: (number | "ellipsis-l" | "ellipsis-r")[] = [];
                if (isMobile) {
                  pills.push(safePage);
                } else if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pills.push(i);
                } else {
                  pills.push(1);
                  if (safePage > 3) pills.push("ellipsis-l");
                  const start = Math.max(2, safePage - 1);
                  const end = Math.min(totalPages - 1, safePage + 1);
                  for (let i = start; i <= end; i++) pills.push(i);
                  if (safePage < totalPages - 2) pills.push("ellipsis-r");
                  pills.push(totalPages);
                }
                return pills.map((p, idx) =>
                  typeof p === "string" ? (
                    <span key={p + idx} style={{ fontSize: 13, color: "#94a3b8", width: 24, textAlign: "center" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ height: 32, minWidth: 32, paddingLeft: 4, paddingRight: 4, borderRadius: 6, border: p === safePage ? "none" : "1px solid transparent", backgroundColor: p === safePage ? "#12715b" : "transparent", color: p === safePage ? "#fff" : "#374151", fontSize: 13, fontWeight: p === safePage ? 600 : 400, cursor: p === safePage ? "default" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >{p}</button>
                  )
                );
              })()}

              {isMobile && (
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  style={{ height: 32, width: 32, borderRadius: 6, border: "1px solid", borderColor: safePage === totalPages ? "#f1f3f5" : "#e5e7ec", backgroundColor: "transparent", color: safePage === totalPages ? "#cbd5e1" : "#374151", fontSize: 16, cursor: safePage === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >&#8250;</button>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{ height: 32, padding: "0 12px", borderRadius: 6, border: "1px solid", borderColor: safePage === totalPages ? "#f1f3f5" : "#e5e7ec", backgroundColor: "transparent", color: safePage === totalPages ? "#cbd5e1" : "#374151", fontSize: 13, cursor: safePage === totalPages ? "not-allowed" : "pointer", whiteSpace: "nowrap", transition: "all 0.15s", display: isMobile ? "none" : "flex", alignItems: "center" }}
              >Successivo</button>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography fontWeight={700}>
            {mode === "create" ? "Nuovo contenuto" : "Modifica contenuto"}
          </Typography>
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
              {formError}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {mode === "create" && (
              <TextField
                label="User ID"
                size="small"
                type="number"
                value={form.user_id}
                onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                helperText="ID utente associato al contenuto"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            )}

            <TextField
              label="Titolo *"
              size="small"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              inputProps={{ maxLength: 255 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <TextField
              label="Descrizione"
              size="small"
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <TextField
              label="Genere *"
              size="small"
              select
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value as "male" | "female" | "all" }))
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            >
              {GENDER_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={categoryOptions}
              value={form.category || null}
              onChange={(_, val) => setForm((f) => ({ ...f, category: val ?? "" }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoria *"
                  size="small"
                  helperText={categoryOptions.length ? "Scegli una categoria" : "Caricamento categorie…"}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              )}
            />

            <Autocomplete
              multiple
              options={filterOptions}
              value={selectedTags}
              onChange={(_, val) => setSelectedTags(val as string[])}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <Chip key={key} label={option} size="small" {...tagProps} sx={{ bgcolor: "#f1f5f9", color: "#475569" }} />;
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tag"
                  size="small"
                  helperText={filterOptions.length ? "Scegli uno o più tag" : "Caricamento tag…"}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              )}
            />

            {/* File upload — drag & drop zone */}
            <DropZone
              file={file}
              mode={mode}
              fileInputRef={fileInputRef}
              onFileChange={setFile}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px" }}>
            Annulla
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSave}
            disabled={saving}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", borderRadius: "8px" }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : mode === "create" ? "Crea" : "Salva"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle>
          <Typography fontWeight={700}>Elimina contenuto</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Sei sicuro di voler eliminare questo contenuto? Il record verrà rimosso dal database. L&#39;operazione non è reversibile.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
            Annulla
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Elimina"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
