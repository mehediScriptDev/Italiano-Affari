"use client";

import { type ReactNode, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "@/lib/theme";
import { AppProvider, AuthProvider } from "@/lib/context";
import { useRouter } from "next/navigation";

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function onLogout() {
      try {
        router.replace("/sign-in");
      } catch {
        if (typeof window !== "undefined") window.location.href = "/sign-in";
      }
    }
    window.addEventListener("app:logout", onLogout);
    return () => window.removeEventListener("app:logout", onLogout);
  }, [router]);
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
