import { Metadata } from "next";
import SignupPage from "@/components/user/signup-page";
import AuthRedirect from "@/components/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Psicopatici Signup",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <div className="page-wrapper uni-body panel bg-secondary dark:bg-gray-900 text-gray-900 dark:text-gray-200 overflow-x-hidden bp-xs bp-sm bp-md bp-lg bp-xl bp-xxl dom-ready">
        <div className="h-screen">
          <SignupPage />
        </div>
      </div>
    </>
  );
}
