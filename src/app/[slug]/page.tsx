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
  "intake",
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
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#6366f1] rounded-[4px] flex flex-col justify-center px-[3px] gap-[2.5px] shrink-0">
            <span className="block h-[1.5px] w-full bg-white rounded-full" />
            <span className="block h-[1.5px] bg-white rounded-full opacity-65" style={{ width: "68%" }} />
            <span className="block h-[1.5px] bg-white rounded-full opacity-35" style={{ width: "83%" }} />
          </div>
          <span className="text-[11px] text-zinc-600">
            Klantportaal door <span className="text-zinc-500 font-medium">Helderly</span>
          </span>
        </div>
        <span className="text-zinc-700 text-[11px]">·</span>
        <Link
          href={`${ROUTES.signUp}?ref=branded-login`}
          className="text-[11px] font-medium text-[#6366f1] hover:text-[#818cf8] transition-colors"
        >
          Zelf gratis proberen →
        </Link>
      </div>
    </div>
  );
}
