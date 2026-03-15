export const ROUTES = {
  home: "/",
  login: "/login",
  signUp: "/signup",
  pricing: "/pricing",
  billing: "/billing",
  owner: "/owner",
  dashboard: "/dashboard",
  clients: "/dashboard/clients",
  timeline: "/dashboard/timeline",
  documents: "/dashboard/documents",
  messages: "/dashboard/messages",
  settings: "/dashboard/settings",
  project: (id: string) => `/dashboard/project/${id}`,
} as const;

export type UserRole = "client" | "freelancer";

/** Max file size in bytes: free = 5MB, Pro = 100MB */
export const MAX_UPLOAD_BYTES_FREE = 5 * 1024 * 1024;
export const MAX_UPLOAD_BYTES_PRO = 100 * 1024 * 1024;
