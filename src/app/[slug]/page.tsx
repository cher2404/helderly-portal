import { notFound } from "next/navigation";
import { getPublicProfileBySlug } from "@/lib/supabase/public-queries";
import { LoginForm } from "@/components/auth/login-form";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

const RESERVED_SLUGS = new Set([
  "login",
  "signup",
  "sign-up",
  "pricing",
  "billing",
  "dashboard",
  "owner",
  "api",
  "favicon.ico",
  "_next",
]);

export default async function BrandedLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const normalized = slug?.trim().toLowerCase() ?? "";

  if (!normalized || RESERVED_SLUGS.has(normalized)) {
    notFound();
  }

  const profile = await getPublicProfileBySlug(normalized);
  if (!profile) {
    notFound();
  }

  const businessName = profile.business_name?.trim() || "Deze professional";
  const branding = {
    businessName,
    logoUrl: profile.logo_url,
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm branding={branding} />
      </div>
      <p className="mt-6 text-center text-xs text-zinc-500">
        Powered by{" "}
        <Link href={ROUTES.home} className="text-zinc-400 hover:text-zinc-300">
          Helderly
        </Link>
      </p>
    </div>
  );
}
