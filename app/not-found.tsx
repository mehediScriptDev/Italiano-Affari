"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", p: 4, backgroundColor: "#f6f8fb" }}>
      <Typography variant="h1" fontWeight={800} sx={{ fontSize: { xs: "6rem", md: "10rem" }, color: "#13131f", opacity: 0.12, letterSpacing: "-0.05em" }}>404</Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5, color: "#13131f", letterSpacing: "-0.02em" }}>Pagina non trovata</Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#64748b", maxWidth: 400, lineHeight: 1.6 }}>La pagina che stai cercando non esiste o è stata spostata.</Typography>
      <Link href="/dashboard"><Button variant="contained" color="secondary" sx={{ px: 3.5, py: 1.2, fontWeight: 600 }}>Torna alla Dashboard</Button></Link>
    </Box>
  );
}
