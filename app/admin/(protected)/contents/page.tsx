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

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetchAdminContents(p, 20);
      setContents(res.data);
      setLastPage(res.last_page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const openCreate = () => {
    setMode("create");
    setForm(EMPTY_FORM);
    setFile(null);
    setFormError("");
    setSelectedId(null);
    setDialogOpen(true);
  };

  const openEdit = (c: AdminContent) => {
    setMode("edit");
    setSelectedId(c.id);
    // API returns nested categories/filters; fall back to flat fields if present
    const catName =
      (c as unknown as { categories?: { name: string }[] }).categories?.[0]?.name ??
      c.category ?? "";
    const tagNames = (
      (c as unknown as { filters?: { name: string }[] }).filters?.map((f) => f.name) ??
      c.tags ??
      []
    ).join(", ");
    setForm({
      user_id: String(c.user_id),
      title: c.title,
      description: c.description ?? "",
      gender: c.gender,
      category: catName,
      tags: tagNames,
    });
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
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

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
        await createContent(payload);
      } else if (selectedId !== null) {
        const payload: UpdateContentPayload = {
          title: form.title,
          description: form.description || undefined,
          gender: form.gender,
          category: form.category,
          tags,
          file: file ?? undefined,
        };
        await updateContent(selectedId, payload);
      }

      setDialogOpen(false);
      await load(page);
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
      setDeleteDialogOpen(false);
      await load(page);
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
            <Table>
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
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        <Avatar
                          src={c.file_url}
                          variant="rounded"
                          sx={{ width: 52, height: 52, borderRadius: "8px", bgcolor: "#f6f8fb" }}
                        >
                          <PhotoLibrary sx={{ color: "#ccc" }} />
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#333" }} noWrap>
                          {c.title}
                        </Typography>
                        {c.description && (
                          <Typography sx={{ fontSize: 12, color: "#94a3b8", mt: 0.25 }} noWrap>
                            {c.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        {(c as unknown as { categories?: { name: string }[] }).categories?.[0]?.name ?? c.category ?? "—"}
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5 }}>
                        <Chip label={c.gender} size="small" sx={{ ...genderColor(c.gender), fontWeight: 600, fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ borderBottom: "1px solid #eef0f4", py: 1.5, fontSize: 14, color: "#333" }}>
                        <Box display="flex" gap={0.5} flexWrap="wrap" maxWidth={200}>
                          {(
                            (c as unknown as { filters?: { name: string }[] }).filters?.map((f) => f.name) ??
                            c.tags ?? []
                          ).slice(0, 3).map((t) => (
                            <Chip key={t} label={t} size="small" sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: 11 }} />
                          ))}
                          {(
                            (c as unknown as { filters?: { name: string }[] }).filters?.length ??
                            c.tags?.length ?? 0
                          ) > 3 && (
                            <Chip label={`+${((c as unknown as { filters?: { name: string }[] }).filters?.length ?? c.tags?.length ?? 0) - 3}`} size="small" sx={{ bgcolor: "#f1f5f9", fontSize: 11 }} />
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

            <TextField
              label="Categoria *"
              size="small"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              helperText="Nome esatto della categoria"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />

            <TextField
              label="Tag"
              size="small"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              helperText="Separati da virgola — es: Tag1, Tag2"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
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
