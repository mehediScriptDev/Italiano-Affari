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
      const decoded = jwtDecode<DecodedToken>(savedToken);
      if (decoded?.user) {
        const storedProfile = (() => {
          try { return JSON.parse(localStorage.getItem("profile") ?? "null"); } catch { return null; }
        })();
        setProfile({
          id: decoded.user.id,
          email: decoded.user.email,
          name: `${decoded.user.first_name} ${decoded.user.last_name}`,
          activity: decoded.user.activity,
          mobile: decoded.user.phone,
          avatar: decoded.user.avatar,
          coupon_code: decoded.user.coupon_code,
          percentage: decoded.user.percentage,
          secret: storedProfile?.secret ?? "",
          secure: storedProfile?.secure ?? false,
          business_info: JSON.parse(decoded.user.info_business),
        });
      }
    }
    setIsHydrated(true);
  }, [setProfile]);

  const contextValue = useMemo(
    () => ({ token, isHydrated, setToken, getDecodedToken, updateProfile }),
    [token, isHydrated, setToken, getDecodedToken, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
