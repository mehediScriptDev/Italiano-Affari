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
      <div className="d-flex justify-center px-2">
        <div
          id="dashboard-partner"
          className="w-100 d-flex flex-column justify-center p-0"
          style={{ maxWidth: "1200px" }}
        >
          <Wallet />
        </div>
      </div>
    </Box>
  );
}
