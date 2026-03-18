"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import type { Profile } from "@/lib/database.types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function WelcomeModal({ profile }: { profile: Profile }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const created = profile.created_at ? new Date(profile.created_at).getTime() : 0;
    const isNew = Date.now() - created < ONE_DAY_MS;
    const dismissed = typeof window !== "undefined" && sessionStorage.getItem("helderly_welcome_dismissed") === "1";
    setShow(isNew && !dismissed && profile.role === "admin");
  }, [profile.created_at, profile.role]);

  const dismiss = () => {
    sessionStorage.setItem("helderly_welcome_dismissed", "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-[var(--primary-accent)] mb-4">
              <Sparkles className="h-8 w-8" />
              <h2 className="text-lg font-semibold text-zinc-100">Welkom bij Helderly</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Maak je eerste project aan, voeg milestones toe en nodig je klant uit. Je klant krijgt een magic link om de voortgang te volgen en feedback te geven.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href={ROUTES.dashboard}>
                <Button onClick={dismiss} className="w-full sm:w-auto bg-[var(--primary-accent)] text-white hover:opacity-90">
                  Naar dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={dismiss} className="text-zinc-400">
                Sluiten
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
