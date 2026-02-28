"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", p: 4 }}>
      <Typography variant="h1" fontWeight={700} sx={{ fontSize: { xs: "6rem", md: "10rem" }, color: "black" }}>404</Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>Pagina non trovata</Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "gray" }}>La pagina che stai cercando non esiste o è stata spostata.</Typography>
      <Link href="/dashboard"><Button variant="contained" color="secondary">Torna alla Dashboard</Button></Link>
    </Box>
  );
}
