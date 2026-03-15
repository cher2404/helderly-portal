"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import type { ThemePreference } from "@/lib/database.types";

export function ThemeSync({ theme }: { theme: ThemePreference | null }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    if (theme && theme !== "system") setTheme(theme);
  }, [theme, setTheme]);
  return null;
}
