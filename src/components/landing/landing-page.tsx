"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  Calendar,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href={ROUTES.home} className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#6366f1] rounded-[7px] flex flex-col justify-center px-1.5 gap-1 shrink-0">
              <span className="block h-[2.5px] w-full bg-white rounded-full" />
              <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
              <span className="block h-[2.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Helderly</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.pricing} className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Prijzen
            </Link>
            <Link href={ROUTES.login} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Inloggen
            </Link>
            <Link href={ROUTES.signUp} className="rounded-[10px] bg-[#6366f1] px-3.5 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Gratis starten
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-16 pb-0 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-32 -left-20 h-[400px] w-[400px] rounded-full bg-[#6366f1]/15 blur-[80px]" style={{ animation: "orbFloat1 8s ease-in-out infinite" }} />
          <div className="absolute -top-16 -right-16 h-[300px] w-[300px] rounded-full bg-[#8b5cf6]/10 blur-[80px]" style={{ animation: "orbFloat2 10s ease-in-out infinite" }} />
          <div className="absolute bottom-0 left-1/3 h-[200px] w-[200px] rounded-full bg-[#6366f1]/08 blur-[80px]" style={{ animation: "orbFloat3 12s ease-in-out infinite" }} />
        </div>

        <div className="text-center max-w-3xl mx-auto relative">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/20 bg-[#6366f1]/10 px-3.5 py-1.5 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" style={{ animation: "dotPulse 2s ease-in-out infinite" }} />
            <span className="text-xs font-medium text-[#818cf8]">Nieuw — intake formulier voor klanten</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.08] mb-6">
            Jouw klanten verdienen{" "}
            <span className="italic text-[#818cf8]" style={{ fontFamily: "Georgia, serif" }}>meer dan een e-mail.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-8">
            Het minimalistische klantportaal voor freelancers met uitstraling.
            Tijdlijn, bestanden en feedback — op één plek, in jouw huisstijl.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-8">
            <Link href={ROUTES.signUp}
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-[12px] bg-[#6366f1] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <span className="pointer-events-none absolute top-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animation: "shimmerSlide 3s ease-in-out infinite 1s", left: "-100%" }} aria-hidden />
              Gratis starten
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href={ROUTES.pricing}
              className="inline-flex items-center gap-2 rounded-[12px] border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-colors">
              Bekijk prijzen
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center justify-center gap-3 mb-12">
            <div className="flex">
              {(["#6366f1", "#8b5cf6", "#0ea5e9", "#10b981"] as const).map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-zinc-950 flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: color, marginLeft: i > 0 ? "-8px" : "0", zIndex: 4 - i }}
                >
                  {["C", "M", "J", "R"][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-zinc-500">
              <span className="text-amber-400">★★★★★</span>
              <span className="ml-2">Gebruikt door 200+ freelancers</span>
            </div>
          </motion.div>
        </div>

        {/* Mockup */}
        <motion.div className="mx-auto max-w-4xl relative"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className="relative rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-2 shadow-2xl shadow-zinc-950 ring-1 ring-zinc-600/30">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1/2 h-12 bg-[#6366f1] rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="relative rounded-xl overflow-hidden bg-zinc-900/90 border border-zinc-800/80">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-zinc-700" />
                  <span className="w-3 h-3 rounded-full bg-zinc-700" />
                  <span className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-zinc-500 font-mono">app.helderly.io/dashboard</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex min-h-[300px] sm:min-h-[340px]">
                <aside className="hidden sm:flex w-44 border-r border-zinc-800 bg-zinc-900/40 p-3 flex-col gap-1 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800/60">
                    <div className="w-5 h-5 bg-[#6366f1] rounded-[5px] flex flex-col justify-center px-1 gap-[3px]">
                      <span className="block h-[1.5px] w-full bg-white rounded-full" />
                      <span className="block h-[1.5px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
                      <span className="block h-[1.5px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-200">Studio Maan</span>
                  </div>
                  {[
                    { icon: LayoutDashboard, label: "Dashboard", active: true },
                    { icon: FileText, label: "Klanten", active: false },
                    { icon: Calendar, label: "Bestanden", active: false },
                    { icon: MessageCircle, label: "Feedback", active: false },
                  ].map(({ icon: Icon, label, active }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-[11px] ${
                        active ? "bg-[#6366f1]/12 text-[#818cf8] border border-[#6366f1]/20" : "text-zinc-500"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </div>
                  ))}
                </aside>
                <main className="flex-1 p-5 space-y-3 overflow-hidden">
                  <p className="text-xs font-semibold text-zinc-200">Dashboard</p>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3.5">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-[7px] bg-[#6366f1] flex items-center justify-center text-sm flex-shrink-0">
                        🏗️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate">Build Helderly.io</p>
                        <p className="text-[10px] text-zinc-500">Deadline: 1 jun 2025</p>
                      </div>
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                        Op schema
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full bg-[#6366f1]"
                        style={{ width: "0%", animation: "barFillAnim 1.8s cubic-bezier(0.25,0.46,0.45,0.94) 0.8s forwards" }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-500">
                      <span>65% voltooid</span>
                      <span>Volgende: Final Delivery</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Mijlpalen", value: "2/3", accent: true },
                      { label: "Bestanden", value: "4" },
                      { label: "Beslissingen", value: "1" },
                    ].map(({ label, value, accent }) => (
                      <div
                        key={label}
                        className={`rounded-lg p-2.5 border ${
                          accent ? "border-[#6366f1]/25 bg-[#6366f1]/6" : "border-zinc-800 bg-zinc-800/30"
                        }`}
                      >
                        <p className={`text-sm font-bold ${accent ? "text-[#818cf8]" : "text-zinc-100"}`}>{value}</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </main>
              </div>
            </div>
          </div>
          {/* Notification pop */}
          <div
            className="absolute -right-4 top-8 z-10 hidden sm:flex items-center gap-2.5 rounded-[10px] border border-zinc-700/80 bg-zinc-900 px-3 py-2 shadow-xl"
            style={{ animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 1.5s both" }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-emerald-400"
              style={{ animation: "dotPulse 2s ease-in-out infinite 2s" }}
            />
            <span className="text-xs text-zinc-300 whitespace-nowrap">
              <strong className="text-white font-medium">Klant heeft goedgekeurd</strong>{" · "}logo-final.svg
            </span>
          </div>
        </motion.div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mt-0 border-t border-zinc-800/60">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800/60">
          {[
            {
              emoji: "⏱️",
              title: "Nooit meer 'Hoe staat het?'",
              desc: "Klant ziet voortgang in real time, 24/7. Zonder jou te hoeven vragen.",
            },
            {
              emoji: "✅",
              title: "Goedkeuringen met één klik",
              desc: "Bestanden goedkeuren of revisie aanvragen. Duidelijke audit trail.",
            },
            {
              emoji: "🎨",
              title: "Jouw merk, niet het onze",
              desc: "Logo, kleuren en inloglink. Klant ziet jouw studio — Helderly blijft onzichtbaar.",
            },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="px-8 py-8 transition-colors hover:bg-[#6366f1]/03 group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#6366f1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <div className="text-2xl mb-3">{emoji}</div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ZO WERKT HET */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-[3px] mb-3">Zo werkt het</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-3">
            Drie stappen naar{" "}
            <span className="italic text-[#818cf8]" style={{ fontFamily: "Georgia, serif" }}>rust.</span>
          </h2>
          <p className="text-zinc-400 max-w-md">Geen ingewikkelde setup. Binnen tien minuten heeft je klant toegang.</p>
        </motion.div>
        <div className="divide-y divide-zinc-800/50">
          {[
            {
              num: "01",
              title: "Maak een project aan",
              desc: "Voeg je klant toe via e-mail. Stel een deadline in. Kies een template of begin blanco. Klant ontvangt automatisch een uitnodiging via een magic link.",
              visual: (
                <div className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                  <p className="text-xs font-semibold text-zinc-300 mb-3">Nieuw project</p>
                  <div className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400">Website redesign</div>
                  <div className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400">klant@studio.nl</div>
                  <div className="rounded-lg bg-[#6366f1] px-3 py-2 text-xs font-semibold text-white text-center">
                    Aanmaken & uitnodigen →
                  </div>
                </div>
              ),
            },
            {
              num: "02",
              title: "Upload bestanden, log voortgang",
              desc: "Voeg mijlpalen toe en upload ontwerpen of documenten. De klant kan direct goedkeuren of revisie aanvragen — zonder een mailtje.",
              visual: (
                <div className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs font-semibold text-zinc-300 mb-3">Bestanden</p>
                  {[
                    { name: "logo-final.svg", status: "Goedgekeurd ✓", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                    { name: "homepage-v2.fig", status: "Revisie", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                    { name: "brief-2025.pdf", status: "Goedgekeurd ✓", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  ].map(({ name, status, color }) => (
                    <div key={name} className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
                      <span className="text-xs text-zinc-400">{name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${color}`}>{status}</span>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              num: "03",
              title: "Klant logt in op jouw portaal",
              desc: "Geen account nodig. Klant klikt de magic link en ziet alles — in jouw huisstijl, met jouw logo en kleuren. Helderly-branding is nergens te zien.",
              visual: (
                <div className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-zinc-800">
                    <div className="w-6 h-6 rounded-[6px] bg-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Studio Maan</p>
                      <p className="text-[10px] text-zinc-500">Klantportaal</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: "65%" }} />
                  </div>
                  <p className="text-[10px] text-zinc-500">Website redesign · 65% voltooid</p>
                </div>
              ),
            },
          ].map(({ num, title, desc, visual }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="grid sm:grid-cols-2 gap-8 py-10 items-center"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-600 mb-2">{num}</p>
                <h3 className="text-xl font-semibold text-zinc-50 mb-3">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
              <div>{visual}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VERGELIJKING */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-[3px] mb-3">Het verschil</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            Zelfde werk.{" "}
            <span className="italic text-[#818cf8]" style={{ fontFamily: "Georgia, serif" }}>Minder chaos.</span>
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <div className="rounded-[14px] border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                <X className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vroeger</h3>
            </div>
            <ul className="space-y-4">
              {[["E-mailchaos", "Threads, doorgestuurd, 'welke versie ook alweer?'"], ["Kwijte bestanden", "Drive, Dropbox, WeTransfer. Nergens centraal."], ["Handmatige updates", "Screenshots, statusmailtjes, 'Hoe staat het?'"], ["Geen akkoord", "Goedkeuring per mail, niets vastgelegd."]].map(
                ([t, s]) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-zinc-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                    <span>
                      <strong className="text-zinc-300">{t}</strong> — {s}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="rounded-[14px] border border-[#6366f1]/25 bg-[#6366f1]/5 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1]/20 text-[#818cf8]">
                <Check className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#818cf8]">Met Helderly</h3>
            </div>
            <ul className="space-y-4">
              {[["Één portaal", "Klant logt in, ziet alles. Inbox blijft leeg."], ["Bestanden centraal", "Altijd beschikbaar, altijd de laatste versie."], ["Real-time tijdlijn", "Voortgang zichtbaar 24/7. Geen updates meer nodig."], ["Formeel akkoord", "Klant accordeert met naam en datum. Audit trail."]].map(
                ([t, s]) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f1]/60" />
                    <span>
                      <strong className="text-zinc-50">{t}</strong> — {s}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-zinc-800/60">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold text-[#6366f1] uppercase tracking-[3px] mb-3">Vragen</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            Veelgestelde{" "}
            <span className="italic text-[#818cf8]" style={{ fontFamily: "Georgia, serif" }}>vragen.</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
          {[
            {
              q: "Moet mijn klant betalen?",
              a: "Nee. Jouw abonnement dekt alles. Klanten loggen gratis in — zij zien nooit een Helderly-factuur.",
            },
            {
              q: "Heeft mijn klant een account nodig?",
              a: "Nee. Klant klikt de magic link in zijn e-mail en is direct binnen. Geen wachtwoord, geen account aanmaken.",
            },
            {
              q: "Kan ik mijn eigen logo en kleuren gebruiken?",
              a: "Ja. Logo, accentkleur en inloglink stel je in via Instellingen. Klant ziet jouw merk — Helderly blijft onzichtbaar.",
            },
            {
              q: "Wat als mijn proefperiode afloopt?",
              a: "Je data blijft volledig bewaard. Je kiest zelf of je wil upgraden — er wordt niets automatisch verwijderd.",
            },
            {
              q: "Hoeveel klanten kan ik toevoegen?",
              a: "Op het Pro-abonnement onbeperkt. Tijdens de gratis proefperiode kun je tot 3 projecten aanmaken.",
            },
            {
              q: "Werkt het ook voor kleine bureaus?",
              a: "Absoluut. Helderly is gebouwd voor zelfstandige designers, developers, consultants én kleine creatieve bureaus.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-zinc-800/60 pb-6">
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">{q}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/40 border-t border-zinc-800/60">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 mb-4">
            Klaar voor{" "}
            <span className="italic text-[#818cf8]" style={{ fontFamily: "Georgia, serif" }}>meer rust?</span>
          </h2>
          <p className="text-zinc-400 mb-8">30 dagen gratis. Geen creditcard nodig. Cancel wanneer je wil.</p>
          <Link
            href={ROUTES.signUp}
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#6366f1] px-8 py-4 text-base font-semibold text-white hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Gratis starten <ChevronRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-xs text-zinc-600">Al 200+ freelancers gingen je voor</p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#6366f1] rounded-[6px] flex flex-col justify-center px-1.5 gap-[3px] shrink-0">
              <span className="block h-[2px] w-full bg-white rounded-full" />
              <span className="block h-[2px] bg-white rounded-full" style={{ width: "68%", opacity: 0.65 }} />
              <span className="block h-[2px] bg-white rounded-full" style={{ width: "83%", opacity: 0.35 }} />
            </div>
            <span className="text-zinc-50 font-medium">Helderly</span>
            <span className="text-zinc-700">·</span>
            <span className="text-sm text-zinc-500">by Conexy</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href={ROUTES.privacy} className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href={ROUTES.cookies} className="hover:text-zinc-300 transition-colors">Cookies</Link>
            <Link href={ROUTES.pricing} className="hover:text-zinc-300 transition-colors">Prijzen</Link>
            <Link href={ROUTES.login} className="hover:text-zinc-300 transition-colors">Inloggen</Link>
            <Link href={ROUTES.signUp} className="hover:text-zinc-300 transition-colors">Gratis starten</Link>
          </div>
        </div>
      </footer>

      {/* Animatie keyframes */}
      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,20px) scale(1.08)} }
        @keyframes orbFloat3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
        @keyframes shimmerSlide { 0%{left:-100%} 60%,100%{left:150%} }
        @keyframes barFillAnim { from{width:0%} to{width:65%} }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.6} }
        @keyframes popIn { from{opacity:0;transform:scale(0.8) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

