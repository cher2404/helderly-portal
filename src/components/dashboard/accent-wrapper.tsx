"use client";

export function AccentWrapper({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor?: string | null;
}) {
  const color = accentColor || "#3b82f6";
  return (
    <div style={{ ["--primary-accent" as string]: color }} className="min-h-screen">
      {children}
    </div>
  );
}
