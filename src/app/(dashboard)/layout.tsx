import { getProfile, getProjects, getNotifications, getUnreadNotificationCount } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccentWrapper } from "@/components/dashboard/accent-wrapper";
import { ThemeSync } from "@/components/dashboard/theme-sync";
import { BreadcrumbProvider } from "@/contexts/breadcrumb-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const [projects, notifications, unreadCount] = await Promise.all([
    profile.role === "admin" ? getProjects() : [],
    getNotifications(30),
    getUnreadNotificationCount(),
  ]);

  return (
    <AccentWrapper accentColor={profile.accent_color}>
      <ThemeSync theme={profile.theme} />
      <div className="premium-dashboard min-h-screen font-sans antialiased">
        <Toaster />
        <BreadcrumbProvider>
          <ErrorBoundary>
            <DashboardShell
            profile={profile}
            initialProjects={projects}
            initialNotifications={notifications}
            unreadNotificationCount={unreadCount}
          >
            {children}
            </DashboardShell>
          </ErrorBoundary>
        </BreadcrumbProvider>
      </div>
    </AccentWrapper>
  );
}
