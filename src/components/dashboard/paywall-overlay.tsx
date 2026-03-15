"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

type Props = { show: boolean };

export function PaywallOverlay({ show }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-label="Trial ended – upgrade to continue"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mx-4 w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">
                Your 30-day trial has ended
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Upgrade to Pro to keep using your dashboard and all features.
              </p>
              <Link href={ROUTES.pricing} className="mt-6 w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-[var(--primary-accent)] text-white hover:opacity-90 sm:w-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro — €19/month
                </Button>
              </Link>
              <p className="mt-4 text-xs text-zinc-500">
                Non-dismissible. Payment is required to continue.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
