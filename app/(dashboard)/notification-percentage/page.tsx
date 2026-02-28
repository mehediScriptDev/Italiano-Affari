import type { Metadata } from "next";
import NotificationsPercentage from "@/components/notifications/notifications-percentage";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function NotificationPercentagePage() {
  return (
    <div id="notification-percentage" className="overflow-hidden">
      <NotificationsPercentage />
    </div>
  );
}
