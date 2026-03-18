"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Asset, Profile } from "@/lib/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, FileImage, FileSpreadsheet, Check, RotateCcw } from "lucide-react";
import { ROUTES, MAX_UPLOAD_BYTES_FREE, MAX_UPLOAD_BYTES_PRO } from "@/lib/constants";
import Link from "next/link";
import { updateAssetStatus } from "@/app/actions/projects";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/toast";
import { getSignedUrlFromAsset } from "@/lib/supabase/storage";
import { SkeletonList } from "@/components/ui/skeleton";
import { LoadingIcon } from "@/components/ui/loading-icon";

type Props = {
  initialProjects: Project[];
  profile: Profile | null;
  initialProjectId?: string | null;
};

const BUCKET = "project-assets";

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")) return FileImage;
  if (["xls", "xlsx", "csv"].includes(ext ?? "")) return FileSpreadsheet;
  return FileText;
}

export function DocumentsClient({
  initialProjects,
  profile,
  initialProjectId,
}: Props) {
  const [projects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId ?? initialProjects[0]?.id ?? null
  );
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);
  const isAdmin = profile?.role === "admin";
  const isPro = profile?.subscription_status === "active";
  const maxUploadBytes = isPro ? MAX_UPLOAD_BYTES_PRO : MAX_UPLOAD_BYTES_FREE;

  useEffect(() => {
    if (!selectedProjectId) {
      setAssets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("assets")
      .select("*")
      .eq("project_id", selectedProjectId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAssets((data as Asset[]) ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`assets-${selectedProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assets",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        () => {
          supabase
            .from("assets")
            .select("*")
            .eq("project_id", selectedProjectId)
            .order("created_at", { ascending: false })
            .then(({ data }) => setAssets((data as Asset[]) ?? []));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId, supabase]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput?.files?.length || !selectedProjectId) return;
    const file = fileInput.files[0];
    if (file.size > maxUploadBytes) {
      setUploadError(
        isPro
          ? "File is too large (max 100MB)."
          : "File too large for Free plan (max 5MB). Upgrade to Pro for up to 100MB."
      );
      return;
    }
    setUploading(true);
    try {
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const path = `${selectedProjectId}/${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) {
        setUploadError(uploadError.message);
        return;
      }
      const { error: insertError } = await supabase.from("assets").insert({
        project_id: selectedProjectId,
        file_name: file.name,
        // Store the storage object path; we generate signed URLs for actual downloads.
        file_path: path,
        file_url: path,
        status: "pending",
      });
      if (insertError) {
        setUploadError(insertError.message);
        return;
      }
      form.reset();
      // Realtime subscription will add the new asset to the list
    } finally {
      setUploading(false);
    }
  }

  async function handleClientUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput?.files?.length || !selectedProjectId) return;
    const file = fileInput.files[0];
    if (file.size > maxUploadBytes) {
      setUploadError(
        isPro
          ? "File is too large (max 100MB)."
          : "File too large for Free plan (max 5MB). Upgrade to Pro for up to 100MB."
      );
      return;
    }
    setUploading(true);
    try {
      const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const path = `${selectedProjectId}/${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (uploadError) {
        setUploadError(uploadError.message);
        return;
      }
      const { error: insertError } = await supabase.from("assets").insert({
        project_id: selectedProjectId,
        file_name: file.name,
        file_path: path,
        file_url: path,
        // Clients upload their own documents; mark them as approved so
        // they're immediately available to the freelancer.
        status: "approved",
      });
      if (insertError) {
        setUploadError(insertError.message);
        return;
      }
      form.reset();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isAdmin ? "Documenten" : "Bestanden"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {isAdmin
            ? "Upload bestanden en deel ze met je klant."
            : "Bekijk en download alle projectbestanden."}
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="rounded-2xl border-zinc-200 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.03] backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-14 w-14 text-zinc-500 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">Nog geen projecten</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 max-w-sm">
              {isAdmin
                ? "Maak eerst een project aan op de timeline. Daarna kun je hier bestanden uploaden en delen."
                : "Je hebt nog geen projecten. Je freelancer nodigt je uit wanneer er bestanden zijn om te bekijken."}
            </p>
            {isAdmin && (
              <Link href={ROUTES.timeline} className="mt-4">
                <Button size="sm" className="rounded-xl bg-[var(--primary-accent)] hover:opacity-90">
                  Naar Timeline
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedProjectId &&
            (() => {
              const project = projects.find((p) => p.id === selectedProjectId);
              return project ? (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={ROUTES.project(selectedProjectId)}
                      className="font-medium text-zinc-900 dark:text-zinc-50 hover:text-[var(--primary-accent)] transition-colors"
                    >
                      {project.name}
                    </Link>
                    <span className="text-zinc-400">·</span>
                    <span className="text-zinc-500 dark:text-zinc-400">Bestanden</span>
                  </div>
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    Alle projecten →
                  </button>
                </div>
              ) : null;
            })()}

          {projects.length > 1 && (
            <select
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="rounded-[12px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)]/30"
            >
              <option value="">Alle projecten</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {isAdmin && selectedProjectId && (
            <Card className="rounded-2xl border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">Bestand uploaden</CardTitle>
                <CardDescription>
                  Gratis: max 5MB. Pro: tot 100MB.{" "}
                  {!isPro && (
                    <Link href={ROUTES.pricing} className="text-zinc-300 hover:underline">Upgrade</Link>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Input type="file" className="cursor-pointer rounded-xl border-white/10 bg-white/[0.04]" />
                  </div>
                  <Button type="submit" disabled={uploading} className="rounded-xl bg-[var(--primary-accent)] hover:opacity-90">
                    {uploading ? "Uploaden…" : "Upload"}
                  </Button>
                </form>
                {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}
              </CardContent>
            </Card>
          )}

          {!isAdmin && selectedProjectId && (
            <Card className="rounded-2xl border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">Bestand uploaden</CardTitle>
                <CardDescription>Upload jouw documenten voor dit project.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClientUpload} className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Input type="file" className="cursor-pointer rounded-xl border-white/10 bg-white/[0.04]" />
                  </div>
                  <Button type="submit" disabled={uploading} className="rounded-xl bg-[var(--primary-accent)] hover:opacity-90">
                    {uploading ? "Uploaden…" : "Upload"}
                  </Button>
                </form>
                {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-zinc-900 dark:text-zinc-50">Bestanden</CardTitle>
              <CardDescription>Klik om te openen of te downloaden. Gebruik Goedkeuren of Revisie aanvragen om feedback te geven.</CardDescription>
            </CardHeader>
            <CardContent>
            {loading ? (
              <>
                <LoadingIcon label="Bestanden laden..." />
                <SkeletonList rows={3} />
              </>
            ) : assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-zinc-500 dark:text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Nog geen bestanden in dit project.</p>
                  {isAdmin && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Upload hierboven een bestand om te delen met je klant.</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {assets.map((asset) => {
                    const Icon = getFileIcon(asset.file_name);
                    const isApproved = asset.status === "approved";
                    const needsAction = asset.status === "pending" || asset.status === "needs_changes";
                    return (
                      <div
                        key={asset.id}
                        className={cn(
                          "group flex flex-col items-center rounded-xl border p-4 transition-all",
                          isApproved
                            ? "border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                            : "border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] hover:border-zinc-300 dark:hover:border-white/[0.1]"
                        )}
                      >
                        <a
                          href="#"
                          onClick={async (ev) => {
                            ev.preventDefault();
                            const signedUrl = await getSignedUrlFromAsset(asset);
                            if (!signedUrl) {
                              showToast("Kon bestand niet openen", "error");
                              return;
                            }
                            window.open(signedUrl, "_blank", "noopener,noreferrer");
                          }}
                          className="flex flex-col items-center flex-1 w-full min-w-0"
                        >
                          <div className={cn("rounded-xl p-4 mb-2", isApproved ? "bg-emerald-500/10" : "bg-zinc-200/50 dark:bg-white/[0.06]")}>
                            <Icon className={cn("h-8 w-8", isApproved ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400")} />
                          </div>
                          <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate w-full text-center">{asset.file_name}</span>
                          {isApproved && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              <Check className="h-3.5 w-3.5" /> Approved
                            </span>
                          )}
                          {asset.status === "needs_changes" && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Needs changes</span>
                          )}
                          {asset.status === "pending" && isAdmin && <span className="text-xs text-zinc-500 mt-0.5">In afwachting</span>}
                          <Download className="h-4 w-4 text-zinc-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        {!isAdmin && needsAction && (
                          <div className="flex items-center gap-2 mt-3 w-full justify-center">
                            <Button
                              size="sm"
                              className="rounded-lg bg-[var(--primary-accent)] hover:opacity-90 text-white text-xs"
                              onClick={async () => {
                                const result = await updateAssetStatus(asset.id, "approved");
                                if (result.error) {
                                  showToast("Er ging iets mis bij het goedkeuren", "error");
                                  return;
                                }
                                setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, status: "approved" as const } : a)));
                                showToast("Bestand goedgekeurd", "success");
                              }}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg border-zinc-300 dark:border-zinc-600 text-xs"
                              onClick={async () => {
                                const result = await updateAssetStatus(asset.id, "needs_changes");
                                if (result.error) {
                                  showToast("Er ging iets mis bij het aanvragen van revisie", "error");
                                  return;
                                }
                                setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, status: "needs_changes" as const } : a)));
                                showToast("Revisie aangevraagd", "success");
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Request revision
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
