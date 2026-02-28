"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import type { UserProfile } from "@/lib/types";

interface AppContextValue {
  profile: UserProfile | null;
  setProfile: (p: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => void;
  isMobile: boolean;
  addBackupSecretKey: (key: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(getStoredProfile);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const setProfile = useCallback(
    (value: UserProfile | null | ((prev: UserProfile | null) => UserProfile | null)) => {
      if (typeof value === "function") {
        setProfileState((prev) => {
          const updated = value(prev);
          if (updated) localStorage.setItem("profile", JSON.stringify(updated));
          else localStorage.removeItem("profile");
          return updated;
        });
      } else {
        setProfileState(value);
        if (value) localStorage.setItem("profile", JSON.stringify(value));
        else localStorage.removeItem("profile");
      }
    },
    []
  );

  const addBackupSecretKey = useCallback(
    (key: string) => {
      setProfile((prev) => (prev ? { ...prev, secret: key } : null));
    },
    [setProfile]
  );

  return (
    <AppContext.Provider value={{ profile, setProfile, isMobile, addBackupSecretKey }}>
      {children}
    </AppContext.Provider>
  );
}
