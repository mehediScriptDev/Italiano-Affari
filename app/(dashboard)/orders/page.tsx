import type { Metadata } from "next";
import Orders from "@/components/dashboard/orders";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function OrdersPage() {
  return (
    <div id="orders" className="overflow-hidden">
      <Orders />
    </div>
  );
}
