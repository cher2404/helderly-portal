"use client";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { Profile, Project } from "@/lib/database.types";

type Props = { profile: Profile; projects: Project[] };

export function OnboardingChecklist({ profile, projects }: Props) {
  const steps = [
    { label: "Account aangemaakt", done: true },
    { label: "Inloglink instellen", done: !!profile.slug, href: ROUTES.settings },
    {
      label: "Eerste klant uitnodigen",
      done: projects.some((p) => !!p.client_email),
      href: "#create-project",
    },
  ];

  if (steps.every((s) => s.done)) return null;

  return (
    <div className="rounded-[12px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-4 py-3">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Aan de slag</p>
      <div className="flex flex-col gap-1.5">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2 text-sm">
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 text-[var(--primary-accent)] shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-zinc-400 shrink-0" />
            )}
            {step.href && !step.done ? (
              <Link href={step.href} className="text-[var(--primary-accent)] hover:underline">
                {step.label}
              </Link>
            ) : (
              <span
                className={
                  step.done ? "text-zinc-400 line-through" : "text-zinc-700 dark:text-zinc-300"
                }
              >
                {step.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

