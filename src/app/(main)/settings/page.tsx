import { Suspense } from "react";

import { SettingsClient } from "./SettingsClient";
import { SettingsPageSkeleton } from "@/components/ui/PageSkeletons";

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsClient />
    </Suspense>
  );
}
