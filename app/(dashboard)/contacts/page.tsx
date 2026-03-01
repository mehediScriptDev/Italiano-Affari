import type { Metadata } from "next";
import ContactManager from "@/components/dashboard/contact-manager";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function ContactsPage() {
  return (
    <div id="contacts" className="overflow-hidden">
      <ContactManager />
    </div>
  );
}
