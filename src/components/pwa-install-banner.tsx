"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      localStorage.getItem("pwa-dismissed") === "true"
    ) {
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "true");
    setInstallPrompt(null);
  }

  if (!installPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-[14px] border border-zinc-800 bg-zinc-900 shadow-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#6366f1] rounded-[10px] flex flex-col justify-center px-2 gap-1 shrink-0">
          <span className="block h-[2px] w-full bg-white rounded-full" />
          <span className="block h-[2px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
          <span className="block h-[2px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100">Installeer Helderly</p>
          <p className="text-xs text-zinc-500 mt-0.5">Voeg toe aan je homescreen</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-[#6366f1] hover:opacity-90 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity shrink-0"
        >
          <Download className="h-3 w-3" />
          Installeer
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
          aria-label="Sluiten"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
