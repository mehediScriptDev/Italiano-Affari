"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const LOGIN_FLAG = "showLoginModal";

export default function LoginSuccessModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(LOGIN_FLAG) === "true") {
      localStorage.removeItem(LOGIN_FLAG);
      setOpen(true);
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(19,19,31,0.18)",
        },
      }}
    >
      {/* Green top accent bar */}
      {/* <Box sx={{ height: 6, background: "linear-gradient(90deg, #12715b 0%, #1aa382 100%)" }} /> */}

      <DialogContent sx={{ px: 4, pt: 4, pb: 4, textAlign: "center", background: "#f6f8fb" }}>
        {/* Icon */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(18,113,91,0.10)",
            mb: 2.5,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 42, color: "#12715b" }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 ,fontSize: { xs: "24px", lg: "26px" }, color: "#13131f", mb: 1, letterSpacing: "-0.01em" }}
        >
          Bentornato!
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{
            color: "#6b7280",
            mb: 3.5,
            lineHeight: 1.6,
            fontSize: { xs: "14px", lg: "16px" },
          }}
        >
          Accesso effettuato con successo. <br />
          Siamo felici di rivederti nella tua dashboard.
        </Typography>

        {/* CTA */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => setOpen(false)}
          sx={{
            background: "#12715b",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "10px",
            py: 1.2,
            fontSize: "0.95rem",
            "&:hover": {
              background: "#0f5e4a",
              boxShadow: "0 4px 14px rgba(18,113,91,0.35)",
            },
          }}
        >
          Continua
        </Button>
      </DialogContent>
    </Dialog>
  );
}
