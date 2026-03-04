"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect after localStorage has been read and token is confirmed absent
    if (isHydrated && !token) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isHydrated, token, router, pathname]);

  // Always render children immediately — no white screen, no loader.
  // The useEffect above handles redirect if truly unauthenticated.
  return <>{children}</>;
}
