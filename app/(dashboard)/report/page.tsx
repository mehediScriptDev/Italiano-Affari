import type { Metadata } from "next";
import StatsPage from "@/components/dashboard/stats-page";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function ReportPage() {
  return (
    <div className="d-flex justify-center px-2">
      <div
        id="dashboard-partner"
        className="w-100 d-flex flex-column justify-center p-0"
        style={{ maxWidth: "1200px" }}
      >
        <StatsPage />
      </div>
    </div>
  );
}
