"use client";

import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import { useState, useEffect, Fragment } from "react";

function fetchActivities(): Promise<Record<string, string>> {
  return new Promise((resolve) => {
    const activities: Record<string, string> = {
      boutique: "Negozio",
      content_creator: "Content Creator",
      fashion_design: "Fashion e Design Addicted",
      tech: "Tech e Innovazione",
      campaigns: "Campaign Creators",
      events: "Event Creators",
      community: "Community",
    };
    setTimeout(() => resolve(activities), 3000);
  });
}

interface ActivityDropdownProps {
  onActivityChange: (value: string) => void;
  error?: string;
  helperText?: string;
}

export default function ActivityDropdown({ onActivityChange, error, helperText }: ActivityDropdownProps) {
  const [value, setValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const activities = await fetchActivities();
        setOptions(Object.values(activities));
      } catch (err) {
        console.error("Errore durante il caricamento delle attività:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        value={value}
        onChange={(_: unknown, newValue: string | null) => { setValue(newValue); if (onActivityChange) onActivityChange(newValue ?? ""); }}
        loadingText="Caricamento..."
        noOptionsText="Nessuna attività trovata"
        inputValue={inputValue}
        onInputChange={(_: unknown, v: string) => setInputValue(v)}
        id="activity-dropdown"
        options={options}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        loading={loading}
        renderInput={(params) => (
          <TextField {...params} label="Inserisci la tua attività" variant="outlined" fullWidth error={!!error} helperText={helperText}
            slotProps={{ input: { ...params.InputProps, endAdornment: (<Fragment>{loading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</Fragment>) } }}
          />
        )}
      />
    </Box>
  );
}
