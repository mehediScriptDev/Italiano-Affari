"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";

export default function AuthRedirect() {
  const { token, isHydrated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isHydrated && token) {
      const callbackUrl = searchParams.get("callbackUrl");
      router.replace(callbackUrl ?? "/dashboard");
    }
  }, [isHydrated, token, router, searchParams]);

  return null;
}
