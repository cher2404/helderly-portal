import { getOwnerProfilesWithEmails } from "@/lib/supabase/owner-queries";
import { UsersTable } from "./users-table";

export default async function OwnerUsersPage() {
  const profiles = await getOwnerProfilesWithEmails();
  return (
    <div className="min-h-screen space-y-6 bg-zinc-950 text-zinc-100">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        Gebruikers
      </h1>
      <UsersTable profiles={profiles} />
    </div>
  );
}
