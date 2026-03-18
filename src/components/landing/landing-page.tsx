"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import {
  FolderOpen,
  Calendar,
  MessageCircle,
  LayoutDashboard,
  FileText,
  Sparkles,
  CheckCircle2,
  BellOff,
  X,
  Check,
} from "lucide-react";

const features = [
  {
    icon: FolderOpen,
    title: "Asset Sharing",
    description:
      "One secure place for contracts, designs, and deliverables. Clients view and download without digging through email.",
  },
  {
    icon: Calendar,
    title: "Visual Timelines",
    description:
      "Show progress at a glance. Clear steps and milestones keep everyone aligned and reduce back-and-forth.",
  },
  {
    icon: MessageCircle,
    title: "Instant Feedback",
    description:
      "Threaded messages and approvals in one place. No more lost replies or duplicate threads.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* Top nav: direct naar Dashboard / Inloggen */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <span className="text-sm font-medium text-zinc-400">Helderly</span>
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.login}
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.dashboard}
              className="rounded-lg border border-zinc-600 bg-zinc-800/50 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700/50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-6"
          >
            Helderly.io
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-50 leading-[1.1] hero-heading"
          >
            Give your clients the clarity they deserve.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            The minimalist client portal for freelancers who value their brand.
            Stop the email chaos and start professionalizing your workflow.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10"
          >
            <Link
              href={ROUTES.signUp}
              className="group inline-flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-900 font-medium px-8 py-3.5 text-sm shadow-lg shadow-zinc-950/50 transition-all duration-300 hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_24px_-8px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Early Access
            </Link>
          </motion.div>
        </div>

        {/* Dashboard mockup with glowing border */}
        <motion.div
          className="mt-16 mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="relative rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-2 shadow-2xl shadow-zinc-950 ring-1 ring-zinc-600/30">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-zinc-400/20 via-zinc-500/10 to-transparent opacity-90 blur-lg pointer-events-none" aria-hidden />
            <div className="relative rounded-xl overflow-hidden bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                  <span className="w-3 h-3 rounded-full bg-zinc-600" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-zinc-500 font-mono">
                    app.helderly.io/dashboard
                  </span>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="flex min-h-[280px] sm:min-h-[320px]">
                <aside className="hidden sm:flex w-48 border-r border-zinc-800 bg-zinc-900/30 p-4 flex-col gap-2">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-xs">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">Timeline</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">Documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">Messages</span>
                  </div>
                </aside>
                <main className="flex-1 p-6 space-y-4">
                  <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 rounded-xl border border-zinc-800 bg-zinc-800/30"
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 w-32 bg-zinc-800 rounded" />
                    <div className="h-3 w-24 bg-zinc-800 rounded" />
                  </div>
                </main>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features - Glassmorphism grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-50 tracking-tight">
            Built for clarity
          </h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
            Everything your clients need, without the noise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.06]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300 group-hover:text-zinc-50 transition-colors">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits for Freelancers */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">
            For Freelancers
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-50 tracking-tight">
            Why Helderly?
          </h2>
          <p className="mt-3 text-zinc-400 max-w-xl mx-auto">
            Stop juggling tools. Give clients one place that makes you look pro and keeps projects moving.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            className="relative rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0, duration: 0.4 }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-amber-400/90">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-50 tracking-tight">
              Look 10x more professional
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Stop sending Drive links. Give your clients a branded experience with your logo, your colors, and one clear portal.
            </p>
          </motion.div>
          <motion.div
            className="relative rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400/90">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-50 tracking-tight">
              Get approvals faster
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Use the integrated approval workflow so clients can approve or request revisions in one click. No more chasing sign-offs.
            </p>
          </motion.div>
          <motion.div
            className="relative rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-violet-400/90">
              <BellOff className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-50 tracking-tight">
              Silence the &quot;Status?&quot; emails
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Your clients can see progress in real time, 24/7. Timeline, files, and milestones in one place—so you spend less time on updates.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison: Old Way vs Helderly Way */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-50 tracking-tight">
            The difference
          </h2>
          <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
            Same work. Less chaos. One portal.
          </p>
        </motion.div>

        <motion.div
          className="rounded-[12px] border border-zinc-800 overflow-hidden bg-zinc-900/30"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid sm:grid-cols-2 divide-x divide-zinc-800">
            {/* The Old Way */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                  <X className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  The Old Way
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                  <span><strong className="text-zinc-300">Email chaos</strong> — Threads, forwards, and &quot;which version?&quot;</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                  <span><strong className="text-zinc-300">Lost files</strong> — Drive links, Dropbox, WeTransfer. Nothing in one place.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                  <span><strong className="text-zinc-300">Manual updates</strong> — Screenshots, status emails, and &quot;Status?&quot; pings.</span>
                </li>
              </ul>
            </div>
            {/* The Helderly Way */}
            <div className="p-6 sm:p-8 bg-zinc-800/20 border-t sm:border-t-0 sm:border-l border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400/90">
                  The Helderly Way
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/50">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </span>
                  <span><strong className="text-zinc-50">One portal</strong> — Client logs in, sees everything. No digging through inbox.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/50">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </span>
                  <span><strong className="text-zinc-50">Approved assets</strong> — One-click approve or request revision. Clear audit trail.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/50">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </span>
                  <span><strong className="text-zinc-50">Clear timeline</strong> — Real-time progress, milestones, and meetings. 24/7 visibility.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center rounded-2xl border border-zinc-800/80 bg-white/[0.02] backdrop-blur-xl py-16 px-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            Trusted by independent creators
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-2 text-zinc-500 text-sm">
            <span>Freelance designers</span>
            <span>•</span>
            <span>Developers</span>
            <span>•</span>
            <span>Consultants</span>
            <span>•</span>
            <span>Creative agencies</span>
          </div>
        </motion.div>
      </section>

      {/* CTA strip */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold text-zinc-50">
            Ready to simplify client work?
          </h2>
          <p className="mt-2 text-zinc-400">Join the waitlist. No spam, ever.</p>
          <Link
            href={ROUTES.signUp}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-900 font-medium px-8 py-3.5 text-sm transition-all duration-300 hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_24px_-8px_rgba(0,0,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Early Access
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-zinc-50 font-medium">Helderly</span>
            <span className="text-zinc-600">·</span>
            <span className="text-sm text-zinc-500">by Conexy</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href={ROUTES.privacy} className="hover:text-zinc-300 transition-colors">
              Privacy
            </Link>
            <Link href={ROUTES.cookies} className="hover:text-zinc-300 transition-colors">
              Cookies
            </Link>
            <Link href={ROUTES.pricing} className="hover:text-zinc-300 transition-colors">
              Pricing
            </Link>
            <Link href={ROUTES.login} className="hover:text-zinc-300 transition-colors">
              Sign in
            </Link>
            <Link href={ROUTES.signUp} className="hover:text-zinc-300 transition-colors">
              Get Early Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
