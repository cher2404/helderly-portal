import { notFound } from "next/navigation";
import { getPublicProfileBySlug } from "@/lib/supabase/public-queries";
import { IntakeForm } from "@/components/intake/intake-form";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);
  const name = profile?.business_name || "Deze freelancer";
  return {
    title: `Projectaanvraag — ${name}`,
    description: `Stuur een projectaanvraag naar ${name} via Helderly.`,
  };
}

export default async function IntakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) notFound();

  const businessName = profile.business_name?.trim() || "Deze freelancer";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {profile.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.logo_url} alt={businessName} className="h-7 w-7 rounded-[6px] object-cover" />
          ) : (
            <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
              <span className="block h-[2.5px] w-full bg-white rounded-full" />
              <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
              <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
            </div>
          )}
          <span className="text-sm font-semibold text-zinc-100">{businessName}</span>
        </div>
        <span className="text-xs text-zinc-600">Projectaanvraag</span>
      </nav>

      {/* Hero */}
      <div className="max-w-lg mx-auto px-4 pt-12 pb-4 text-center">
        <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-2xl mx-auto mb-5">
          ✉️
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 mb-3">
          Vertel me over je{" "}
          <span className="italic text-[#818cf8]" style={{ fontFamily: "Georgia, serif" }}>
            project.
          </span>
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Vul het formulier in — <strong className="text-zinc-300">{businessName}</strong> neemt binnen 24 uur contact op.
        </p>
      </div>

      {/* Formulier */}
      <div className="max-w-lg mx-auto px-4 pb-12">
        <IntakeForm slug={profile.slug} freelancerName={businessName} />
      </div>

      {/* Powered by */}
      <div className="pb-8 text-center">
        <div className="inline-flex items-center gap-2 text-[11px] text-zinc-700">
          <span>Aangedreven door</span>
          <Link href={`${ROUTES.signUp}?ref=intake-footer`} className="text-zinc-500 hover:text-[#6366f1] transition-colors font-medium">
            Helderly
          </Link>
          <span>·</span>
          <Link href={`${ROUTES.signUp}?ref=intake-cta`} className="text-[#6366f1] hover:text-[#818cf8] transition-colors">
            Zelf gratis proberen →
          </Link>
        </div>
      </div>
    </div>
  );
}
