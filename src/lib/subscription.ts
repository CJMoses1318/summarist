import type { UserProfile } from "@/types/user-profile";

export function isSubscribed(profile: UserProfile | null): boolean {
  return (
    profile?.subscriptionPlan === "premium" ||
    profile?.subscriptionPlan === "premium-plus"
  );
}
