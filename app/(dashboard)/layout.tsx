"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import ScrollToTop from "@/components/common/scroll-to-top";
import DashboardShell, { partnerSidebarConfig } from "@/components/layout/dashboard-shell";
import LoginSuccessModal from "@/components/common/login-success-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ScrollToTop />
      <LoginSuccessModal />
      <DashboardShell config={partnerSidebarConfig}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}

