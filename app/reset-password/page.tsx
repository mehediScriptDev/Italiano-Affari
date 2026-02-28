import { Metadata } from "next";
import ResetPassword from "@/components/user/reset-password";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function ResetPasswordPage() {
  return (
    <div className="page-wrapper uni-body panel bg-white text-gray-900 overflow-x-hidden bp-xs bp-sm bp-md bp-lg bp-xl bp-xxl dom-ready">
      <div id="wrapper" className="wrap">
        <ResetPassword />
      </div>
    </div>
  );
}
