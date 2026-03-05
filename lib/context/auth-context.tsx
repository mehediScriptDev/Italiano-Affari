"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAppContext } from "./app-context";
import { API_URL } from "@/lib/api/client";
import type { DecodedToken } from "@/lib/types";

interface AuthContextValue {
  token: string | null;
  isHydrated: boolean;
  setToken: (t?: string | null) => void;
  getDecodedToken: (t: string) => DecodedToken | null;
  updateProfile: (token: string, secret: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setProfile } = useAppContext();

  const setToken = useCallback(
    (newToken?: string | null) => {
      if (newToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        localStorage.setItem("token", newToken);
      } else {
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        setProfile(null);
        try {
          router.replace("/sign-in");
        } catch {
          if (typeof window !== "undefined") window.location.href = "/sign-in";
        }
      }
      setTokenState(newToken ?? null);
    },
    [setProfile]
  );

  const getDecodedToken = useCallback((t: string): DecodedToken | null => {
    return t ? jwtDecode<DecodedToken>(t) : null;
  }, []);

  const updateProfile = useCallback(
    (tok: string, secret: string) => {
      const decoded = getDecodedToken(tok);
      if (!decoded) return;
      setProfile({
        id: decoded.user.id,
        email: decoded.user.email,
        name: `${decoded.user.first_name} ${decoded.user.last_name}`,
        activity: decoded.user.activity,
        mobile: decoded.user.phone,
        avatar: decoded.user.avatar,
        coupon_code: decoded.user.coupon_code,
        percentage: decoded.user.percentage,
        secret,
        secure: false,
        business_info: JSON.parse(decoded.user.info_business),
      });
    },
    [getDecodedToken, setProfile]
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      setTokenState(savedToken);
      try {
        const decoded = jwtDecode<DecodedToken>(savedToken);
        if (decoded?.user) {
          // Prefer values the user already edited & saved (storedProfile).
          // Fall back to JWT claims only when nothing is stored yet.
          const storedProfile = (() => {
            try { return JSON.parse(localStorage.getItem("profile") ?? "null"); } catch { return null; }
          })();
          const infoBusiness = (() => {
            // May already be an object (decoded twice) or missing — guard both
            if (storedProfile?.business_info) return storedProfile.business_info;
            try { return JSON.parse(decoded.user.info_business ?? "{}"); } catch { return {}; }
          })();
          setProfile({
            id: decoded.user.id,
            email: storedProfile?.email ?? decoded.user.email,
            name: storedProfile?.name ?? `${decoded.user.first_name} ${decoded.user.last_name}`,
            activity: decoded.user.activity,
            mobile: storedProfile?.mobile ?? decoded.user.phone,
            avatar: storedProfile?.avatar ?? decoded.user.avatar,
            coupon_code: decoded.user.coupon_code,
            percentage: decoded.user.percentage,
            secret: storedProfile?.secret ?? "",
            secure: storedProfile?.secure ?? false,
            business_info: infoBusiness,
          });
        }
      } catch {
        // Token is corrupt / undecodable — treat as unauthenticated
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        setTokenState(null);
      }
    }
    setIsHydrated(true);

    // Handle token expiry / forced logout dispatched by the Axios interceptor
    const handleLogout = () => {
      setTokenState(null);
      setProfile(null);
      try { router.replace("/sign-in"); } catch {
        if (typeof window !== "undefined") window.location.href = "/sign-in";
      }
    };
    window.addEventListener("app:logout", handleLogout);
    return () => window.removeEventListener("app:logout", handleLogout);
  }, [setProfile, router]);

  const contextValue = useMemo(
    () => ({ token, isHydrated, setToken, getDecodedToken, updateProfile }),
    [token, isHydrated, setToken, getDecodedToken, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
