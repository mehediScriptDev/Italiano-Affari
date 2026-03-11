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
  Avatar,
  Pagination,
  Autocomplete,
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

// ── Drag & Drop Upload Zone ────────────────────────────────────────────────
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
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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

  // Extract available category + tag names from all loaded content items
  const extractOptions = useCallback((items: AdminContent[]) => {
    const catSet = new Set<string>();
    const tagSet = new Set<string>();
    items.forEach((item) => {
      item.categories?.forEach((c) => catSet.add(c.name));
      item.filters?.forEach((f) => tagSet.add(f.name));
    });
    setCategoryOptions((prev) => {
      const merged = new Set([...prev, ...catSet]);
      return [...merged].sort();
    });
    setFilterOptions((prev) => {
      const merged = new Set([...prev, ...tagSet]);
      return [...merged].sort();
    });
  }, []);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetchAdminContents(p, 20);
      setContents(res.data);
      setLastPage(res.last_page);
      extractOptions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Build full option lists by scanning all pages once on mount
  useEffect(() => {
    (async () => {
      try {
        const all: AdminContent[] = [];
        let pg = 1;
        while (pg <= 10) { // safety cap
          const res = await fetchAdminContents(pg, 100);
          all.push(...res.data);
          if (pg >= res.last_page) break;
          pg++;
        }
        extractOptions(all);
      } catch { /* ignore */ }
    })();
  }, [extractOptions]);

  useEffect(() => { load(page); }, [page]);

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
        setContents((prev) => [created, ...prev]);
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
        setContents((prev) => prev.map((c) => (c.id === selectedId ? updated : c)));
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
      setContents((prev) => prev.filter((c) => c.id !== selectedId));
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
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "12px", borderRadius: "8px" }}
          >
            Nuovo contenuto
          </Button>
        </div>

        {/* Table */}
        <div className="dash-card p-5 mb-6">
          <TableContainer component={Paper} sx={{ borderRadius: "8px", boxShadow: "none", border: "1px solid #e5e7ec" }}>
            <Table sx={{ tableLayout: "fixed", minWidth: 700 }}>
              <colgroup>
                <col style={{ width: "72px" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <TableHead sx={{ backgroundColor: "#f8f9fb" }}>
                <TableRow>
                  {["Anteprima", "Titolo", "Categoria", "Genere", "Tag", "Azioni"].map((label) => (
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
                ) : contents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: "1px solid #eef0f4" }}>
                      <PhotoLibrary sx={{ fontSize: 48, color: "#e0e0e0", mb: 1, display: "block", mx: "auto" }} />
                      <Typography sx={{ color: "#94a3b8", fontSize: 14 }}>
                        Nessun contenuto trovato. Creane uno!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map((c) => (
                    <TableRow key={c.id} sx={{ transition: "background-color 0.15s ease", "&:hover": { backgroundColor: "#f8f9fb" }, "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                        <Avatar
                          src={c.file_path}
                          variant="rounded"
                          sx={{ width: 44, height: 44, borderRadius: "8px", bgcolor: "#f6f8fb" }}
                        >
                          <PhotoLibrary sx={{ color: "#ccc", fontSize: 20 }} />
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333", overflow: "hidden" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          </TableContainer>
          {lastPage > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={lastPage}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="secondary"
                size="small"
              />
            </Box>
          )}
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
              freeSolo
              options={categoryOptions}
              value={form.category}
              onInputChange={(_, val) => setForm((f) => ({ ...f, category: val }))}
              onChange={(_, val) => setForm((f) => ({ ...f, category: val ?? "" }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoria *"
                  size="small"
                  helperText={categoryOptions.length ? "Scegli o digita il nome esatto" : "Digita il nome esatto della categoria"}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              )}
            />

            <Autocomplete
              multiple
              freeSolo
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
                  helperText={filterOptions.length ? "Scegli o digita e premi Invio" : "Digita e premi Invio per aggiungere"}
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
