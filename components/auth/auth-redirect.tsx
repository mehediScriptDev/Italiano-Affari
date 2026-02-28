"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

export default function AuthRedirect() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  return null;
}
