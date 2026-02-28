import type { Metadata } from "next";
import AgentManagement from "@/components/dashboard/agent-management";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function AgentManagementPage() {
  return (
    <Box>
      <div id="dashboard-partner" className="overflow-hidden">
        <AgentManagement />
      </div>
    </Box>
  );
}
