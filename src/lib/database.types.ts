export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client";
export type ProjectStatus = "active" | "completed" | "on_hold" | "draft";
export type AssetStatus = "pending" | "approved" | "needs_changes";

export type SubscriptionStatus = "free" | "trial" | "active";

export type ThemePreference = "light" | "dark" | "system";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  accent_color: string | null;
  theme: ThemePreference | null;
  trial_starts_at: string | null;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  business_name: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectHealthStatus = "on_track" | "needs_attention" | "blocked";

export interface WidgetLayoutItem {
  id: string;
  visible: boolean;
  position: number;
}

export interface ProjectLayoutConfig {
  widgets: WidgetLayoutItem[];
}

export interface Project {
  id: string;
  name: string;
  slug: string | null;
  status: ProjectStatus;
  progress_percentage: number;
  client_id: string | null;
  owner_id: string;
  deadline: string | null;
  client_email: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  health_status: ProjectHealthStatus | null;
  layout_config: ProjectLayoutConfig | null;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  decision_date: string;
  rationale: string | null;
  confirmed_by_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectFaq {
  id: string;
  project_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InternalNote {
  id: string;
  project_id: string;
  owner_id: string;
  content: string;
  updated_at: string;
}

export type StageStatus = "blocked" | "in_progress" | "done";

export type MilestoneStatus = "active" | "pending_approval";

export interface ProjectStage {
  id: string;
  project_id: string;
  title: string;
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  stage_status: StageStatus | null;
  created_by: string | null;
  status: MilestoneStatus;
  created_at: string;
}

export type AppointmentStatus = "upcoming" | "completed";

export interface Appointment {
  id: string;
  project_id: string;
  title: string;
  appointment_date: string;
  appointment_time: string | null;
  location: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactLog {
  id: string;
  project_id: string;
  user_id: string;
  log_date: string;
  channel: string;
  summary: string;
  created_at: string;
}

export interface ProjectMessage {
  id: string;
  project_id: string;
  user_id: string;
  asset_id: string | null;
  message: string;
  created_at: string;
}

export interface Asset {
  id: string;
  project_id: string;
  file_name: string;
  file_path?: string | null;
  file_url: string;
  status: AssetStatus;
  created_at: string;
}

export interface Template {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface TemplateStage {
  id: string;
  template_id: string;
  title: string;
  sort_order: number;
}

export interface TemplateFaq {
  id: string;
  template_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface IntakeSubmission {
  id: string;
  freelancer_id: string;
  name: string;
  email: string;
  description: string;
  budget: string | null;
  timeline: string | null;
  status: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      intake_submissions: {
        Row: IntakeSubmission;
        Insert: Omit<IntakeSubmission, "id" | "created_at" | "status"> & { id?: string; created_at?: string; status?: string };
        Update: Partial<IntakeSubmission>;
      };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at"> & { created_at?: string }; Update: Partial<Notification> };
      profiles: { Row: Profile; Insert: Omit<Profile, "id" | "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Profile> };
      projects: { Row: Project; Insert: Omit<Project, "id" | "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Project> };
      assets: { Row: Asset; Insert: Omit<Asset, "id" | "created_at"> & { created_at?: string }; Update: Partial<Asset> };
      project_stages: { Row: ProjectStage; Insert: Omit<ProjectStage, "id" | "created_at"> & { created_at?: string }; Update: Partial<ProjectStage> };
      project_messages: { Row: ProjectMessage; Insert: Omit<ProjectMessage, "id" | "created_at"> & { created_at?: string }; Update: Partial<ProjectMessage> };
      appointments: { Row: Appointment; Insert: Omit<Appointment, "id" | "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Appointment> };
      contact_logs: { Row: ContactLog; Insert: Omit<ContactLog, "id" | "created_at"> & { created_at?: string }; Update: Partial<ContactLog> };
      decisions: { Row: Decision; Insert: Omit<Decision, "id" | "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<Decision> };
      project_faqs: { Row: ProjectFaq; Insert: Omit<ProjectFaq, "id" | "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }; Update: Partial<ProjectFaq> };
      internal_notes: { Row: InternalNote; Insert: Omit<InternalNote, "id" | "updated_at"> & { updated_at?: string }; Update: Partial<InternalNote> };
      templates: { Row: Template; Insert: Omit<Template, "id" | "created_at"> & { created_at?: string }; Update: Partial<Template> };
      template_stages: { Row: TemplateStage; Insert: Omit<TemplateStage, "id">; Update: Partial<TemplateStage> };
      template_faqs: { Row: TemplateFaq; Insert: Omit<TemplateFaq, "id">; Update: Partial<TemplateFaq> };
    };
  };
}
