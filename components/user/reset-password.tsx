"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box, Grid, Typography, TextField, Button, FormControlLabel,
  Checkbox, CircularProgress, CardMedia, useTheme, useMediaQuery,
} from "@mui/material";

export default function ResetPassword() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEmail(v);
    setEmailError(!validateEmail(v) ? "Inserisci un'email valida" : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) { setEmailError("Inserisci un'email valida"); return; }
    setLoading(true);
    try {
      setTimeout(() => { setLoading(false); router.push("/dashboard"); }, 2000);
    } catch { setError("Errore durante il login. Controlla le credenziali."); setLoading(false); }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", bgcolor: "#f6f8fb", display: "flex" }}>
      <Grid container sx={{ height: "100%", width: "100%" }}>
        <Grid size={{ xs: 0, lg: 6 }} sx={{ position: "relative", display: { xs: "none", lg: "block" }, height: "100%" }}>
          <CardMedia component="img" sx={{ height: "100%", width: "100%", objectFit: "cover" }} image="/assets/images/common/login.webp" alt="Hero login image" />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <Box sx={{ position: "absolute", top: isMobile ? 40 : 60, textAlign: "center" }}>
            <img width={isMobile ? "60%" : "50%"} src="/assets/images/logo_psicopatici.png" alt="Logo" />
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 350, mx: "auto", display: "flex", flexDirection: "column", alignItems: "center", px: 3 }}>
            <Typography component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>Reset password</Typography>
            {error && <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>{error}</Typography>}
            <TextField margin="normal" required fullWidth id="email" label="Inserisci Email" name="email" autoComplete="email" autoFocus value={email} onChange={handleEmailChange} error={!!emailError} helperText={emailError} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mb: 2 }}>
              <FormControlLabel control={<Checkbox id="remember-me" color="primary" />} label="Non sono un robot" />
            </Box>
            <Button type="submit" fullWidth variant="contained" color="secondary" disabled={loading} sx={{ mt: 2, mb: 3, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Modifica password"}
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Vuoi accedere?
              <Link href="/sign-in" style={{ textDecoration: "none" }}>
                <Typography sx={{ textDecoration: "underline", fontWeight: "bolder" }} component="span" variant="body2" color="primary">Accedi</Typography>
              </Link>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
