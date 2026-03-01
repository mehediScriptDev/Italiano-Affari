"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
} from "@mui/material";
import DynamicDataTable from "@/components/data/dynamic-data-table";
import { fetchSubAgents, inviteSubAgent } from "@/lib/api/partners";
import { showToast } from "@/lib/utils/notifications";
import { useAppContext } from "@/lib/context/app-context";
import type { DynamicRow } from "@/components/data/dynamic-data-table";


interface AgentNode {
  id: number;
  name: string;
  email: string;
  orders: number;
  date: string;
  subagents?: AgentNode[];
}

export default function AgentManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ email: "", parent: "" as string | number });
  const [agents, setAgents] = useState<DynamicRow[]>([]);
  const [subAgents, setSubAgents] = useState<{ id: number; name: string }[]>([]);
  const { profile } = useAppContext();

  const formatAgentTree = (agent: Record<string, unknown>): DynamicRow => ({
    id: agent.id as number,
    name: agent.name as string,
    email: agent.email as string,
    orders: agent.orders as number,
    date: agent.date as string,
    subagents: (agent.subagents as Record<string, unknown>[])?.map(formatAgentTree) ?? [],
  });

  const flattenSubAgents = (list: DynamicRow[]): { id: number; name: string }[] => {
    let result: { id: number; name: string }[] = [];
    for (const agent of list) {
      result.push({ id: agent.id as number, name: agent.name as string });
      if (agent.subagents?.length) result = result.concat(flattenSubAgents(agent.subagents));
    }
    return result;
  };

  useEffect(() => {
    fetchSubAgents()
      .then((response) => {
        const tree = formatAgentTree(response.data);
        setAgents([tree]);
        setSubAgents(flattenSubAgents(tree.subagents ?? []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    { label: "Nome/Email", field: "name" },
    { label: "Ordini", field: "orders" },
    { label: "Data di creazione", field: "date" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = { email: formData.email, parent_id: formData.parent === -1 ? null : Number(formData.parent) };
      const response = await inviteSubAgent(payload);
      if (response.status === 200) showToast("Invito inviato con successo!", "success");
      setOpenModal(false);
    } catch (error: unknown) {
      const err = error as { response?: { status: number } };
      if (err.response?.status === 404) showToast("L'utente non è registrato.", "error");
      else if (err.response?.status === 409) showToast("L'utente è già in una rete.", "error");
      else showToast("Errore durante l'invito. Riprova.", "warning");
    }
  };

  return (
    <>
      <div className="w-100 paddingContainer mt-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Gestione Agenti</h1>
            <p className="page-subtitle">La tua rete di partner</p>
          </div>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => !loading && setOpenModal(true)}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "13px", px: 2.5 }}
          >
            Invita Partner
          </Button>
        </div>
        <DynamicDataTable columns={columns} data={agents} showCheckbox />
      </div>

      <Dialog open={openModal} fullWidth maxWidth="sm" onClose={() => setOpenModal(false)} PaperProps={{ className: "!rounded-2xl" }}>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 700, fontSize: "18px", pt: 3 }}>Invita Partner</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField required fullWidth margin="dense" label="Email" name="email" value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              <FormControl fullWidth margin="dense">
                <InputLabel>Agente Supervisore</InputLabel>
                <Select name="parent" value={formData.parent} onChange={(e) => setFormData((p) => ({ ...p, parent: e.target.value }))} label="Agente Supervisore">
                  <MenuItem key={profile?.id} value={profile?.id}>Me</MenuItem>
                  {loading ? <MenuItem disabled><CircularProgress size={24} /></MenuItem> : subAgents.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </DialogContent>
          <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
            <Button sx={{ backgroundColor: "#f6f8fb", borderRadius: "8px", textTransform: "none", fontWeight: 500, px: 2.5 }} onClick={() => setOpenModal(false)}>Annulla</Button>
            <Button type="submit" color="secondary" variant="contained" sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Invita</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
