import { Suspense } from "react";

import { SettingsClient } from "./SettingsClient";
import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="pagePad">
          <SkeletonBlock height={260} />
        </main>
      }
    >
      <SettingsClient />
    </Suspense>
  );
}
