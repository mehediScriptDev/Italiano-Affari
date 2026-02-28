"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box, Grid, Typography, TextField, Button, CircularProgress,
  CardMedia, useTheme, useMediaQuery,
} from "@mui/material";
import { useAuth } from "@/lib/context/auth-context";
import { checkLoginCode, fetchBackupSecret, sendAuthRequest } from "@/lib/api/auth";
import { useAppContext } from "@/lib/context/app-context";

export default function SignIn() {
  const router = useRouter();
  const { token, setToken, updateProfile } = useAuth();
  const { profile } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current = inputRefs.current.slice(0, 6); }, []);

  useEffect(() => {
    if (token && profile) router.push("/dashboard");
  }, [token, profile, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    setError("");
    setResendMessage("");
    if (value && !/^[0-9]$/.test(value)) return;
    const next = [...verificationCode];
    next[index] = value;
    setVerificationCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pasted)) {
      setVerificationCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setResendMessage("");
    try {
      await sendAuthRequest(email);
      setResendMessage("Nuovo codice inviato con successo!");
      setCountdown(30);
    } catch {
      setError("Errore durante il rinvio del codice. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (step === 1) {
      try {
        await sendAuthRequest(email);
        setStep(2);
        setCountdown(30);
      } catch {
        setError("L'email non è registrata");
      } finally {
        setLoading(false);
      }
    } else {
      const code = verificationCode.join("");
      try {
        const response = await checkLoginCode(email, code);
        const newToken = response.data.data.access_token;
        setToken(newToken);
        try {
          const secretRes = await fetchBackupSecret();
          updateProfile(newToken, secretRes.data.backup_key);
        } catch (err) {
          console.error(err);
        }
        setTimeout(() => setLoading(false), 1500);
      } catch {
        setError("Codice non valido");
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden", bgcolor: "#f6f8fb", display: "flex" }}>
      <Grid container sx={{ height: "100%", width: "100%" }}>
        <Grid size={{ xs: 0, lg: 6 }} sx={{ position: "relative", display: { xs: "none", lg: "block" }, height: "100%" }}>
          <CardMedia component="img" sx={{ height: "100%", width: "100%", objectFit: "cover" }} image="/assets/images/common/Homepage_Partner_.jpg" alt="Hero login image" />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <Box sx={{ position: "absolute", top: isMobile ? 40 : 60, textAlign: "center" }}>
            <img width={isMobile ? "60%" : "50%"} src="/assets/images/logo_psicopatici.png" alt="Logo" />
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 350, mx: "auto", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", px: 3 }}>
            {step === 1 && (
              <>
                <Typography component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>Accedi</Typography>
                {error && <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>{error}</Typography>}
                <TextField margin="normal" required fullWidth id="email" label="Email" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />
              </>
            )}

            {step === 2 && (
              <>
                <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>Verifica la tua email</Typography>
                <Typography align="center" variant="body1" sx={{ mb: 3 }}>Abbiamo inviato un codice di verifica a <strong>{email}</strong></Typography>
                <Typography align="center" variant="body2" sx={{ mb: 2 }}>Inserisci il codice a 6 cifre</Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
                  {verificationCode.map((digit, index) => (
                    <TextField
                      key={index}
                      inputRef={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                      value={digit}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCodeChange(e, index)}
                      onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*", maxLength: 1, style: { textAlign: "center", fontSize: "1.5rem", padding: "10px", width: "2rem" } } }}
                      variant="outlined"
                      autoComplete="off"
                      sx={{ width: { xs: "2.5rem", sm: "3rem" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderRadius: 2 } } }}
                    />
                  ))}
                </Box>
                {error && <Typography color="red" variant="body1" align="center" sx={{ mb: 2 }}>{error}</Typography>}
                {resendMessage && <Typography color="green" variant="body2" align="center" sx={{ mb: 2 }}>{resendMessage}</Typography>}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <Button variant="text" size="small" onClick={handleResendCode} disabled={loading || countdown > 0} sx={{ textTransform: "none", fontWeight: "bold" }}>
                    {countdown > 0 ? `Rinvia codice in ${countdown}s` : "Non hai ricevuto il codice? Rinvialo"}
                  </Button>
                </Box>
              </>
            )}

            <Button type="submit" fullWidth variant="contained" color="secondary" disabled={loading} sx={{ mt: 2, mb: 3, py: 1.5 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : step === 1 ? "Avanti" : "Accedi"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Non hai un account?{" "}
            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography sx={{ textDecoration: "underline", fontWeight: "bolder" }} component="span" variant="body2" color="primary">Registrati</Typography>
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
