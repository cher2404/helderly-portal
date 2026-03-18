"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LayoutTemplate } from "lucide-react";
import { createProject } from "@/app/actions/projects";
import type { Template } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type Props = { templates?: Template[] };

export function ProjectBuilderForm({ templates = [] }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="rounded-2xl border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <Plus className="h-5 w-5" />
          New project
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Create a project and invite your client by email. Add a deadline or start from a template.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            const formData = new FormData(formEl);
            setError(null);
            setSuccess(false);
            if (templateId) formData.set("template_id", templateId);
            startTransition(async () => {
              const result = await createProject(formData);
              if (result.error) {
                setError(result.error);
                return;
              }
              setSuccess(true);
              setTemplateId("");
              formEl.reset();
            });
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {templates.length > 0 && (
            <div className="space-y-2 sm:col-span-2 lg:col-span-4">
              <Label htmlFor="template_id" className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <LayoutTemplate className="h-4 w-4" />
                Start from template
              </Label>
              <select
                id="template_id"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              >
                <option value="">No template (default stages)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {templateId && <input type="hidden" name="template_id" value={templateId} readOnly />}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Website redesign"
              required
              className="rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.04]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_email">Client email</Label>
            <Input
              id="client_email"
              name="client_email"
              type="email"
              placeholder="client@example.com"
              className="rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.04]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              className="rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.04]"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full rounded-xl bg-[var(--primary-accent)] hover:opacity-90",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              {isPending ? "Bezig..." : "Create project"}
            </Button>
          </div>
        </form>
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="mt-3 text-sm text-emerald-500">Project created. Add more from Timeline & Documents.</p>
        )}
      </CardContent>
    </Card>
  );
}
