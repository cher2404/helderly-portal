"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LayoutGroup, motion } from "framer-motion";
import {
  Phone,
  Plus,
  ChevronLeft,
  Gavel,
  LayoutTemplate,
  LayoutGrid,
  RotateCcw,
  LayoutPanelLeft,
  Box,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassModal } from "@/components/ui/glass-modal";
import { ROUTES, projectSegment } from "@/lib/constants";
import { useBreadcrumbProjectName } from "@/contexts/breadcrumb-context";
import {
  createAppointment,
  addContactLog,
  createDecision,
  createFaq,
  updateProjectHealth,
  createTemplateFromProject,
} from "@/app/actions/projects";
import type {
  Project,
  ProjectStage,
  Appointment,
  ContactLog,
  Asset,
  Profile,
  Decision,
  ProjectFaq,
  InternalNote,
} from "@/lib/database.types";
import type { ProjectHealthStatus } from "@/lib/database.types";
import { ProjectLayoutProvider, useProjectLayout } from "./project-layout-provider";
import { ProjectPageTabs, getProjectTab } from "./project-page-tabs";
import { ProjectDashboardKpi } from "./project-dashboard-kpi";
import { SortableDashboardWidget, renderWidgetContent, type ProjectWidgetPropsWithSetProject } from "./project-dashboard-widgets";
import { WidgetGallery } from "./widget-gallery";
import { WIDGET_META, type WidgetId } from "@/lib/project-widgets";
import { usePreviewMode } from "@/contexts/preview-mode-context";

type Props = {
  project: Project;
  initialStages: ProjectStage[];
  initialAppointments: Appointment[];
  initialContactLogs: ContactLog[];
  initialAssets: Asset[];
  initialDecisions: Decision[];
  initialFaqs: ProjectFaq[];
  initialInternalNotes: InternalNote | null;
  profile: Profile;
};

export function ProjectDetailView({
  project: initialProject,
  initialStages,
  initialAppointments,
  initialContactLogs,
  initialAssets,
  initialDecisions,
  initialFaqs,
  initialInternalNotes,
  profile,
}: Props) {
  const [project, setProject] = useState(initialProject);
  const { setProjectName } = useBreadcrumbProjectName();
  useEffect(() => {
    setProjectName(initialProject.name);
    return () => setProjectName(null);
  }, [initialProject.name, setProjectName]);
  const [stages, setStages] = useState(initialStages);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [contactLogs, setContactLogs] = useState(initialContactLogs);
  const [assets] = useState(initialAssets);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [internalNotes, setInternalNotes] = useState(initialInternalNotes?.content ?? "");
  const [modal, setModal] = useState<"meeting" | "contact" | "decision" | "faq" | "template" | "invite" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");

  const supabase = useMemo(() => createClient(), []);
  const isFreelancer = profile.role === "admin";
  const searchParams = useSearchParams();
  const projectTab = getProjectTab(searchParams);

  const closeModal = useCallback(() => {
    setModal(null);
    setError(null);
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel(`project-${initialProject.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `project_id=eq.${initialProject.id}` }, () => {
        supabase.from("appointments").select("*").eq("project_id", initialProject.id).order("appointment_date", { ascending: true }).then(({ data }) => data && setAppointments(data as Appointment[]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_logs", filter: `project_id=eq.${initialProject.id}` }, () => {
        supabase.from("contact_logs").select("*").eq("project_id", initialProject.id).order("log_date", { ascending: false }).then(({ data }) => data && setContactLogs(data as ContactLog[]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "project_stages", filter: `project_id=eq.${initialProject.id}` }, () => {
        supabase.from("project_stages").select("*").eq("project_id", initialProject.id).order("sort_order", { ascending: true }).then(({ data }) => data && setStages(data as ProjectStage[]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "decisions", filter: `project_id=eq.${initialProject.id}` }, () => {
        supabase.from("decisions").select("*").eq("project_id", initialProject.id).order("decision_date", { ascending: false }).then(({ data }) => data && setDecisions(data as Decision[]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "project_faqs", filter: `project_id=eq.${initialProject.id}` }, () => {
        supabase.from("project_faqs").select("*").eq("project_id", initialProject.id).order("sort_order", { ascending: true }).then(({ data }) => data && setFaqs(data as ProjectFaq[]));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: `id=eq.${initialProject.id}` }, () => {
        supabase.from("projects").select("*").eq("id", initialProject.id).single().then(({ data }) => data && setProject(data as Project));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [initialProject.id, supabase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        if (isFreelancer && !modal) setModal("meeting");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFreelancer, modal]);

  return (
    <ProjectLayoutProvider
      projectId={initialProject.id}
      initialLayoutConfig={project.layout_config ?? null}
      isFreelancer={isFreelancer}
    >
      <ProjectPageTabs projectSegment={projectSegment(project)} projectId={project.id} isFreelancer={isFreelancer} />
      <ProjectDetailContent
        initialProject={initialProject}
        project={project}
        setProject={setProject}
        stages={stages}
        setStages={setStages}
        appointments={appointments}
        setAppointments={setAppointments}
        contactLogs={contactLogs}
        assets={assets}
        decisions={decisions}
        setDecisions={setDecisions}
        faqs={faqs}
        setFaqs={setFaqs}
        internalNotes={internalNotes}
        setInternalNotes={setInternalNotes}
        modal={modal}
        setModal={setModal}
        error={error}
        setError={setError}
        expandedFaqId={expandedFaqId}
        setExpandedFaqId={setExpandedFaqId}
        templateName={templateName}
        setTemplateName={setTemplateName}
        isFreelancer={isFreelancer}
        closeModal={closeModal}
        projectTab={projectTab}
      />
    </ProjectLayoutProvider>
  );
}

function ProjectDetailContent({
  initialProject,
  project,
  setProject,
  stages,
  setStages,
  appointments,
  setAppointments,
  contactLogs,
  assets,
  decisions,
  setDecisions,
  faqs,
  setFaqs,
  internalNotes,
  setInternalNotes,
  modal,
  setModal,
  error,
  setError,
  expandedFaqId,
  setExpandedFaqId,
  templateName,
  setTemplateName,
  isFreelancer,
  closeModal,
  projectTab,
}: {
  initialProject: Project;
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
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
  internalNotes: string;
  setInternalNotes: React.Dispatch<React.SetStateAction<string>>;
  modal: "meeting" | "contact" | "decision" | "faq" | "template" | "invite" | null;
  setModal: (m: "meeting" | "contact" | "decision" | "faq" | "template" | "invite" | null) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  expandedFaqId: string | null;
  setExpandedFaqId: React.Dispatch<React.SetStateAction<string | null>>;
  templateName: string;
  setTemplateName: React.Dispatch<React.SetStateAction<string>>;
  isFreelancer: boolean;
  closeModal: () => void;
  projectTab: string;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const tabToWidgetId: Record<string, WidgetId> = {
    milestones: "milestones",
    decisions: "decisions",
    meetings: "meetings",
    budget: "budget_clarity",
    faq: "faq",
    contact: "contact_history",
    scratchpad: "scratchpad",
  };
  const widgetIdForTab = tabToWidgetId[projectTab];
  const isDashboardView = projectTab === "dashboard";
  const isSingleWidgetView = widgetIdForTab != null;
  const {
    editMode,
    setEditMode,
    visibleWidgets,
    moveWidget,
    saveLayout,
    resetLayout,
    hiddenWidgetIds,
    isSaving,
  } = useProjectLayout();
  const { isPreviewMode, togglePreviewMode } = usePreviewMode();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const visibleWidgetsFiltered = useMemo(
    () =>
      isPreviewMode
        ? visibleWidgets.filter((w) => w.id !== "scratchpad" && w.id !== "budget_clarity")
        : visibleWidgets,
    [isPreviewMode, visibleWidgets]
  );

  const effectiveEditMode = editMode && !isPreviewMode;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isPreviewMode) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
      const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      moveWidget(oldIndex, newIndex);
      setTimeout(() => saveLayout(), 0);
    },
    [isPreviewMode, visibleWidgets, moveWidget, saveLayout]
  );

  const widgetProps: ProjectWidgetPropsWithSetProject = useMemo(
    () => ({
      projectId: initialProject.id,
      project,
      setProject,
      isFreelancer,
      stages,
      setStages,
      appointments,
      setAppointments,
      contactLogs,
      assets,
      decisions,
      setDecisions,
      faqs,
      setFaqs,
      expandedFaqId,
      setExpandedFaqId,
      internalNotes,
      setInternalNotes,
      setModal: (m) => setModal(m),
    }),
    [
      initialProject.id,
      project,
      setProject,
      isFreelancer,
      stages,
      setStages,
      appointments,
      setAppointments,
      contactLogs,
      assets,
      decisions,
      setDecisions,
      faqs,
      setFaqs,
      expandedFaqId,
      setExpandedFaqId,
      internalNotes,
      setInternalNotes,
      setModal,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Header — premium top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
            <Link
            href={ROUTES.dashboard}
            className="rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-500/10 p-2 text-zinc-500 dark:text-zinc-400 transition-colors hover:border-[var(--primary-accent)]/25 hover:text-[var(--primary-accent)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-950/20 text-amber-300/90">
            <Box className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-100 truncate">
                {project.name}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {project.status} · {project.progress_percentage}%
              </p>
            </div>
            {(project.health_status ?? "on_track") === "on_track" ? (
              <span className="status-pill-lime shrink-0 rounded-full px-2.5 py-1 text-xs font-medium">
                Op schema
              </span>
            ) : isFreelancer ? (
              <select
                className="shrink-0 rounded-lg border border-slate-500/20 bg-slate-500/10 text-xs text-slate-200 py-1.5 px-2 focus:border-sky-400/40 focus:outline-none"
                value={project.health_status ?? "on_track"}
                onChange={async (e) => {
                  const v = e.target.value as ProjectHealthStatus;
                  await updateProjectHealth(initialProject.id, v);
                  setProject((p) => ({ ...p, health_status: v }));
                }}
              >
                <option value="on_track">Op schema</option>
                <option value="needs_attention">Aandacht nodig</option>
                <option value="blocked">Geblokkeerd</option>
              </select>
            ) : null}
          </div>
        </div>

        {isFreelancer && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isPreviewMode ? "secondary" : "outline"}
              size="sm"
              className="rounded-xl border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-200 hover:bg-[var(--primary-accent)]/15 hover:border-[var(--primary-accent)]/25 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={togglePreviewMode}
              aria-label={isPreviewMode ? "Sluit klantweergave" : "Open klantweergave"}
            >
              {isPreviewMode ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
              {isPreviewMode ? "Sluit preview" : "Klantweergave"}
            </Button>
            {project.client_email && !isPreviewMode && (
              <a
                href={`mailto:${project.client_email}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-500/20 bg-slate-500/10 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-[var(--primary-accent)]/15 hover:border-[var(--primary-accent)]/25 hover:text-slate-100 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                E-mail klant
              </a>
            )}
            {!isPreviewMode && !isDashboardView && !isSingleWidgetView && (
              <Button
                variant={effectiveEditMode ? "secondary" : "outline"}
                size="sm"
                className="rounded-xl border-slate-500/20 bg-slate-500/10 text-slate-200 hover:bg-sky-500/15 hover:border-sky-400/25 hover:text-sky-100"
                onClick={() => setEditMode(!editMode)}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                Bewerk indeling
              </Button>
            )}
            {effectiveEditMode && !isDashboardView && !isSingleWidgetView && (
              <>
                <Button variant="outline" size="sm" className="rounded-[12px]" onClick={resetLayout}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Herstel indeling
                </Button>
                <Button variant="outline" size="sm" className="rounded-[12px]" onClick={() => saveLayout()} disabled={isSaving}>
                  {isSaving ? "Opslaan…" : "Indeling opslaan"}
                </Button>
                {hiddenWidgetIds.length > 0 && (
                  <Button variant="outline" size="sm" className="rounded-[12px]" onClick={() => setGalleryOpen(true)}>
                    <LayoutPanelLeft className="h-3.5 w-3.5 mr-1.5" />
                    Widget toevoegen
                  </Button>
                )}
              </>
            )}
            {!isPreviewMode && (
              <>
                {projectTab === "contact" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/20 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-100 [&_svg]:drop-shadow-[0_0_6px_rgba(96,165,250,0.3)]"
                    onClick={() => {
                      setModal("contact");
                      setError(null);
                    }}
                  >
                    <Phone className="h-3.5 w-3.5 mr-1.5" />
                    Gesprek loggen
                  </Button>
                )}
                {projectTab === "meetings" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/20 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-100 [&_svg]:drop-shadow-[0_0_6px_rgba(96,165,250,0.3)]"
                    onClick={() => {
                      setModal("meeting");
                      setError(null);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Afspraak
                  </Button>
                )}
                {projectTab === "decisions" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-white/20 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-100 [&_svg]:drop-shadow-[0_0_6px_rgba(96,165,250,0.3)]"
                    onClick={() => {
                      setModal("decision");
                      setError(null);
                    }}
                  >
                    <Gavel className="h-3.5 w-3.5 mr-1.5" />
                    Beslissing
                  </Button>
                )}
                {(projectTab === "dashboard" || !projectTab) && (
                  <Link href={`${ROUTES.documents}?project=${initialProject.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-white/20 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-zinc-100 [&_svg]:drop-shadow-[0_0_6px_rgba(96,165,250,0.3)]"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Bestand uploaden
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-[12px]"
                  onClick={() => {
                    setModal("template");
                    setTemplateName(initialProject.name + " template");
                    setError(null);
                  }}
                >
                  <LayoutTemplate className="h-3.5 w-3.5 mr-1.5" />
                  Opslaan als template
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <GlassModal open={modal === "invite"} onClose={() => setModal(null)} title="Invite client" description="Send a magic link so they can sign in and view this project.">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const email = inviteEmail.trim();
            if (!email) return;
            setError(null);
            setInviteSending(true);
            try {
              const res = await fetch("/api/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: initialProject.id, email }) });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Failed to send invite");
              setModal(null);
              setInviteEmail("");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to send invite");
            } finally {
              setInviteSending(false);
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Client email</Label>
            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="client@example.com" required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="rounded-lg bg-[var(--primary-accent)] hover:opacity-90" disabled={inviteSending}>{inviteSending ? "Sending…" : "Send invite"}</Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={modal === "template"} onClose={() => setModal(null)} title="Opslaan als template" description="Hergebruik mijlpalen en FAQ voor nieuwe projecten.">
        <form onSubmit={async (e) => { e.preventDefault(); if (!templateName.trim()) return; setError(null); const r = await createTemplateFromProject(initialProject.id, templateName.trim()); if (r.error) setError(r.error); else setModal(null); }} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Template name</Label>
            <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Website project" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="rounded-lg bg-[var(--primary-accent)] hover:opacity-90">Save template</Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setModal(null)}>Cancel</Button>
          </div>
        </form>
      </GlassModal>

      {error && (
        <div className="rounded-[12px] border border-red-900/50 bg-red-950/20 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Modals */}
      <GlassModal open={modal === "meeting"} onClose={closeModal} title="New meeting" description="Schedule an appointment.">
        <form
          action={async (fd: FormData) => {
            setError(null);
            const r = await createAppointment(initialProject.id, fd);
            if (r.error) setError(r.error);
            else closeModal();
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Title</Label>
            <Input name="title" placeholder="Discovery call" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Date</Label>
            <Input name="appointment_date" type="date" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Time</Label>
            <Input name="appointment_time" type="time" />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Location / Link</Label>
            <Input name="location" placeholder="Zoom or address" />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" size="sm" className="rounded-lg">Save</Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={modal === "contact"} onClose={closeModal} title="Log contact" description="Record a call, email, or meeting.">
        <form
          action={async (fd: FormData) => {
            setError(null);
            const r = await addContactLog(initialProject.id, fd);
            if (r.error) setError(r.error);
            else closeModal();
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Date</Label>
            <Input name="log_date" type="date" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Channel</Label>
            <select name="channel" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="meeting">Afspraak</option>
            </select>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Summary</Label>
            <Input name="summary" placeholder="e.g. Discovery call" required />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" size="sm" className="rounded-lg">Save</Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={modal === "decision"} onClose={closeModal} title="Log decision" description="Record what was agreed.">
        <form
          action={async (fd: FormData) => {
            setError(null);
            const r = await createDecision(initialProject.id, fd);
            if (r.error) setError(r.error);
            else closeModal();
          }}
          className="grid gap-4"
        >
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Titel beslissing</Label>
            <Input name="title" placeholder="e.g. Brand colors approved" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Date</Label>
            <Input name="decision_date" type="date" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Rationale (optional)</Label>
            <textarea name="rationale" rows={3} placeholder="Why this decision" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="rounded-lg">Save</Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </GlassModal>

      <GlassModal open={modal === "faq"} onClose={closeModal} title="Add FAQ" description="Project-specific question and answer.">
        <form
          action={async (fd: FormData) => {
            setError(null);
            const r = await createFaq(initialProject.id, fd);
            if (r.error) setError(r.error);
            else closeModal();
          }}
          className="grid gap-4"
        >
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Question</Label>
            <Input name="question" placeholder="e.g. How to provide feedback?" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-600 dark:text-zinc-400 text-xs">Answer</Label>
            <textarea name="answer" rows={3} required placeholder="Answer" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="rounded-lg">Save</Button>
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </GlassModal>

      <WidgetGallery isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />

      {/* Dashboard: alleen KPI's; andere tabs: één invul-sectie */}
      {isDashboardView && (
        <ProjectDashboardKpi
          projectSegment={projectSegment(project)}
          projectId={project.id}
          project={project}
          stages={stages}
          appointments={appointments}
          contactLogs={contactLogs}
          assets={assets}
          decisions={decisions}
          faqs={faqs}
          isFreelancer={isFreelancer}
        />
      )}

      {isSingleWidgetView && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 overflow-hidden">
          <div className="border-b border-zinc-200 dark:border-zinc-700 px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{WIDGET_META[widgetIdForTab].label}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{WIDGET_META[widgetIdForTab].description}</p>
            </div>
            {projectTab === "contact" && isFreelancer && (
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { setModal("contact"); setError(null); }}>
                <Phone className="h-4 w-4 mr-1.5" />
                Log contact
              </Button>
            )}
          </div>
          <div className="p-4">
            {renderWidgetContent(widgetIdForTab, widgetProps)}
          </div>
        </div>
      )}

      {!isDashboardView && !isSingleWidgetView && (
        <div
          className={`relative rounded-[12px] transition-colors ${effectiveEditMode ? "min-h-[400px] bg-zinc-100 dark:bg-zinc-500/5" : ""}`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleWidgetsFiltered.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <LayoutGroup>
                <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleWidgetsFiltered.map((widget, index) => (
                    <motion.div key={widget.id} layout transition={{ type: "spring", stiffness: 350, damping: 30 }}>
                      <SortableDashboardWidget
                        widgetId={widget.id as WidgetId}
                        index={index}
                        isSortable={isFreelancer && !isPreviewMode}
                      >
                        {renderWidgetContent(widget.id as WidgetId, widgetProps)}
                      </SortableDashboardWidget>
                    </motion.div>
                  ))}
                </motion.div>
              </LayoutGroup>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
