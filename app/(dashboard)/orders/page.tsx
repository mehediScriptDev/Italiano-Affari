import type { Metadata } from "next";
import Orders from "@/components/dashboard/orders";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function OrdersPage() {
  return (
    <Box>
      <div id="dashboard-partner" className="overflow-hidden">
        <Orders />
      </div>
    </Box>
  );
}
