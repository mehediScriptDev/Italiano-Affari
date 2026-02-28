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
        style={{ width: "160px", marginBottom: "24px", opacity: 0.85 }}
      />
      <Typography variant="h1" fontWeight={700} sx={{ fontSize: { xs: "5rem", md: "8rem" }, color: "#12715b", opacity: 0.8, mb: 2 }}>
        500
      </Typography>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Qualcosa è andato storto
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 480, mb: 4 }}>
        Si è verificato un errore imprevisto. Riprova oppure torna alla dashboard.
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" color="secondary" onClick={reset}>
          Riprova
        </Button>
        <Button variant="outlined" color="secondary" href="/dashboard">
          Torna alla Dashboard
        </Button>
      </Box>
    </Box>
  );
}
