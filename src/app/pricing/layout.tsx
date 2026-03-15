import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Helderly Pro — €19/month. Unlimited projects, client portal, and collaboration. Start your 30-day free trial.",
};

export default function PricingLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
