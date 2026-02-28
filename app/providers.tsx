"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "@/lib/theme";
import { AppProvider, AuthProvider } from "@/lib/context";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AuthProvider>{children}</AuthProvider>
      </AppProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}
