import type { Metadata } from "next";
import ContactManager from "@/components/dashboard/contact-manager";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function ContactsPage() {
  return (
    <Box>
      <div id="dashboard-partner" className="overflow-hidden">
        <ContactManager />
      </div>
    </Box>
  );
}
