"use client";

import { useState, useRef } from "react";
import {
  Button, Card, CardContent, Typography, useMediaQuery, Box, Paper,
} from "@mui/material";
import { Check, Close, ContentCopy, Download } from "@mui/icons-material";
import { ReactQRCode } from "@lglab/react-qr-code";
import { useAppContext } from "@/lib/context/app-context";

const API_URL = "https://api.psicopatici.com/api";

export default function SecurityComponent() {
  const isMobile = useMediaQuery((theme: { breakpoints: { down: (b: string) => string } }) => theme.breakpoints.down("sm"));
  const { profile } = useAppContext();
  const [secure, setSecure] = useState(profile?.secure);
  const secretRef = useRef<HTMLElement>(null);

  const twoFactorSecret = profile?.secret ?? "";
  const twoFactorQrUrl = `${API_URL}/download-secret?secret=${twoFactorSecret}`;

  const handleActivate2FA = () => { /* TODO */ };
  const handleCopySecret = () => navigator.clipboard.writeText(twoFactorSecret);
  const handleDownloadSecret = () => {
    const blob = new Blob([twoFactorSecret], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-secret.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="card-shadow d-flex justify-center" sx={{ borderRadius: 2, minHeight: "650px" }}>
      <CardContent>
        <Typography variant="h5" align="center" fontWeight={700}>Sicurezza</Typography>
          <div className={`d-flex justify-between ${isMobile ? "" : "align-center"} flex-sm-column gap-3`}>
            <div className="d-flex flex-column justify-center align-center">
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography textAlign="center" variant="subtitle1" sx={{ mb: 1 }}>Scansiona il codice QR con il tuo cellulare</Typography>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2, alignItems: "center" }}>
                <Box sx={{ p: 2, backgroundColor: "white", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                  <ReactQRCode value={twoFactorQrUrl} size={150} marginSize={0}
                    dataModulesSettings={{ color: "#000000", style: "rounded", randomSize: false }}
                    finderPatternOuterSettings={{ style: "rounded" }}
                    finderPatternInnerSettings={{ style: "rounded-sm" }}
                    imageSettings={{ src: "/assets/images/qr-code-logo.png", width: 50, height: 50, excavate: true }}
                  />
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="subtitle2">Backup Secret Key:</Typography>
                  <Paper sx={{ p: 1, display: "flex", alignItems: "center", width: "100%", backgroundColor: "#f5f5f5" }}>
                    <Box ref={secretRef} component="code" sx={{ color: "black", maxWidth: "250px", fontFamily: "monospace", letterSpacing: "0.5px", whiteSpace: "nowrap", overflowX: "auto", msOverflowStyle: "none", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, userSelect: "text", cursor: "text" }}>
                      {twoFactorSecret}
                    </Box>
                  </Paper>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" size="small" onClick={handleCopySecret} startIcon={<ContentCopy />}>Copia</Button>
                    <Button variant="outlined" size="small" onClick={handleDownloadSecret} startIcon={<Download />}>Scarica</Button>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box sx={{ maxWidth: "fit-content", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Typography textAlign="center" variant="h6" sx={{ color: "black", fontSize: 16 }}>
                Stato 2FA {isMobile ? "" : "(Two-Factor Authentication)"}: {secure ? <Check sx={{ color: "green" }} /> : <Close sx={{ color: "red" }} />}
              </Typography>
              {!secure && <Button variant="contained" color="secondary" onClick={handleActivate2FA} sx={{ mt: 1, width: "30%" }}>Attiva</Button>}
            </Box>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
