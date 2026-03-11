import { redirect } from "next/navigation";

// /admin/agents without an ID → go back to dashboard list
export default function AdminAgentsIndexPage() {
  redirect("/admin/dashboard");
}
