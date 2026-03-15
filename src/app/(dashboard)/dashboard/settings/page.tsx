import { getProfile } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return <SettingsClient profile={profile} />;
}
