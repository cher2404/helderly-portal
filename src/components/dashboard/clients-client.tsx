"use client";

import Link from "next/link";
import { Mail, FolderOpen } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import {
  LinearCard,
  LinearCardHeader,
  LinearCardTitle,
  LinearCardDescription,
  LinearCardContent,
} from "@/components/ui/linear-card";

type Client = { id: string; email: string; projectName: string; projectId: string };

type Props = { clients: Client[] };

export function ClientsClient({ clients }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Clients
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Customer CRM — view and open projects by client.
        </p>
      </div>
      <LinearCard>
        <LinearCardHeader>
          <LinearCardTitle>Clients & projects</LinearCardTitle>
          <LinearCardDescription>People invited to your projects.</LinearCardDescription>
        </LinearCardHeader>
        <LinearCardContent>
          {clients.length === 0 ? (
            <p className="text-sm text-zinc-500 py-6">No clients yet. Add a client email when creating a project.</p>
          ) : (
            <ul className="space-y-2">
              {clients.map((c) => (
                <li
                  key={`${c.projectId}-${c.email}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 px-3 py-2.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">{c.email}</span>
                    <span className="text-xs text-zinc-500">· {c.projectName}</span>
                  </div>
                  <Link
                    href={ROUTES.project(c.projectId)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary-accent)] hover:underline"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Open project
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </LinearCardContent>
      </LinearCard>
    </div>
  );
}
