import type { Metadata } from "next";
import DashboardPartner from "@/components/dashboard/dashboard-partner";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function DashboardPage() {
  return (
    <div id="dashboard-partner" className="overflow-hidden">
      <DashboardPartner />
    </div>
  );
}
