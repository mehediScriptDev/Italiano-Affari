"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Papa from "papaparse";
import DynamicDataTable from "@/components/data/dynamic-data-table";
import { fetchContacts, createContact, updateContact, deleteContact, importContactsCsv } from "@/lib/api/partners";
import { showToast } from "@/lib/utils/notifications";
import type { DynamicRow, DynamicColumn } from "@/components/data/dynamic-data-table";

interface ContactFormData { name: string; email: string; }

export default function ContactManager() {
  const [openModal, setOpenModal] = useState(false);
  const [editingContact, setEditingContact] = useState<DynamicRow | null>(null);
  const [contacts, setContacts] = useState<DynamicRow[]>([]);
  const [formData, setFormData] = useState<ContactFormData>({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const columns: DynamicColumn[] = [
    { label: "Nome", field: "name" },
    { label: "Email", field: "email" },
    {
      label: "Azioni", field: "action",
      renderCell: (row: DynamicRow) => (
        <div className="flex gap-1">
          <IconButton className="p-1!" style={{ backgroundColor: "#f6f8fb" }} size="small" onClick={() => handleEdit(row)}>
            <EditIcon color="secondary" />
          </IconButton>
          <IconButton className="p-1!" style={{ backgroundColor: "#f6f8fb" }} size="small" onClick={() => handleDelete(row.id as number)}>
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </div>
      ),
    },
  ];

  const refreshContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchContacts();
      setContacts(data);
    } catch (error) {
      console.error("Errore nel recupero dei contatti:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshContacts(); }, []);

  const handleEdit = (contact: DynamicRow) => {
    setEditingContact(contact);
    setFormData({ name: contact.name as string, email: contact.email as string });
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo contatto?")) return;
    setLoading(true);
    try {
      await deleteContact(id);
      showToast("Contatto eliminato con successo!", "success");
      refreshContacts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showToast("Errore durante l'eliminazione: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingContact) await updateContact(editingContact.id as number, formData);
      else await createContact(formData);
      setOpenModal(false);
      refreshContacts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showToast(err.response?.data?.message || err.message || "Errore", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImportCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const parsed = (results.data as Record<string, string>[]).map((row) => {
          const firstName = row["First Name"]?.trim() ?? "";
          const lastName = row["Last Name"]?.trim() ?? "";
          const email = row["E-mail"]?.trim() || row["E-mail Address"]?.trim() || row["E-mail 1 - Value"]?.trim() || row.Email?.trim() || row.email?.trim();
          return { name: `${firstName} ${lastName}`.trim(), email: email ?? "" };
        }).filter((c) => c.email);
        try {
          const result = await importContactsCsv(parsed);
          showToast("Contatti importati con successo!", "success");
          if (result.failed_imports?.length > 0) showToast(`${result.failed_imports.length} contatti non importati.`, "error");
          refreshContacts();
        } catch { showToast("Errore durante l'importazione CSV.", "error"); }
        finally { setLoading(false); }
      },
      error: () => { showToast("Errore durante la lettura del file CSV.", "error"); setLoading(false); },
    });
  };

  return (
    <>
      <div className="w-100 paddingContainer mt-3">
        <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
          <div>
            <h1 className="page-title">Gestione Contatti</h1>
            <p className="page-subtitle">Gestisci la tua rubrica contatti</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              component="label"
              color="secondary"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 500, fontSize: "13px" }}
              disabled={loading}
            >
              Importa CSV
              <input type="file" accept=".csv" hidden onChange={handleImportCsv} disabled={loading} />
            </Button>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => { setOpenModal(true); setEditingContact(null); setFormData({ name: "", email: "" }); }}
              disabled={loading}
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "13px", px: 2.5 }}
            >
              Aggiungi Contatto
            </Button>
          </div>
        </div>
        <DynamicDataTable columns={columns} data={contacts} showCheckbox />
      </div>

      <Dialog open={openModal} fullWidth maxWidth="sm" onClose={() => setOpenModal(false)} PaperProps={{ className: "!rounded-2xl" }}>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 700, fontSize: "18px", pt: 3 }}>{editingContact ? "Modifica Contatto" : "Aggiungi Contatto"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <div className="flex flex-col gap-1">
              <TextField required fullWidth margin="dense" label="Nome" name="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
              <TextField required fullWidth margin="dense" label="Email" name="email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
            </div>
          </DialogContent>
          <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
            <Button sx={{ backgroundColor: "#f6f8fb", borderRadius: "8px", textTransform: "none", fontWeight: 500, px: 2.5 }} onClick={() => setOpenModal(false)} disabled={loading}>Annulla</Button>
            <Button type="submit" color="secondary" variant="contained" disabled={loading} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>
              {editingContact ? "Modifica" : "Aggiungi"}
              {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
