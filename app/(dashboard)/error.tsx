"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        p: 4,
      }}
    >
      <Typography variant="h4" fontWeight={700} sx={{ color: "#13131f", mb: 1.5, letterSpacing: "-0.02em" }}>
        Qualcosa è andato storto
      </Typography>
      <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 440, mb: 4, lineHeight: 1.6 }}>
        Si è verificato un errore imprevisto nel caricamento di questa sezione.
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="secondary" onClick={reset} sx={{ px: 3, fontWeight: 600 }}>
          Riprova
        </Button>
        <Button variant="outlined" color="secondary" href="/dashboard" sx={{ px: 3, fontWeight: 500 }}>
          Vai alla Dashboard
        </Button>
      </Box>
    </Box>
  );
}
