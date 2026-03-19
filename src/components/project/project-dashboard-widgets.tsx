"use client";

import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Video,
  FileText,
  Plus,
  Download,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  EyeOff,
  Check,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/toast";
import {
  LinearCard,
  LinearCardHeader,
  LinearCardTitle,
  LinearCardDescription,
  LinearCardContent,
} from "@/components/ui/linear-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStageMilestone,
  updateStageMilestone,
  updateAppointmentStatus,
  setDecisionConfirmed,
  deleteFaq,
  saveInternalNote,
  updateProjectHours,
} from "@/app/actions/projects";
import { getSignedUrlFromAsset } from "@/lib/supabase/storage";
import type {
  Project,
  ProjectStage,
  Appointment,
  ContactLog,
  Asset,
  Decision,
  ProjectFaq,
} from "@/lib/database.types";
import type { StageStatus, MilestoneStatus } from "@/lib/database.types";
import { WIDGET_META, type WidgetId } from "@/lib/project-widgets";
import { useProjectLayout } from "./project-layout-provider";

const HOVER_CARD =
  "rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/50 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700/80";

const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Video,
  default: MessageCircle,
};

export type ProjectWidgetProps = {
  projectId: string;
  project: Project;
  isFreelancer: boolean;
  stages: ProjectStage[];
  setStages: React.Dispatch<React.SetStateAction<ProjectStage[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  contactLogs: ContactLog[];
  assets: Asset[];
  decisions: Decision[];
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
  faqs: ProjectFaq[];
  setFaqs: React.Dispatch<React.SetStateAction<ProjectFaq[]>>;
  expandedFaqId: string | null;
  setExpandedFaqId: React.Dispatch<React.SetStateAction<string | null>>;
  internalNotes: string;
  setInternalNotes: React.Dispatch<React.SetStateAction<string>>;
  setModal: (m: "meeting" | "contact" | "decision" | "faq" | null) => void;
};

type DashboardWidgetShellProps = {
  widgetId: WidgetId;
  children: React.ReactNode;
  editMode: boolean;
  onHide: () => void;
  isSortable: boolean;
  sortableRef?: (node: HTMLElement | null) => void;
  sortableStyle?: React.CSSProperties;
  sortableAttributes?: Record<string, unknown>;
  sortableListeners?: Record<string, unknown>;
};

function DashboardWidgetShell({
  widgetId,
  children,
  editMode,
  onHide,
  isSortable,
  sortableRef,
  sortableStyle,
  sortableAttributes,
  sortableListeners,
}: DashboardWidgetShellProps) {
  const meta = WIDGET_META[widgetId];

  return (
    <div
      ref={sortableRef}
      style={sortableStyle}
      className={
        editMode && isSortable
          ? "rounded-[12px] border border-dashed border-zinc-600/60 bg-zinc-900/30 min-h-[120px]"
          : ""
      }
    >
      <LinearCard
        className={cn(
          "glass-card border-white/10 bg-white/5",
          editMode && isSortable && "border-dashed border-zinc-500/60 bg-zinc-900/40"
        )}
      >
        <LinearCardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {editMode && isSortable && (
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50"
                aria-label="Drag to reorder"
                {...(sortableAttributes ?? {})}
                {...(sortableListeners ?? {})}
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <LinearCardTitle>{meta.label}</LinearCardTitle>
              <LinearCardDescription>{meta.description}</LinearCardDescription>
            </div>
          </div>
          {editMode && isSortable && (
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50"
              onClick={onHide}
              aria-label="Hide widget"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          )}
        </LinearCardHeader>
        <LinearCardContent>{children}</LinearCardContent>
      </LinearCard>
    </div>
  );
}

type SortableDashboardWidgetProps = {
  widgetId: WidgetId;
  index: number;
  children: React.ReactNode;
  isSortable: boolean;
};

export function SortableDashboardWidget({
  widgetId,
  index,
  children,
  isSortable,
}: SortableDashboardWidgetProps) {
  const { editMode, hideWidget } = useProjectLayout();
  const sortable = useSortable(
    isSortable ? { id: widgetId, data: { index } } : { id: `noop-${widgetId}`, disabled: true }
  );

  const sortableStyle =
    isSortable && sortable.isDragging
      ? { opacity: 0.5 }
      : {
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
        };

  return (
    <DashboardWidgetShell
      widgetId={widgetId}
      editMode={editMode}
      onHide={() => hideWidget(widgetId)}
      isSortable={isSortable}
      sortableRef={isSortable ? sortable.setNodeRef : undefined}
      sortableStyle={isSortable ? sortableStyle : undefined}
      sortableAttributes={isSortable ? (sortable.attributes as unknown as Record<string, unknown>) : undefined}
      sortableListeners={isSortable ? (sortable.listeners as unknown as Record<string, unknown>) : undefined}
    >
      {children}
    </DashboardWidgetShell>
  );
}

function MilestonesWidgetContent({ projectId, stages, setStages, isFreelancer }: ProjectWidgetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "m" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        setShowAddForm((v) => !v);
        setAddTitle("");
        setAddError(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleAdd = async () => {
    const title = addTitle.trim();
    if (!title) {
      setAddError("Title required");
      return;
    }
    setAddError(null);
    const result = await createStageMilestone(projectId, title, isFreelancer);
    if (result.error) {
      setAddError(result.error);
      showToast("Er ging iets mis bij het aanmaken van de milestone", "error");
      return;
    }
    if (result.stage) setStages((prev) => [...prev, result.stage!].sort((a, b) => a.sort_order - b.sort_order));
    setShowAddForm(false);
    setAddTitle("");
    showToast("Milestone aangemaakt", "success");
  };

  const handleApprove = async (stage: ProjectStage) => {
    const result = await updateStageMilestone(projectId, stage.id, { status: "active" });
    if (result.error) {
      showToast("Er ging iets mis bij het goedkeuren van de milestone", "error");
      return;
    }
    setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, status: "active" as MilestoneStatus } : s)));
    showToast("Milestone goedgekeurd", "success");
  };

  const handleEditSave = async (stage: ProjectStage) => {
    const title = editTitle.trim();
    if (!title) return;
    const result = await updateStageMilestone(projectId, stage.id, { title });
    if (result.error) {
      showToast("Er ging iets mis bij het opslaan van de milestone", "error");
      return;
    }
    setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, title } : s)));
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-zinc-600 dark:text-zinc-400"
          onClick={() => {
            setShowAddForm(true);
            setAddTitle("");
            setAddError(null);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Mijlpaal toevoegen <kbd className="ml-1 px-1.5 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700">M</kbd>
        </Button>
      </div>
      {showAddForm && (
        <div className={`${HOVER_CARD} p-3 border-2 border-dashed border-zinc-300 dark:border-zinc-600`}>
          <Input
            placeholder="Milestone title"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="mb-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
            autoFocus
          />
          {addError && <p className="text-xs text-red-500 mb-2">{addError}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="bg-[var(--primary-accent)] text-white hover:opacity-90">Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowAddForm(false); setAddError(null); }}>Cancel</Button>
          </div>
        </div>
      )}
      {stages.length === 0 && !showAddForm ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 py-4">No milestones.</p>
      ) : (
        <ul className="space-y-2">
          {stages.map((stage, index) => {
            const isPending = stage.status === "pending_approval";
            const isEditing = editingId === stage.id;
            const isFirst = index === 0;
            return (
              <li
                key={stage.id}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                  isPending
                    ? "border-dashed border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {stage.is_completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : stage.stage_status === "blocked" ? (
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                  ) : isFirst ? (
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-zinc-500" />
                  )}
                  {isEditing ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEditSave(stage)}
                      className="h-7 flex-1 min-w-0 border-white/20 bg-white/5 text-zinc-200"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-sm truncate ${stage.is_completed ? "text-zinc-500 line-through" : isFirst ? "text-[var(--primary-accent)] font-medium" : "text-zinc-200"}`}
                    >
                      {stage.title}
                    </span>
                  )}
                  {isPending && !isEditing && (
                    <span className="shrink-0 text-xs text-amber-600 dark:text-amber-400 font-medium">In afwachting</span>
                  )}
                  {isFreelancer && !isEditing ? (
                    <Input
                      type="date"
                      className="h-7 w-32 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300"
                      value={stage.due_date ?? ""}
                      onChange={async (e) => {
                        const v = e.target.value || null;
                        await updateStageMilestone(projectId, stage.id, { due_date: v });
                        setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, due_date: v } : s)));
                      }}
                    />
                  ) : stage.due_date && !isEditing ? (
                    <span className="text-xs text-zinc-500 shrink-0">{stage.due_date}</span>
                  ) : null}
                </div>
                {isFreelancer && !isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    {isPending && (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600 dark:text-emerald-400" onClick={() => handleApprove(stage)}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingId(stage.id); setEditTitle(stage.title); }}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </>
                    )}
                    <select
                      className="rounded border border-zinc-300 bg-white text-xs text-zinc-700 py-1 px-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      value={stage.stage_status ?? "in_progress"}
                      onChange={async (e) => {
                        const v = e.target.value as StageStatus;
                        await updateStageMilestone(projectId, stage.id, { stage_status: v });
                        setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, stage_status: v } : s)));
                      }}
                    >
                      <option value="blocked">Geblokkeerd</option>
                      <option value="in_progress">In uitvoering</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                )}
                {isEditing && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" onClick={() => handleEditSave(stage)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditTitle(""); }}>Cancel</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ContactHistoryWidgetContent({ contactLogs }: ProjectWidgetProps) {
  return contactLogs.length === 0 ? (
    <p className="text-sm text-zinc-500 py-4">Nog geen contact gelogd.</p>
  ) : (
    <ul className="space-y-3">
      {contactLogs.map((log) => {
        const Icon = CHANNEL_ICONS[log.channel] ?? CHANNEL_ICONS.default;
        return (
          <li key={log.id} className={`flex gap-3 ${HOVER_CARD} p-3`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{log.summary}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {log.log_date} · {log.channel}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DocumentsWidgetContent({ assets }: ProjectWidgetProps) {
  const displayItems = assets.length > 0 ? assets : [{ id: "placeholder", file_name: "Wood Source List (oak).pdf", file_url: "#" } as Asset & { id: string }];
  const isPlaceholder = assets.length === 0;
  return (
    <ul className="space-y-2">
      {displayItems.map((a) => (
        <li
          key={a.id}
          className={`flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 ${isPlaceholder ? "opacity-70" : ""}`}
        >
          <span className="text-sm text-zinc-300 truncate flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
            {a.file_name}
          </span>
          {!isPlaceholder && (
            <a
              href="#"
              onClick={async (ev) => {
                ev.preventDefault();
                const signedUrl = await getSignedUrlFromAsset(a);
                if (!signedUrl) {
                  showToast("Kon bestand niet openen", "error");
                  return;
                }
                window.open(signedUrl, "_blank", "noopener,noreferrer");
              }}
              className="text-zinc-400 hover:text-[var(--primary-accent)]"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function DecisionsWidgetContent({
  isFreelancer,
  decisions,
  setDecisions,
  setModal,
}: ProjectWidgetProps) {
  return (
    <>
      {isFreelancer && (
        <div className="flex justify-end -mt-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-zinc-600 dark:text-zinc-400"
            onClick={() => {
              setModal("decision");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {decisions.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 py-4">No decisions logged yet.</p>
      ) : (
        <ul className="space-y-3">
          {decisions.map((d) => (
            <li key={d.id} className={`${HOVER_CARD} p-3`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{d.title}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-0.5">{d.decision_date}</p>
                  {d.rationale && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{d.rationale}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.confirmed_by_client ? (
                    <span className="text-xs text-emerald-400">Confirmed</span>
                  ) : isFreelancer ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded h-7 text-xs"
                      onClick={async () => {
                        await setDecisionConfirmed(d.id, true);
                        setDecisions((prev) =>
                          prev.map((x) =>
                            x.id === d.id ? { ...x, confirmed_by_client: true } : x
                          )
                        );
                      }}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function MeetingsWidgetContent({
  isFreelancer,
  appointments,
  setAppointments,
  setModal,
}: ProjectWidgetProps) {
  return (
    <>
      {isFreelancer && (
        <div className="flex justify-end -mt-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/10 text-[#818cf8] hover:bg-[#6366f1]/20 [&_svg]:drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            onClick={() => setModal("meeting")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {appointments.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 py-4">Nog geen afspraken.</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((apt) => (
            <li
              key={apt.id}
              className={`${HOVER_CARD} p-3 flex flex-wrap items-start justify-between gap-2`}
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{apt.title}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {apt.appointment_date}
                  {apt.appointment_time && (
                    <>
                      <Clock className="h-3 w-3" />
                      {apt.appointment_time}
                    </>
                  )}
                </p>
                {apt.location && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {apt.location}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${apt.status === "completed" ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"}`}
                >
                  {apt.status}
                </span>
                {isFreelancer && apt.status === "upcoming" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded h-7 text-xs"
                    onClick={async () => {
                      await updateAppointmentStatus(apt.id, "completed");
                      setAppointments((prev) =>
                        prev.map((a) =>
                          a.id === apt.id ? { ...a, status: "completed" as const } : a
                        )
                      );
                    }}
                  >
                    Mark done
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const HOURLY_RATE = 80;

function BudgetClarityWidgetContent({
  projectId,
  project,
  isFreelancer,
  setProject,
}: ProjectWidgetProps & { setProject: React.Dispatch<React.SetStateAction<Project>> }) {
  const estimated = project.estimated_hours ?? 15;
  const actual = project.actual_hours ?? 0;
  const estimatedEur = estimated * HOURLY_RATE;
  const spentEur = actual * HOURLY_RATE;
  const burnPct = estimated > 0 ? Math.min(100, (actual / estimated) * 100) : 0;
  const underBudget = actual <= estimated;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-zinc-400">
          Estimated: <strong className="text-zinc-200">{estimated}h</strong> (€{estimatedEur})
        </span>
        <span className="flex items-center gap-1 text-zinc-400">
          Spent: <strong className="text-zinc-200">{actual}h</strong> (€{spentEur})
          {actual > 0 && (
            <span className={underBudget ? "text-lime-400" : "text-red-400"} title={underBudget ? "Under budget" : "Over budget"}>
              {underBudget ? "↓" : "↑"}
            </span>
          )}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${underBudget ? "bg-lime-500/80" : "bg-amber-500/80"}`}
          style={{ width: `${Math.min(100, burnPct)}%` }}
        />
      </div>
      {isFreelancer && (
        <div className="flex gap-2 pt-1">
          <Input
            type="number"
            min={0}
            placeholder="Est. hours"
            className="h-8 rounded-lg border border-white/20 bg-white/5 text-xs text-zinc-200 w-24 placeholder:text-zinc-500"
            defaultValue={estimated || ""}
            onBlur={async (e) => {
              const v = e.target.value ? Number(e.target.value) : null;
              if (v !== null && !Number.isNaN(v))
                await updateProjectHours(projectId, v, undefined);
              setProject((p) => ({ ...p, estimated_hours: v }));
            }}
          />
          <Input
            type="number"
            min={0}
            placeholder="Actual"
            className="h-8 rounded-lg border border-white/20 bg-white/5 text-xs text-zinc-200 w-24 placeholder:text-zinc-500"
            defaultValue={actual}
            onBlur={async (e) => {
              const v = Number(e.target.value) || 0;
              await updateProjectHours(projectId, undefined, v);
              setProject((p) => ({ ...p, actual_hours: v }));
            }}
          />
        </div>
      )}
    </div>
  );
}

function FaqWidgetContent({
  isFreelancer,
  faqs,
  setFaqs,
  expandedFaqId,
  setExpandedFaqId,
  setModal,
}: ProjectWidgetProps) {
  return (
    <>
      {isFreelancer && (
        <div className="flex justify-end -mt-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-zinc-600 dark:text-zinc-400"
            onClick={() => setModal("faq")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      {faqs.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 py-4">No FAQ yet.</p>
      ) : (
        <ul className="space-y-1">
          {faqs.map((faq) => (
            <li
              key={faq.id}
              className={`rounded-lg border border-zinc-200 dark:border-zinc-800/80 overflow-hidden ${HOVER_CARD}`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-white"
                onClick={() =>
                  setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)
                }
              >
                <span className="truncate">{faq.question}</span>
                {expandedFaqId === faq.id ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                )}
              </button>
              {expandedFaqId === faq.id && (
                <div className="border-t border-zinc-200 dark:border-zinc-800/80 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/50">
                  {faq.answer}
                </div>
              )}
              {isFreelancer && expandedFaqId === faq.id && (
                <div className="border-t border-zinc-200 dark:border-zinc-800/80 px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded h-7 text-xs text-red-400 hover:text-red-300"
                    onClick={async () => {
                      await deleteFaq(faq.id);
                      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
                      setExpandedFaqId(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ScratchpadWidgetContent({
  projectId,
  internalNotes,
  setInternalNotes,
}: ProjectWidgetProps) {
  const [prompt] = useState("Calculate optimal dimensions for 8 guests & wood grain match suggestions.");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          className="rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/25 hover:opacity-90 transition-opacity"
        >
          GENERATE
        </Button>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {prompt}
      </p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 w-14 rounded-lg border border-[#6366f1]/30 bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 flex items-center justify-center"
            aria-hidden
          >
            <div className="h-6 w-6 rounded border border-[#6366f1]/50 bg-transparent" style={{ transform: `rotate(${i * 15}deg)` }} />
          </div>
        ))}
      </div>
      <textarea
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 resize-none focus:border-[#6366f1]/30 focus:outline-none"
        placeholder="Quick thoughts, reminders…"
        value={internalNotes}
        onChange={(e) => setInternalNotes(e.target.value)}
        onBlur={async () => await saveInternalNote(projectId, internalNotes)}
      />
    </div>
  );
}

export type ProjectWidgetPropsWithSetProject = ProjectWidgetProps & {
  setProject: React.Dispatch<React.SetStateAction<Project>>;
};

export function renderWidgetContent(
  widgetId: WidgetId,
  props: ProjectWidgetPropsWithSetProject
): React.ReactNode {
  switch (widgetId) {
    case "milestones":
      return <MilestonesWidgetContent {...props} />;
    case "contact_history":
      return <ContactHistoryWidgetContent {...props} />;
    case "documents":
      return <DocumentsWidgetContent {...props} />;
    case "decisions":
      return <DecisionsWidgetContent {...props} />;
    case "meetings":
      return <MeetingsWidgetContent {...props} />;
    case "budget_clarity":
      return <BudgetClarityWidgetContent {...props} />;
    case "faq":
      return <FaqWidgetContent {...props} />;
    case "scratchpad":
      return <ScratchpadWidgetContent {...props} />;
    default:
      return null;
  }
}
