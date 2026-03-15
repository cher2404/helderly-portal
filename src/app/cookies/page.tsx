import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookiebeleid",
  description: "Cookiebeleid van Helderly.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <Link
          href={ROUTES.home}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
        >
          ← Terug naar Helderly
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Cookiebeleid
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Laatst bijgewerkt: maart 2025
        </p>

        <div className="mt-10 prose prose-zinc dark:prose-invert prose-sm max-w-none">
          <h2 className="text-lg font-semibold mt-8">Wat zijn cookies?</h2>
          <p>
            Cookies zijn kleine bestanden die een website op je apparaat kan
            plaatsen. Ze worden onder meer gebruikt om je in te loggen te
            houden en om voorkeuren te onthouden.
          </p>

          <h2 className="text-lg font-semibold mt-8">Welke cookies gebruikt Helderly?</h2>
          <p>
            Helderly gebruikt in de eerste plaats <strong>noodzakelijke</strong>{" "}
            cookies: die zijn nodig om de app te laten werken (bijv. sessie en
            authenticatie). Zonder deze cookies kun je niet ingelogd blijven.
          </p>
          <p className="mt-2">
            We gebruiken op dit moment geen analytics- of marketingcookies. Als
            we dat in de toekomst wel doen (bijv. anonieme statistieken),
            passen we dit cookiebeleid aan en informeren we je daarover.
          </p>

          <h2 className="text-lg font-semibold mt-8">Beheer</h2>
          <p>
            Je kunt cookies uitschakelen of verwijderen via je browser. Let op:
            als je noodzakelijke cookies uitschakelt, werkt inloggen en
            voorkeuren opslaan mogelijk niet meer.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex gap-6 text-sm">
          <Link href={ROUTES.privacy} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400">
            Privacyverklaring
          </Link>
          <Link href={ROUTES.home} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400">
            Helderly
          </Link>
        </div>
      </div>
    </div>
  );
}
