import type { Metadata } from "next";
import Wallet from "@/components/dashboard/wallet";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function WalletPage() {
  return (
    <div id="wallet" className="overflow-hidden">
      <Wallet />
    </div>
  );
}
