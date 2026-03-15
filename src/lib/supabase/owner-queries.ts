import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/database.types";

export type OwnerStats = {
  totalUsers: number;
  freelancers: number;
  clients: number;
  activeSubscriptions: number;
  trial: number;
  free: number;
};

export async function getOwnerStats(): Promise<OwnerStats> {
  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("role, subscription_status");
  if (!profiles?.length) {
    return {
      totalUsers: 0,
      freelancers: 0,
      clients: 0,
      activeSubscriptions: 0,
      trial: 0,
      free: 0,
    };
  }
  const totalUsers = profiles.length;
  const freelancers = profiles.filter((p) => p.role === "admin").length;
  const clients = totalUsers - freelancers;
  const activeSubscriptions = profiles.filter(
    (p) => p.subscription_status === "active"
  ).length;
  const trial = profiles.filter((p) => p.subscription_status === "trial").length;
  const free = profiles.filter((p) => p.subscription_status === "free").length;
  return {
    totalUsers,
    freelancers,
    clients,
    activeSubscriptions,
    trial,
    free,
  };
}

export async function getOwnerProfiles(): Promise<Profile[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Profile[];
}
