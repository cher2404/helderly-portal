"use client";

import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import type { Profile } from "@/lib/database.types";
import type { ThemePreference } from "@/lib/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { CreditCard, ExternalLink, Sun, Moon, Monitor } from "lucide-react";
import { updateProfileAccent, updateProfileLogo, updateProfileTheme } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/client";

type Props = { profile: Profile };

const THEMES: { value: ThemePreference; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function SettingsClient({ profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [accentSaving, setAccentSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.logo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setTheme } = useTheme();
  const isFreelancer = profile.role === "admin";

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? "Failed to open portal");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  async function saveAccent(hex: string) {
    setAccentSaving(true);
    const r = await updateProfileAccent(hex);
    setAccentSaving(false);
    if (r.error) console.error(r.error);
  }

  function handleAccentColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    saveAccent(e.target.value);
  }

  async function handleThemeSelect(value: ThemePreference) {
    setThemeSaving(true);
    setTheme(value);
    const r = await updateProfileTheme(value);
    setThemeSaving(false);
    if (r.error) console.error(r.error);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !isFreelancer) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (uploadError) {
      console.error(uploadError);
      return;
    }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const r = await updateProfileLogo(urlData.publicUrl);
    if (r.error) console.error(r.error);
  }

  function removeLogo() {
    setLogoPreview(null);
    setLogoFile(null);
    updateProfileLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isPro = profile.subscription_status === "active";
  const currentTheme = (profile.theme ?? "system") as ThemePreference;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Account, branding, and billing</p>
      </div>

      {isFreelancer && (
        <Card className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Branding
            </CardTitle>
            <CardDescription>
              Logo and accent color used in the sidebar and across the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            <div>
              <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Logo</Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-2">Shown at the top of the sidebar.</p>
              {logoPreview && (
                <div className="flex items-center gap-3 mb-2">
                  <img src={logoPreview} alt="Logo" className="h-10 max-w-[160px] object-contain" />
                  <Button variant="ghost" size="sm" onClick={removeLogo} className="text-red-500 hover:text-red-400 text-xs">
                    Remove
                  </Button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg border-zinc-200 dark:border-zinc-700">
                {logoPreview ? "Replace logo" : "Upload logo"}
              </Button>
            </div>
            <div>
              <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Accent color</Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-2">Primary buttons, progress bars, and active states.</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  defaultValue={profile.accent_color ?? "#3b82f6"}
                  onChange={handleAccentColorChange}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent"
                />
                <Input
                  type="text"
                  defaultValue={profile.accent_color ?? "#3b82f6"}
                  onBlur={(e) => saveAccent(e.target.value)}
                  className="w-28 font-mono text-sm rounded-lg border-zinc-200 dark:border-zinc-700"
                />
              </div>
              {accentSaving && <span className="text-xs text-zinc-500 ml-2">Saving…</span>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-50">Appearance</CardTitle>
          <CardDescription>Light or dark mode.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={currentTheme === value ? "default" : "outline"}
              size="sm"
              onClick={() => handleThemeSelect(value)}
              disabled={themeSaving}
              className={currentTheme === value ? "bg-[var(--primary-accent)] hover:bg-[var(--primary-accent)]/90" : ""}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            {isPro
              ? "You're on the Pro plan. Manage your subscription or payment method below."
              : "Upgrade to Pro for large file uploads and full access."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isPro
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}
          >
            {isPro ? "Pro" : "Free"}
          </span>
          <Button
            onClick={openPortal}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? "Opening…" : "Manage Subscription"}
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
          {!isPro && (
            <Button asChild size="sm" className="bg-[var(--primary-accent)] hover:bg-[var(--primary-accent)]/90">
              <Link href={ROUTES.pricing}>Upgrade to Pro</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
