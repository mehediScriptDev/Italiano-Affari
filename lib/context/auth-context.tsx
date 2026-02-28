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
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useAppContext } from "./app-context";
import { API_URL } from "@/lib/api/client";
import type { DecodedToken } from "@/lib/types";

interface AuthContextValue {
  token: string | null;
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
  const [token, setTokenState] = useState<string | null>(null);
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
        window.location.href = "/sign-in";
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
    }
  }, []);

  useEffect(() => {
    axios.defaults.baseURL = API_URL;
    axios.defaults.withCredentials = true;

    const interceptorId = axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshRes = await axios.post("/refresh-token");
            const newToken = refreshRes.data.access_token;
            axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch {
            setToken();
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [setToken]);

  const contextValue = useMemo(
    () => ({ token, setToken, getDecodedToken, updateProfile }),
    [token, setToken, getDecodedToken, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
