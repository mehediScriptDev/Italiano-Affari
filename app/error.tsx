"use client";

import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function Error({
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
        minHeight: "100vh",
        backgroundColor: "#f6f8fb",
        textAlign: "center",
        p: 4,
      }}
    >
      <img
        src="/assets/images/logo_psicopatici.png"
        alt="Logo"
        style={{ width: "160px", marginBottom: "32px", opacity: 0.9 }}
      />
      <Typography variant="h1" fontWeight={800} sx={{ fontSize: { xs: "5rem", md: "8rem" }, color: "#13131f", opacity: 0.15, mb: 2, letterSpacing: "-0.05em" }}>
        500
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5, color: "#13131f", letterSpacing: "-0.02em" }}>
        Qualcosa è andato storto
      </Typography>
      <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 480, mb: 4, lineHeight: 1.6 }}>
        Si è verificato un errore imprevisto. Riprova oppure torna alla dashboard.
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="secondary" onClick={reset} sx={{ px: 3.5, py: 1.2, fontWeight: 600 }}>
          Riprova
        </Button>
        <Button variant="outlined" color="secondary" href="/dashboard" sx={{ px: 3.5, py: 1.2, fontWeight: 500 }}>
          Torna alla Dashboard
        </Button>
      </Box>
    </Box>
  );
}
