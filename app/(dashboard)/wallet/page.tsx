import type { Metadata } from "next";
import Wallet from "@/components/dashboard/wallet";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function WalletPage() {
  return (
    <Box>
      <div className="flex justify-center px-2">
        <div
          id="dashboard-partner"
          className="w-full max-w-[1200px] flex flex-col justify-center p-0"
        >
          <Wallet />
        </div>
      </div>
    </Box>
  );
}
