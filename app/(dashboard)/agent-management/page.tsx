import type { Metadata } from "next";
import AgentManagement from "@/components/dashboard/agent-management";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function AgentManagementPage() {
  return (
    <div id="agent-management" className="overflow-hidden">
      <AgentManagement />
    </div>
  );
}
