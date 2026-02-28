import { Metadata } from "next";
import { Suspense } from "react";
import AssetCompletionForm from "@/components/user/profile/asset-completion-form";

export const metadata: Metadata = {
  title: "Psicopatici Partners",
  description: "Psicopatici Italia - Diventa nostro Partner!",
};

export default function AssetFormPage() {
  return (
    <div className="overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <AssetCompletionForm />
      </Suspense>
    </div>
  );
}
