"use client";

import {
  Box, Button, Card, CardContent, Grid, TextField, Typography, useMediaQuery,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { Save } from "@mui/icons-material";
import { useState } from "react";
import { useAppContext } from "@/lib/context/app-context";
import { updateProfile } from "@/lib/api/partners";
import { showToast } from "@/lib/utils/notifications";
import type { UserProfile } from "@/lib/types";

export default function ProfileSettings() {
  const [error, setError] = useState<Record<string, string>>({});
  const isMobile = useMediaQuery((theme: { breakpoints: { down: (b: string) => string } }) => theme.breakpoints.down("sm"));
  const { profile, setProfile } = useAppContext();
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile ?? {} as UserProfile);

  const handleSubmit = () => {
    const hasNoErrors = Object.values(error).every((e) => e === "");
    if (hasNoErrors) {
      updateProfile(tempProfile)
        .then(() => { setProfile(tempProfile); setError({}); showToast("Profilo aggiornato con successo!", "success"); })
        .catch(() => showToast("Errore durante l'aggiornamento del profilo", "error"));
    }
  };

  const activitiesFields: Record<string, string[]> = {
    Negozio: ["Ragione Sociale", "Nominativo Boutique", "Ubicazione Boutique", "Referente"],
    "Partner Finanziario Operativo": ["Ragione Sociale", "Partita IVA"],
    "Virtual Influencer": ["Istituto Scolastico", "paragraph"],
    "Ads Creator": ["paragraph"],
    "Content Creator": ["paragraph"],
  };

  return (
    <Card className="card-shadow" sx={{ borderRadius: 2 }}>
      <CardContent>
        <div className="d-flex justify-between align-center">
          <Box sx={{ display: "flex", gap: "10px" }}>
            <Avatar src={profile?.avatar} sx={{ width: "80px", height: "80px" }}>{profile?.name?.charAt(0)}</Avatar>
            <div>
              <Typography align="left" variant="h6" sx={{ color: "black", fontSize: 16 }}>{profile?.name}</Typography>
              <Typography align="left" variant="h6" sx={{ color: "gray", mb: 1, fontSize: 12 }}>{profile?.email}</Typography>
              <Typography align="left" variant="h6" sx={{ color: "gray", mt: 1.5, fontSize: 12 }}>Attività: {profile?.activity}</Typography>
            </div>
          </Box>
          <Button hidden={isMobile} onClick={handleSubmit} variant="contained" startIcon={<Save />} color="secondary">Salva</Button>
        </div>

        <hr style={{ width: "100%" }} />
        <Typography variant="h5" align="center" sx={{ mb: 2 }} fontWeight={700}>Informazioni Personali</Typography>

        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Typography variant="h6" sx={{ color: "black", mb: 1, fontSize: 16 }}>Nome*</Typography>
            <TextField fullWidth variant="outlined" placeholder="Inserisci nome" value={tempProfile.name} error={!!error.name} helperText={error.name}
              onChange={(e) => {
                const v = e.target.value;
                setTempProfile((p) => ({ ...p, name: v }));
                if (!v.trim()) setError((p) => ({ ...p, name: "Il nome è obbligatorio" }));
                else if (v.length < 2) setError((p) => ({ ...p, name: "Il nome deve contenere almeno 2 caratteri" }));
                else setError((p) => ({ ...p, name: "" }));
              }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Typography variant="h6" sx={{ color: "black", mb: 1, fontSize: 16 }}>Email*</Typography>
            <TextField fullWidth variant="outlined" placeholder="Inserisci la tua email" value={tempProfile.email} error={!!error.email} helperText={error.email}
              onChange={(e) => {
                const v = e.target.value;
                setTempProfile((p) => ({ ...p, email: v }));
                if (!v.trim()) setError((p) => ({ ...p, email: "L'email è obbligatoria" }));
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) setError((p) => ({ ...p, email: "Inserisci un'email valida" }));
                else setError((p) => ({ ...p, email: "" }));
              }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Typography variant="h6" sx={{ color: "black", mb: 1, fontSize: 16 }}>Cellulare*</Typography>
            <TextField fullWidth variant="outlined" placeholder="Inserisci il tuo numero di cellulare" value={tempProfile.mobile} error={!!error.mobile} helperText={error.mobile}
              onChange={(e) => {
                const v = e.target.value;
                setTempProfile((p) => ({ ...p, mobile: v }));
                if (!v.trim()) setError((p) => ({ ...p, mobile: "Il numero di cellulare è obbligatorio" }));
                else if (!/^[0-9]{10}$/.test(v)) setError((p) => ({ ...p, mobile: "Inserisci un numero di 10 cifre valido" }));
                else setError((p) => ({ ...p, mobile: "" }));
              }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Typography variant="h6" sx={{ color: "black", mb: 1, fontSize: 16 }}>Telefono Fisso</Typography>
            <TextField fullWidth variant="outlined" placeholder="Inserisci il tuo numero fisso" value={tempProfile.phone ?? ""} error={!!error.phone} helperText={error.phone}
              onChange={(e) => {
                const v = e.target.value;
                setTempProfile((p) => ({ ...p, phone: v }));
                if (!/^[0-9\s]{5,15}$/.test(v)) setError((p) => ({ ...p, phone: "Inserisci un numero di telefono valido" }));
                else setError((p) => ({ ...p, phone: "" }));
              }} />
          </Grid>
        </Grid>

        <hr style={{ width: "100%" }} />

        {profile?.activity && Object.keys(activitiesFields).includes(profile.activity) && (
          <>
            <Typography variant="h5" align="center" sx={{ mb: 2 }} fontWeight={700}>Attività</Typography>
            <Grid container spacing={2} mb={5}>
              {activitiesFields[profile.activity].filter((f) => f !== "paragraph").map((field, i) => (
                <Grid size={{ xs: 12, md: 6, lg: 6 }} key={i}>
                  <Typography variant="h6" sx={{ color: "black", mb: 1, fontSize: 16 }}>{field}*</Typography>
                  <TextField fullWidth variant="outlined" placeholder={`Inserisci ${field}`}
                    value={tempProfile.business_info?.[field] ?? ""}
                    error={!!error[field]} helperText={error[field]}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTempProfile((p) => ({ ...p, business_info: { ...p.business_info, [field]: v } }));
                      if (!v.trim()) setError((p) => ({ ...p, [field]: "Il campo è obbligatorio" }));
                      else setError((p) => ({ ...p, [field]: "" }));
                    }} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <div className="d-flex justify-center align-center mb-3">
          <Button hidden={!isMobile} onClick={handleSubmit} variant="contained" startIcon={<Save />} color="secondary">Salva</Button>
        </div>
      </CardContent>
    </Card>
  );
}
