"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addProjectMessage } from "@/app/actions/projects";
import type { Project, ProjectMessage, Profile } from "@/lib/database.types";

type Props = {
  projects: Project[];
  selectedProject: Project | null;
  initialMessages: ProjectMessage[];
  profile: Profile;
};

export function FeedbackThreadClient({
  projects,
  selectedProject,
  initialMessages,
  profile,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!selectedProject) return;
    const channel = supabase
      .channel(`messages-${selectedProject.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_messages", filter: `project_id=eq.${selectedProject.id}` },
        () => {
          supabase
            .from("project_messages")
            .select("*")
            .eq("project_id", selectedProject.id)
            .order("created_at", { ascending: true })
            .then(({ data }) => data && setMessages(data as ProjectMessage[]));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedProject?.id, selectedProject, supabase]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !newMessage.trim()) return;
    setError(null);
    setSending(true);
    const result = await addProjectMessage(selectedProject.id, newMessage.trim());
    setSending(false);
    if (result.error) setError(result.error);
    else setNewMessage("");
  }

  const isFreelancer = profile.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Feedback
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {isFreelancer ? "View client feedback and questions." : "Ask questions or leave feedback about this project."}
        </p>
      </div>

      {projects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 self-center">Project:</span>
          <select
            className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
            value={selectedProject?.id ?? ""}
            onChange={(e) => router.push(`/dashboard/messages?project=${e.target.value}`)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedProject ? (
        <Card className="rounded-2xl border-zinc-200 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.03] backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-14 w-14 text-zinc-500 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">No project selected</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-50">{selectedProject.name} — Feedback</CardTitle>
            <CardDescription>Messages about this project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-10 w-10 text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-500">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] px-4 py-3"
                  >
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">{msg.message}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Stel een vraag of geef feedback..."
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/30"
                />
                <Button type="submit" disabled={sending} className="rounded-xl">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
