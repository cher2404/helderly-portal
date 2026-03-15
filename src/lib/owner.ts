/**
 * Owner portal access: only emails listed in OWNER_EMAILS (comma-separated) can access /owner.
 * Set in .env: OWNER_EMAILS=you@example.com,other@example.com
 */
export function getOwnerEmails(): string[] {
  const raw = process.env.OWNER_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isOwnerEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const allowed = getOwnerEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}
