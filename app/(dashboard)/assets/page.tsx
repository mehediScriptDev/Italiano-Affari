import type { Metadata } from "next";
import ProfilePage from "@/components/user/profile/profile-page";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function AssetsPage() {
  return (
    <div id="profile-settings" className="overflow-hidden">
      <ProfilePage index={1} />
    </div>
  );
}
