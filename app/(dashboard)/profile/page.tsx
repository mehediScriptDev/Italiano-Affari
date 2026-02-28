import type { Metadata } from "next";
import ProfilePage from "@/components/user/profile/profile-page";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function ProfileSettingsPage() {
  return (
    <div id="profile-settings" className="overflow-hidden">
      <ProfilePage index={0} />
    </div>
  );
}
