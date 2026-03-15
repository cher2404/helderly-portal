"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };

export class ErrorBoundary extends React.Component<
  Props,
  { hasError: boolean; error?: Error }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </p>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Try refreshing the page. If it keeps happening, report the issue.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
