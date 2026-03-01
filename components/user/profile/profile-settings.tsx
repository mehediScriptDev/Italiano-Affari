"use client";

import { Button, TextField } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { Save } from "@mui/icons-material";
import { useState } from "react";
import { useAppContext } from "@/lib/context/app-context";
import { updateProfile } from "@/lib/api/partners";
import { showToast } from "@/lib/utils/notifications";
import type { UserProfile } from "@/lib/types";

export default function ProfileSettings() {
  const [error, setError] = useState<Record<string, string>>({});
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
    <div className="dash-card p-7">
      {/* Avatar + save header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar src={profile?.avatar} className="!w-[72px] !h-[72px] !border-2 !border-[#e5e7ec]">
            {profile?.name?.charAt(0)}
          </Avatar>
          <div>
            <p className="text-base font-semibold tracking-tight text-[#13131f] m-0">{profile?.name}</p>
            <p className="text-[13px] text-slate-500 mt-0.5 mb-0">{profile?.email}</p>
            <p className="text-xs text-slate-500 mt-1 mb-0">
              Attività: <span className="font-semibold text-[#333]">{profile?.activity}</span>
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Save />}
          color="secondary"
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}
          className="hidden sm:flex"
        >
          Salva
        </Button>
      </div>

      <hr className="border-0 border-t border-[#eef0f4] my-5" />

      <h3 className="text-lg font-bold tracking-tight text-center mb-5">Informazioni Personali</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {([
          { key: "name", label: "Nome*", placeholder: "Inserisci nome",
            validate: (v: string) => !v.trim() ? "Il nome è obbligatorio" : v.length < 2 ? "Il nome deve contenere almeno 2 caratteri" : "" },
          { key: "email", label: "Email*", placeholder: "Inserisci la tua email",
            validate: (v: string) => !v.trim() ? "L'email è obbligatoria" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Inserisci un'email valida" : "" },
          { key: "mobile", label: "Cellulare*", placeholder: "Inserisci il tuo numero di cellulare",
            validate: (v: string) => !v.trim() ? "Il numero di cellulare è obbligatorio" : !/^[0-9]{10}$/.test(v) ? "Inserisci un numero di 10 cifre valido" : "" },
          { key: "phone", label: "Telefono Fisso", placeholder: "Inserisci il tuo numero fisso",
            validate: (v: string) => v && !/^[0-9\s]{5,15}$/.test(v) ? "Inserisci un numero di telefono valido" : "" },
        ] as { key: keyof UserProfile; label: string; placeholder: string; validate: (v: string) => string }[]).map(({ key, label, placeholder, validate }) => (
          <div key={key}>
            <p className="text-[13px] font-semibold text-[#333] mb-1.5">{label}</p>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={placeholder}
              value={(tempProfile[key] as string) ?? ""}
              error={!!error[key]}
              helperText={error[key]}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              onChange={(e) => {
                const v = e.target.value;
                setTempProfile((p) => ({ ...p, [key]: v }));
                setError((p) => ({ ...p, [key]: validate(v) }));
              }}
            />
          </div>
        ))}
      </div>

      {profile?.activity && Object.keys(activitiesFields).includes(profile.activity) && (
        <>
          <hr className="border-0 border-t border-[#eef0f4] my-5" />
          <h3 className="text-lg font-bold tracking-tight text-center mb-5">Attività</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {activitiesFields[profile.activity].filter((f) => f !== "paragraph").map((field, i) => (
              <div key={i}>
                <p className="text-[13px] font-semibold text-[#333] mb-1.5">{field}*</p>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={`Inserisci ${field}`}
                  value={tempProfile.business_info?.[field] ?? ""}
                  error={!!error[field]}
                  helperText={error[field]}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTempProfile((p) => ({ ...p, business_info: { ...p.business_info, [field]: v } }));
                    setError((p) => ({ ...p, [field]: !v.trim() ? "Il campo è obbligatorio" : "" }));
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mobile save button */}
      <div className="flex justify-center sm:hidden mt-2">
        <Button onClick={handleSubmit} variant="contained" startIcon={<Save />} color="secondary" sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Salva</Button>
      </div>
    </div>
  );
}
