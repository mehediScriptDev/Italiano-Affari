"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import ScrollToTop from "@/components/common/scroll-to-top";
import DashboardShell, { partnerSidebarConfig } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ScrollToTop />
      <DashboardShell config={partnerSidebarConfig}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}

