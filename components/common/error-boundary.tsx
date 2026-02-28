"use client";

import { Typography, Box, Button } from "@mui/material";
import { useAuth } from "@/lib/context/auth-context";

interface ErrorBoundaryProps {
  error?: { statusText?: string; message?: string; status?: number };
}

export default function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const { setToken } = useAuth();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      gap={2}
      padding={3}
    >
      <Typography variant="h4" fontWeight="bold">
        Ops! Qualcosa è andato storto
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {error?.statusText || error?.message || "Si è verificato un errore imprevisto"}
      </Typography>
      {error?.status && (
        <Typography variant="caption" color="text.secondary">
          Errore {error.status}
        </Typography>
      )}
      <Button variant="contained" color="secondary" onClick={() => setToken()}>
        Esci
      </Button>
    </Box>
  );
}
