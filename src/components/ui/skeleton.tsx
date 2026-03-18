import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[12px] bg-zinc-100 dark:bg-zinc-800", className)} />;
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-12 ${i === rows - 1 ? "w-3/4" : "w-full"}`} />
      ))}
    </div>
  );
}

