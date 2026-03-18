export const ROUTES = {
  home: "/",
  login: "/login",
  signUp: "/signup",
  pricing: "/pricing",
  billing: "/billing",
  privacy: "/privacy",
  cookies: "/cookies",
  owner: "/owner",
  dashboard: "/dashboard",
  clients: "/dashboard/clients",
  timeline: "/dashboard/timeline",
  documents: "/dashboard/documents",
  messages: "/dashboard/messages",
  settings: "/dashboard/settings",
  project: (idOrSlug: string) => `/dashboard/project/${idOrSlug}`,
} as const;

/** Use in links: project slug for readable URLs, fallback to id. */
export function projectSegment(project: { slug?: string | null; id: string }): string {
  return project.slug ?? project.id;
}

export type UserRole = "client" | "freelancer";

/** Max file size in bytes: free = 5MB, Pro = 100MB */
export const MAX_UPLOAD_BYTES_FREE = 5 * 1024 * 1024;
export const MAX_UPLOAD_BYTES_PRO = 100 * 1024 * 1024;
