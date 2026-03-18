export function LoadingIcon({ label = "Laden..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8 justify-center">
      <div className="animate-helderly-bars flex flex-col gap-1.5 w-8 h-8 bg-[var(--primary-accent)] rounded-[8px] justify-center px-2">
        <span className="bar-1 block h-[3px] w-full bg-white rounded-full" />
        <span
          className="bar-2 block h-[3px] bg-white rounded-full"
          style={{ width: "68%", opacity: 0.65 }}
        />
        <span
          className="bar-3 block h-[3px] bg-white rounded-full"
          style={{ width: "83%", opacity: 0.35 }}
        />
      </div>
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

