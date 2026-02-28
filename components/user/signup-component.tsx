"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box, Button, TextField, Typography, CircularProgress,
  IconButton, LinearProgress, Checkbox, Stack, TextareaAutosize,
  useMediaQuery, useTheme,
} from "@mui/material";
import { ArrowBack, AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import Link from "next/link";
import { sendRegisterRequest, sendVerifyEmailRequest, sendVerifyOtpRequest } from "@/lib/api/auth";
import ActivityDropdown from "./activity-dropdown";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  activity: string;
  socialLinks?: string[];
  proposta?: string;
  [key: string]: unknown;
}

export default function SignupComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "", activity: "",
  });
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const activitiesFields: Record<string, string[]> = {
    Negozio: ["Ragione Sociale", "Nominativo Boutique", "Ubicazione Boutique", "Referente"],
  };

  const validateCurrentStep = () => {
    let err = "";
    switch (activeStep) {
      case 1:
        if (!formData.email.trim()) err = "L'email è obbligatoria";
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
          err = "Inserisci un indirizzo email valido";
        break;
      case 3:
        if (!formData.firstName.trim()) err = "Il nome è obbligatorio";
        else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) err = "Il nome deve contenere solo lettere";
        else if (!formData.lastName.trim()) err = "Il cognome è obbligatorio";
        else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) err = "Il cognome deve contenere solo lettere";
        else if (!formData.phone.trim()) err = "Il numero di telefono è obbligatorio";
        else if (!/^[0-9+\s()-]{8,15}$/.test(formData.phone)) err = "Inserisci un numero di telefono valido";
        break;
      case 4:
        if (!formData.activity) err = "Seleziona un'attività";
        break;
    }
    setError(err);
    return !err;
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    if (activeStep === 1) {
      setVerifying(true);
      try {
        await sendVerifyEmailRequest(formData.email);
      } catch (ex: unknown) {
        const status = (ex as { status?: number })?.status;
        setError(status === 409 ? "Questa email è già registrata." : "Si è verificato un errore! Contatta l'assistenza");
        setVerifying(false);
        return;
      }
      setTimeout(() => { setVerifying(false); setCountdown(30); setActiveStep(2); }, 1500);
    } else {
      if (activeStep === 4 && formData.activity !== "Influencer" && !activitiesFields[formData.activity]) {
        setActiveStep(6);
        return;
      }
      setActiveStep((p) => p + 1);
    }
  };

  const handlePreviousStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeStep > 1) setActiveStep((p) => p - 1);
  };

  const handleResendCode = async () => {
    setLoading(true); setError(""); setResendMessage("");
    try {
      await sendVerifyEmailRequest(formData.email);
      setResendMessage("Nuovo codice inviato con successo!");
      setCountdown(30);
    } catch {
      setError("Errore durante il rinvio del codice. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    switch (activeStep) {
      case 1: return <EmailStep formData={formData} handleChange={handleChange} handleNextStep={handleNextStep} error={error} verifying={verifying} />;
      case 2: return <VerifyEmailStep email={formData.email} handleNextStep={() => setActiveStep(3)} handleResendCode={handleResendCode} countdown={countdown} resendMessage={resendMessage} setResendMessage={setResendMessage} loading={loading} />;
      case 3: return <PersonalInfoStep formData={formData} handleChange={handleChange} handleNextStep={handleNextStep} error={error} />;
      case 4: return <ActivitySelectionStep handleChange={(v: string) => setFormData({ ...formData, activity: v })} handleNextStep={handleNextStep} error={error} />;
      case 5:
        if (formData.activity === "Influencer") return <SocialStep formData={formData} handleChange={handleChange} handleNextStep={handleNextStep} />;
        return <AdditionalInfo formData={formData} handleNextStep={handleNextStep} handleChange={handleChange} fields={activitiesFields[formData.activity]} hasParagraph={activitiesFields[formData.activity]?.includes("paragraph")} />;
      case 6: return <RegistrationComplete formData={formData} />;
      default: return <EmailStep formData={formData} handleChange={handleChange} handleNextStep={handleNextStep} error={error} verifying={verifying} />;
    }
  };

  const hiddenBackSteps = [1, 3, 6];

  return (
    <Box width="100%" height="100%">
      <LinearProgress sx={{ height: "10px" }} variant="determinate" value={Math.ceil((activeStep * 100) / 6)} />

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img
          width={isMobile ? "70%" : "50%"}
          src="/assets/images/logo_psicopatici.png"
          alt="Logo"
        />
      </Box>

      <Box
        hidden={hiddenBackSteps.includes(activeStep)}
        sx={{ position: "absolute", top: "60px", left: "20px" }}
      >
        <IconButton
          onClick={handlePreviousStep}
          className="customHover"
          size={isMobile ? "small" : "medium"}
          sx={{ color: "white", backgroundColor: "black" }}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      <Box sx={{ mt: 5 }} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", flexWrap: "wrap" }}>
          <Box sx={{ width: { xs: "100%", md: "66.6667%", lg: "50%", xl: "33.3333%" } }}>
            <Box sx={{ mt: isMobile ? 13 : 2 }}>{getCurrentStep()}</Box>
          </Box>
        </Box>
      </Box>

      <Box
        hidden={activeStep === 6}
        sx={{ mt: 2 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="body2" sx={{ mt: 2 }}>
          Sei già registrato?
          <Link href="/sign-in" style={{ textDecoration: "none" }}>
            <Typography
              sx={{ textDecoration: "underline", fontWeight: "bolder" }}
              component="span"
              variant="body2"
              color="primary"
            >
              Accedi
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

function EmailStep({ formData, handleChange, handleNextStep, error, verifying }: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNextStep: (e: React.FormEvent) => void;
  error: string;
  verifying: boolean;
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  return (
    <Box component="form" onSubmit={handleNextStep} noValidate>
      <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>
        Inserisci la tua email
      </Typography>
      <Typography align="center" variant="body1" sx={{ mb: 3 }}>
        Per iniziare la registrazione, inserisci il tuo indirizzo email
      </Typography>

      <TextField fullWidth label="Email" name="email" type="email" required variant="outlined" margin="normal"
        value={formData.email} onChange={handleChange} error={!!error} helperText={error} />

      <div className="d-flex items-center">
        <Checkbox required name="terms" color="primary" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
        <span className="my-0" style={{ fontSize: "13px" }}>
          Accetto i&nbsp;
          <a href="https://legal.psicopatici.com/partner-terms" target="_blank" rel="noopener" style={{ fontWeight: 600 }}>
            Termini e le Condizioni in uso
          </a>
        </span>
      </div>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="secondary" type="submit" fullWidth disabled={verifying || !acceptedTerms} sx={{ mt: 2, py: 1.5 }}>
          {verifying ? <CircularProgress size={24} /> : "Verifica Email"}
        </Button>
      </Box>
    </Box>
  );
}

function VerifyEmailStep({ email, handleNextStep, handleResendCode, countdown, resendMessage, setResendMessage, loading }: {
  email: string; handleNextStep: () => void; handleResendCode: () => void;
  countdown: number; resendMessage: string; setResendMessage: (v: string) => void; loading: boolean;
}) {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => { inputRefs.current = inputRefs.current.slice(0, 6); }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    setError(false);
    if (value && !/^[0-9]$/.test(value)) return;
    setResendMessage("");
    const next = [...verificationCode];
    next[index] = value;
    setVerificationCode(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pasted)) { setVerificationCode(pasted.split("")); inputRefs.current[5]?.focus(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendVerifyOtpRequest(email, verificationCode.join(""));
      handleNextStep();
    } catch { setError(true); }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Verifica la tua email
      </Typography>
      <Typography align="center" variant="body1" sx={{ mb: 3 }}>
        Abbiamo inviato un codice di verifica a <strong>{email}</strong>
      </Typography>
      <Typography align="center" variant="body2" sx={{ mb: 2 }}>
        Inserisci il codice a 6 cifre
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
        {verificationCode.map((digit, index) => (
          <TextField key={index}
            inputRef={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
            value={digit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCodeChange(e, index)}
            onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*", maxLength: 1, style: { textAlign: "center", fontSize: "1.5rem", padding: "10px", width: "2rem" } } }}
            variant="outlined" autoComplete="off"
            sx={{ width: { xs: "2.5rem", sm: "3rem" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderRadius: 2 } } }}
          />
        ))}
      </Box>

      {error && (
        <Typography color="red" variant="body1" align="center">Codice errato!</Typography>
      )}
      {resendMessage && (
        <Typography color="green" variant="body2" align="center" sx={{ mb: 2 }}>{resendMessage}</Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button variant="text" size="small" onClick={handleResendCode} disabled={loading || countdown > 0} sx={{ textTransform: "none", fontWeight: "bold" }}>
          {countdown > 0 ? `Rinvia codice in ${countdown}s` : "Non hai ricevuto il codice? Rinvialo"}
        </Button>
      </Box>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="secondary" type="submit" fullWidth disabled={!verificationCode.every((d) => d !== "")} sx={{ py: 1.5 }}>
          Verifica
        </Button>
      </Box>
    </Box>
  );
}

function PersonalInfoStep({ formData, handleChange, handleNextStep, error }: {
  formData: FormData; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNextStep: (e: React.FormEvent) => void; error: string;
}) {
  return (
    <Box component="form" onSubmit={handleNextStep} noValidate>
      <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>
        Dati personali
      </Typography>
      <TextField fullWidth label="Nome" name="firstName" required variant="outlined" margin="normal"
        value={formData.firstName} onChange={handleChange}
        error={!!(error && error.includes("nome"))} helperText={error && error.includes("nome") ? error : ""} />
      <TextField fullWidth label="Cognome" name="lastName" required variant="outlined" margin="normal"
        value={formData.lastName} onChange={handleChange}
        error={!!(error && error.includes("cognome"))} helperText={error && error.includes("cognome") ? error : ""} />
      <TextField fullWidth label="Telefono" name="phone" required variant="outlined" margin="normal"
        value={formData.phone} onChange={handleChange}
        error={!!(error && error.includes("telefono"))} helperText={error && error.includes("telefono") ? error : ""} />
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="secondary" type="submit" fullWidth sx={{ mt: 2, py: 1.5 }}>Continua</Button>
      </Box>
    </Box>
  );
}

function ActivitySelectionStep({ handleChange, handleNextStep, error }: {
  handleChange: (v: string) => void; handleNextStep: (e: React.FormEvent) => void; error: string;
}) {
  return (
    <Box component="form" onSubmit={handleNextStep} noValidate>
      <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>
        Seleziona la tua attività
      </Typography>
      <Typography align="center" variant="body1" sx={{ mb: 3 }}>
        Scegli l&apos;attività che meglio descrive quello che fai
      </Typography>
      <ActivityDropdown onActivityChange={handleChange} helperText={error} error={error} />
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="secondary" type="submit" fullWidth sx={{ mt: 2, py: 1.5 }}>Prosegui</Button>
      </Box>
    </Box>
  );
}

function SocialStep({ formData, handleChange, handleNextStep }: {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => void;
  handleNextStep: (e: React.FormEvent) => void;
}) {
  const [socialLinks, setSocialLinks] = useState<string[]>(formData.socialLinks ?? [""]);
  const [errors, setErrors] = useState<string[]>([]);

  const updateSocialLink = (index: number, value: string) => {
    const updated = [...socialLinks]; updated[index] = value; setSocialLinks(updated);
    if (errors[index]) { const e2 = [...errors]; e2[index] = ""; setErrors(e2); }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nonEmpty = socialLinks.filter((l) => l.trim());
    if (!nonEmpty.length) { setErrors(["Inserisci almeno un link"]); return; }
    let hasErrors = false;
    const newErrors = socialLinks.map((link) => {
      if (!link.trim()) return "";
      try { new URL(link); return ""; } catch { hasErrors = true; return "Inserisci un URL valido"; }
    });
    if (hasErrors) { setErrors(newErrors); return; }
    handleChange({ target: { name: "socialLinks", value: nonEmpty } });
    handleNextStep(e);
  };

  return (
    <Box component="form" onSubmit={validateAndSubmit} noValidate>
      <Typography align="center" variant="h4" sx={{ mb: 3 }}>
        Profili Social
      </Typography>
      <Typography align="center" variant="body1" sx={{ mb: 4 }}>
        Aggiungi i link ai tuoi profili social
      </Typography>

      <Stack spacing={2}>
        {socialLinks.map((link, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField fullWidth label={`Profilo social ${index + 1}`} placeholder="https://www.example.com/profile"
              value={link} onChange={(e) => updateSocialLink(index, e.target.value)}
              error={!!errors[index]} helperText={errors[index]} variant="outlined" margin="none" />
            {socialLinks.length > 1 && (
              <IconButton onClick={() => { setSocialLinks(socialLinks.filter((_, i) => i !== index)); setErrors(errors.filter((_, i) => i !== index)); }} color="error" size="large">
                <DeleteOutline />
              </IconButton>
            )}
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Button startIcon={<AddCircleOutline />} onClick={() => { setSocialLinks([...socialLinks, ""]); setErrors([...errors, ""]); }} variant="outlined" color="secondary" sx={{ my: 2 }}>
          Aggiungi un altro profilo
        </Button>
      </Box>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="secondary" type="submit" fullWidth sx={{ py: 1.5 }}>Continua</Button>
      </Box>
    </Box>
  );
}

function AdditionalInfo({ formData, handleChange, handleNextStep, fields, hasParagraph }: {
  formData: FormData; handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleNextStep: (e: React.FormEvent) => void; fields: string[]; hasParagraph: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let hasNew = false;
    fields.forEach((field) => {
      if (field === "paragraph") return;
      if (!formData[field] || !(formData[field] as string).trim()) { newErrors[field] = "Devi compilare prima questo campo!"; hasNew = true; }
    });
    if (hasNew) setErrors(newErrors);
    else handleNextStep(e);
  };

  return (
    <Box component="form" onSubmit={validateAndSubmit} noValidate>
      <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>
        Informazioni aggiuntive
      </Typography>
      {fields.filter((i) => i !== "paragraph").map((field) => (
        <TextField key={field} fullWidth label={field} name={field} required variant="outlined" margin="normal"
          value={(formData[field] as string) ?? ""} error={!!errors[field]} helperText={errors[field]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { if (errors[field]) setErrors({}); handleChange(e); }} />
      ))}
      {hasParagraph && (
        <TextareaAutosize className="signup-textarea" name="proposta" value={(formData.proposta as string) ?? ""} onChange={handleChange} minRows={3} placeholder="Raccontaci la tua idea" />
      )}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" color="secondary" type="submit" fullWidth sx={{ mt: 2, py: 1.5 }}>Continua</Button>
      </Box>
    </Box>
  );
}

function RegistrationComplete({ formData }: { formData: FormData }) {
  const listMap: Record<string, number> = {
    "Tech e Innovazione": 6, "Content Creator": 11, "Fashion e Design Addicted": 4,
    "Campaign Creators": 12, "Event Creators": 14, Community: 7,
  };

  useEffect(() => {
    sendRegisterRequest(formData).then((response) => {
      if (response.status === 200) {
        const idList = listMap[formData.activity];
        if (idList) {
          fetch(`https://api.huberway.com/api/lists/${idList}/subscribers`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer 58c2afb9319802ec0a56b74724f4b6a6" },
            body: JSON.stringify({ email: formData.email, status: "subscribed", source: "api", fields: { FIRST_NAME: formData.firstName, LAST_NAME: formData.lastName }, phone: formData.phone }),
          });
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box textAlign="center">
      <Typography textAlign="center" component="h1" variant="h4" sx={{ mb: 4, mt: 4, fontWeight: "bold" }}>
        Registrazione Completata
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Grazie <b>{formData.firstName}</b> per esserti registrato.<br />
        Attualmente stiamo verificando le informazioni del tuo account, riceverai una risposta entro 24h via e-mail.
      </Typography>
      <Typography variant="body1">
        Attività selezionata: <strong>{formData.activity}</strong>
      </Typography>
    </Box>
  );
}
