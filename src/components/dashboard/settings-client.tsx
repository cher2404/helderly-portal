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
import { CreditCard, ExternalLink, Sun, Moon, Monitor, Copy, Check, Download, Trash2 } from "lucide-react";
import { updateProfileAccent, updateProfileLogo, updateProfileTheme, updateProfileBusinessAndSlug } from "@/app/actions/profile";
import { exportMyData, deleteAccount } from "@/app/actions/account";
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
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.logo_url);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const businessNameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const { setTheme } = useTheme();
  const isFreelancer = profile.role === "admin";
  const appUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? "https://helderly.io");
  const clientLoginUrl = profile.slug ? `${appUrl}/${profile.slug}` : null;

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
    setTheme(value);
    void updateProfileTheme(value);
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

  async function saveBusinessAndSlug() {
    const businessName = businessNameRef.current?.value?.trim() ?? "";
    const slug = slugRef.current?.value?.trim() ?? "";
    setBusinessError(null);
    setBusinessSaving(true);
    const r = await updateProfileBusinessAndSlug(businessName || null, slug || null);
    setBusinessSaving(false);
    if (r.error) setBusinessError(r.error);
  }

  function copyClientLoginUrl() {
    if (!clientLoginUrl) return;
    navigator.clipboard.writeText(clientLoginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    const result = await exportMyData();
    setExporting(false);
    if ("error" in result) {
      setExportError(result.error);
      return;
    }
    const blob = new Blob([result.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helderly-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    setDeleteLoading(true);
    const result = await deleteAccount();
    setDeleteLoading(false);
    if ("error" in result) {
      setDeleteError(result.error);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = ROUTES.home;
  }

  const isPro = profile.subscription_status === "active";
  const currentTheme = (profile.theme ?? "system") as ThemePreference;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Instellingen
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Beheer je profiel, inloglink en thema.
        </p>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {isFreelancer && (
        <Card className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
          <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Inlogpagina voor klanten
            </CardTitle>
            <CardDescription>
              Geef je bedrijfsnaam en een unieke URL. Deel de inloglink met je klanten; zij loggen dan direct bij jou in (bijv. helderly.io/fotografiestudiomaan).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Bedrijfsnaam</Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-1">Toont &quot;Log in bij [naam]&quot; op de inlogpagina.</p>
              <Input
                ref={businessNameRef}
                type="text"
                defaultValue={profile.business_name ?? ""}
                onBlur={saveBusinessAndSlug}
                placeholder="bijv. Fotografie Studio Maan"
                className="rounded-lg border-zinc-200 dark:border-zinc-700"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Inlog-URL (slug)</Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-1">Alleen kleine letters en cijfers, geen spaties (bijv. fotografiestudiomaan).</p>
              <Input
                ref={slugRef}
                type="text"
                defaultValue={profile.slug ?? ""}
                onBlur={saveBusinessAndSlug}
                placeholder="fotografiestudiomaan"
                className="rounded-lg border-zinc-200 dark:border-zinc-700 font-mono text-sm"
              />
            </div>
            {businessError && <p className="text-sm text-red-500">{businessError}</p>}
            {clientLoginUrl && (
              <>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Deel deze link met je klanten; zij loggen dan direct bij jou in.</p>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2">
                  <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300" title={clientLoginUrl}>
                    {clientLoginUrl}
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyClientLoginUrl} className="shrink-0">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            )}
            {businessSaving && <span className="text-xs text-zinc-500">Opslaan…</span>}
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
              : "Upgrade naar Pro voor grote uploads en volledige toegang."}
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
              <Link href={ROUTES.pricing}>Upgraden naar Pro</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-50">Gegevens en account</CardTitle>
          <CardDescription>
            Exporteer je gegevens (AVG) of verwijder je account definitief.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Download een kopie van je profiel en projectgegevens als JSON.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg border-zinc-200 dark:border-zinc-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Bezig…" : "Exporteer mijn data"}
            </Button>
            {exportError && <p className="text-sm text-red-500 mt-2">{exportError}</p>}
          </div>
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Verwijder je account en alle bijbehorende gegevens. Je abonnement wordt opgezegd. Dit kan niet ongedaan worden gemaakt.
            </p>
            {!deleteConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(true)}
                className="rounded-lg border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Account verwijderen
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="rounded-lg"
                >
                  {deleteLoading ? "Bezig…" : "Ja, definitief verwijderen"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                  disabled={deleteLoading}
                  className="rounded-lg"
                >
                  Annuleren
                </Button>
              </div>
            )}
            {deleteError && <p className="text-sm text-red-500 mt-2">{deleteError}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
