"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  CardMedia,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { adminLogin } from "@/lib/api/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(email, password);
      router.replace("/admin/dashboard");
    } catch {
      setError("Credenziali non valide. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", bgcolor: "#f6f8fb", display: "flex" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", height: "100%", width: "100%" }}>
        {/* Left side — Hero image (same pattern as partner login) */}
        <Box sx={{ flexBasis: { xs: "0%", lg: "50%" }, maxWidth: { xs: "0%", lg: "50%" }, position: "relative", display: { xs: "none", lg: "block" }, height: "100%" }}>
          <CardMedia
            component="img"
            sx={{ height: "100%", width: "100%", objectFit: "cover" }}
            image="/assets/images/common/Homepage_Partner_.jpg"
            alt="Admin login hero"
          />
          {/* Dark overlay with admin label */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(19, 19, 31, 0.60)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 6,
            }}
          >
            <img
              src="/assets/images/logo_psicopatici.png"
              alt="Psicopatici Italia"
              style={{ width: "55%", maxWidth: 280, marginBottom: 20, filter: "invert(1)" }}
            />
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                maxWidth: 320,
                lineHeight: 1.6,
              }}
            >
              Pannello amministrativo
            </Typography>
          </Box>
        </Box>

        {/* Right side — Login form */}
        <Box sx={{ flexBasis: { xs: "100%", lg: "50%" }, maxWidth: { xs: "100%", lg: "50%" }, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {/* Logo top */}
          <Box sx={{ position: "absolute", top: isMobile ? 40 : 60, left: "50%", transform: "translateX(-50%)", textAlign: "center", width: { xs: "60%", lg: "50%" } }}>
            <img style={{ width: "100%" }} src="/assets/images/logo_psicopatici.png" alt="Logo" />
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 350, mx: "auto", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", px: 3 }}>
            <Typography component="h1" variant="h4" sx={{ mb: 1, mt: 4, fontWeight: "bold" }}>
              Accesso Admin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
              Inserisci le credenziali di amministratore
            </Typography>

            {error && (
              <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
                {error}
              </Typography>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              disabled={loading}
              sx={{ mt: 2, mb: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Accedi"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
