"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import HeaderPartner from "@/components/headers/header-partner";
import MobileMenu from "@/components/headers/mobile-menu";
import ScrollToTop from "@/components/common/scroll-to-top";
import "@/styles/dashboard-partner.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ScrollToTop />
      <HeaderPartner />
      <MobileMenu />
      <div style={{ backgroundColor: "#f6f8fb", minHeight: "100vh" }}>
        {children}
      </div>
    </ProtectedRoute>
  );
}
