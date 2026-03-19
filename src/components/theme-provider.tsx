"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

type Props = {
  children: React.ReactNode;
  accentColor?: string | null;
};

export function ThemeProvider({ children, accentColor }: Props) {
  const color = accentColor || "#6366f1";
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div style={{ ["--primary-accent" as string]: color }} className="min-h-screen">
        {children}
      </div>
    </NextThemesProvider>
  );
}
