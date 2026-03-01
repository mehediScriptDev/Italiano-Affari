import type { Metadata } from "next";
import StatsPage from "@/components/dashboard/stats-page";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function ReportPage() {
  return (
    <div id="report" className="overflow-hidden">
      <StatsPage />
    </div>
  );
}
