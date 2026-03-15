import type { ProjectLayoutConfig, WidgetLayoutItem } from "@/lib/database.types";

export const WIDGET_IDS = [
  "milestones",
  "contact_history",
  "documents",
  "decisions",
  "meetings",
  "budget_clarity",
  "faq",
  "scratchpad",
] as const;

export type WidgetId = (typeof WIDGET_IDS)[number];

export const WIDGET_META: Record<
  WidgetId,
  { label: string; description: string; freelancerOnly: boolean }
> = {
  milestones: { label: "Milestones", description: "Due dates and status.", freelancerOnly: false },
  contact_history: { label: "Contact history", description: "Moments of interaction.", freelancerOnly: false },
  documents: { label: "Documents", description: "Files and deliverables.", freelancerOnly: false },
  decisions: { label: "Decisions", description: "What was agreed. Client can confirm.", freelancerOnly: false },
  meetings: { label: "Meetings", description: "Appointments and calls.", freelancerOnly: false },
  budget_clarity: { label: "Budget clarity", description: "Estimated vs hours spent.", freelancerOnly: false },
  faq: { label: "FAQ", description: "Project-specific Q&A.", freelancerOnly: false },
  scratchpad: { label: "AI-Powered Ideas (Scratchpad)", description: "Private notes & AI suggestions.", freelancerOnly: true },
};

export function getDefaultLayoutConfig(isFreelancer: boolean): ProjectLayoutConfig {
  const ids = isFreelancer ? WIDGET_IDS : (WIDGET_IDS.filter((id) => !WIDGET_META[id].freelancerOnly) as WidgetId[]);
  const widgets: WidgetLayoutItem[] = ids.map((id, position) => ({
    id,
    visible: true,
    position,
  }));
  return { widgets };
}

export function normalizeLayoutConfig(
  config: ProjectLayoutConfig | null,
  isFreelancer: boolean
): ProjectLayoutConfig {
  if (!config?.widgets?.length) return getDefaultLayoutConfig(isFreelancer);
  const knownIds = new Set(WIDGET_IDS);
  const allowedIds = isFreelancer ? WIDGET_IDS : WIDGET_IDS.filter((id) => !WIDGET_META[id].freelancerOnly);
  const allowedSet = new Set(allowedIds);
  const existing = config.widgets
    .filter((w) => knownIds.has(w.id as WidgetId) && allowedSet.has(w.id as WidgetId))
    .sort((a, b) => a.position - b.position);
  const existingIds = new Set(existing.map((w) => w.id));
  const missing = allowedIds.filter((id) => !existingIds.has(id));
  const widgets: WidgetLayoutItem[] = [
    ...existing.map((w, i) => ({ ...w, position: i })),
    ...missing.map((id, i) => ({ id, visible: true, position: existing.length + i })),
  ];
  return { widgets };
}
