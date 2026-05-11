import type { Book } from "@/types/book";

export type SubscriptionPlan = "basic" | "premium" | "premium-plus";

export interface UserProfile {
  subscriptionPlan: SubscriptionPlan;
  savedBooks: Book[];
  finishedBookIds: string[];
  stripeCustomerId?: string;
}
