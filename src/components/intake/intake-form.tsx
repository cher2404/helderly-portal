"use client";

import { useState } from "react";

type Props = { slug: string; freelancerName: string };

type FormState = "idle" | "submitting" | "success" | "error";

export function IntakeForm({ slug, freelancerName }: Props) {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const description = fd.get("description") as string;
    const budget = fd.get("budget") as string;
    const timeline = fd.get("timeline") as string;

    if (!name.trim() || !email.trim() || !description.trim()) {
      setError("Vul alle verplichte velden in.");
      setState("idle");
      return;
    }

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, email, description, budget, timeline }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");

      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw.");
      setState("idle");
    }
  }

  if (state === "success") {
    return (
      <div className="text-center py-8">
        <div
          className="w-16 h-16 rounded-full bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center text-3xl mx-auto mb-5"
          style={{ animation: "kpiNumPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          ✓
        </div>
        <h2 className="text-xl font-bold text-zinc-50 mb-3">Aanvraag verstuurd!</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-6 max-w-sm mx-auto">
          <strong className="text-zinc-200">{freelancerName}</strong> heeft je aanvraag ontvangen en neemt zo snel mogelijk contact op.
        </p>
        <div className="rounded-[12px] border border-zinc-800 bg-zinc-900/50 p-5 text-left max-w-sm mx-auto space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Wat gebeurt er nu?</p>
          {[
            `${freelancerName} ontvangt een notificatie`,
            "Je krijgt een bevestigingsmail",
            "Jullie bespreken de details",
            "Project van start in Helderly",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
              <span className="w-5 h-5 rounded-full bg-[#6366f1]/15 text-[#818cf8] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      {/* Naam */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
          Je naam <span className="text-[#6366f1]">*</span>
        </label>
        <input
          name="name"
          type="text"
          placeholder="Jan de Vries"
          required
          className="w-full rounded-[10px] border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#6366f1]/50"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
          E-mailadres <span className="text-[#6366f1]">*</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="jan@bedrijf.nl"
          required
          className="w-full rounded-[10px] border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#6366f1]/50"
        />
      </div>

      {/* Beschrijving */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
          Wat heb je nodig? <span className="text-[#6366f1]">*</span>
        </label>
        <textarea
          name="description"
          placeholder="Vertel kort wat je zoekt — bijv. nieuwe website, logo, social media strategie..."
          required
          rows={4}
          className="w-full rounded-[10px] border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#6366f1]/50 resize-none"
        />
      </div>

      {/* Budget + Timeline */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Budget</label>
          <select
            name="budget"
            className="w-full rounded-[10px] border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-400 focus:outline-none focus:border-[#6366f1]/50"
          >
            <option value="">Niet zeker</option>
            <option value="< €500">Minder dan €500</option>
            <option value="€500 – €1.500">€500 – €1.500</option>
            <option value="€1.500 – €5.000">€1.500 – €5.000</option>
            <option value="€5.000 – €15.000">€5.000 – €15.000</option>
            <option value="€15.000+">€15.000 of meer</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Wanneer starten?</label>
          <select
            name="timeline"
            className="w-full rounded-[10px] border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-400 focus:outline-none focus:border-[#6366f1]/50"
          >
            <option value="">Flexibel</option>
            <option value="Zo snel mogelijk">Zo snel mogelijk</option>
            <option value="Binnen 1 maand">Binnen 1 maand</option>
            <option value="Binnen 3 maanden">Binnen 3 maanden</option>
            <option value="Over 3+ maanden">Over 3+ maanden</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-[8px] px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full relative overflow-hidden rounded-[12px] bg-[#6366f1] py-3 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-60"
      >
        <span
          className="pointer-events-none absolute top-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/15 to-transparent"
          style={{ animation: "shimmerSlide 3s ease-in-out infinite 1s", left: "-100%" }}
        />
        {state === "submitting" ? "Versturen…" : "Aanvraag versturen →"}
      </button>

      <p className="text-center text-xs text-zinc-700">
        Je gegevens worden alleen gedeeld met {freelancerName}.
      </p>
    </form>
  );
}
