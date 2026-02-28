import { Metadata } from "next";
import SignInComponent from "@/components/user/sign-in";
import AuthRedirect from "@/components/auth/auth-redirect";

export const metadata: Metadata = {
  title: "Psicopatici Sign In",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function SignInPage() {
  return (
    <>
      <AuthRedirect />
      <div className="page-wrapper uni-body panel text-gray-900 overflow-x-hidden bp-xs bp-sm bp-md bp-lg bp-xl bp-xxl dom-ready">
        <div id="wrapper" className="wrap">
          <SignInComponent />
        </div>
      </div>
    </>
  );
}
