"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/sign-in");
    }
  }, [token, router]);

  if (!token) return null;

  return <>{children}</>;
}
