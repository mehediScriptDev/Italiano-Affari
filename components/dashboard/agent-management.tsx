"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import {
  Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Grid,
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
      <Box className="d-flex justify-center px-2" sx={{ backgroundColor: "#f6f8fb" }}>
        <Box sx={{ maxWidth: "1200px" }} className="mt-5 w-100 d-flex flex-column justify-center paddingContainer p-0">
          <Box className="d-flex justify-between align-center mb-2">
            <h5 className="mb-0">Gestione Agenti</h5>
            <Button color="secondary" variant="contained" onClick={() => !loading && setOpenModal(true)}>Invita Partner</Button>
          </Box>
          <DynamicDataTable columns={columns} data={agents} showCheckbox />
        </Box>
      </Box>

      <Dialog open={openModal} fullWidth maxWidth="sm" onClose={() => setOpenModal(false)}>
        <DialogTitle textAlign="center">Invita Partner</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField required fullWidth margin="dense" label="Email" name="email" value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData((p) => ({ ...p, email: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Agente Supervisore</InputLabel>
                  <Select name="parent" value={formData.parent} onChange={(e) => setFormData((p) => ({ ...p, parent: e.target.value }))} label="Agente Supervisore">
                    <MenuItem key={profile?.id} value={profile?.id}>Me</MenuItem>
                    {loading ? <MenuItem disabled><CircularProgress size={24} /></MenuItem> : subAgents.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions style={{ paddingBottom: "16px" }}>
            <Button style={{ backgroundColor: "#f6f8fb" }} onClick={() => setOpenModal(false)}>Annulla</Button>
            <Button type="submit" color="secondary" variant="contained">Invita</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
