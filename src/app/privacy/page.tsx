import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Privacyverklaring van Helderly — hoe we omgaan met je gegevens.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between h-14">
          <Link href={ROUTES.home} className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#6366f1] rounded-[6px] flex flex-col justify-center px-1.5 gap-[3px] shrink-0">
              <span className="block h-[2px] w-full bg-white rounded-full" />
              <span
                className="block h-[2px] bg-white rounded-full"
                style={{ width: "68%", opacity: 0.65 }}
              />
              <span
                className="block h-[2px] bg-white rounded-full"
                style={{ width: "83%", opacity: 0.35 }}
              />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Helderly</span>
          </Link>
          <Link href={ROUTES.home} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Terug
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Privacyverklaring
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Laatst bijgewerkt: maart 2025
        </p>

        <div className="mt-10 prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-400 prose-strong:text-zinc-200">
          <h2 className="text-lg font-semibold mt-8">1. Wie wij zijn</h2>
          <p>
            Helderly (“wij”) is een clientportaal voor freelancers en hun klanten.
            Deze privacyverklaring gaat over de gegevens die we verzamelen en
            verwerken wanneer je Helderly gebruikt.
          </p>

          <h2 className="text-lg font-semibold mt-8">2. Welke gegevens we verzamelen</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Accountgegevens:</strong> e-mailadres, wachtwoord (gehasht),
              naam, profielfoto of logo, en voorkeuren (thema, accentkleur).
            </li>
            <li>
              <strong>Projectgegevens:</strong> projectnamen, voortgang,
              beslissingen, documenten, feedback en berichten die jij of je
              klanten in het portaal plaatsen.
            </li>
            <li>
              <strong>Betalingen:</strong> voor abonnementen gebruiken we Stripe.
              Wij slaan geen creditcardgegevens op; Stripe verwerkt die volgens
              hun eigen privacybeleid.
            </li>
            <li>
              <strong>Technische gegevens:</strong> IP-adres, browsertype en
              gebruik van de app (bijv. inlogmomenten) voor beveiliging en
              stabiliteit.
            </li>
          </ul>

          <h2 className="text-lg font-semibold mt-8">3. Waarom we deze gegevens gebruiken</h2>
          <p>
            We gebruiken je gegevens om de dienst te leveren (account beheer,
            projecten, samenwerking), facturatie te regelen, de app te
            beveiligen en te verbeteren, en om te voldoen aan wettelijke
            verplichtingen.
          </p>

          <h2 className="text-lg font-semibold mt-8">4. Bewaartermijn</h2>
          <p>
            We bewaren je gegevens zolang je account actief is. Na verwijdering
            van je account wissen of anonimiseren we persoonsgegevens binnen een
            redelijke termijn, behalve waar we ze langer moeten bewaren (bijv.
            voor facturatie of wettelijke eisen).
          </p>

          <h2 className="text-lg font-semibold mt-8">5. Delen met derden</h2>
          <p>
            We werken met Supabase (database en authenticatie) en Stripe
            (betalingen). Deze partijen verwerken gegevens namens ons en
            volgens hun eigen privacyvoorwaarden. We verkopen je gegevens niet
            aan derden.
          </p>

          <h2 className="text-lg font-semibold mt-8">6. Jouw rechten (AVG)</h2>
          <p>
            Je hebt het recht op inzage, correctie, verwijdering en
            overdraagbaarheid van je gegevens, en om bezwaar te maken of een
            klacht in te dienen bij de toezichthouder. In de app kun je je
            gegevens exporteren en je account verwijderen via Instellingen.
          </p>

          <h2 className="text-lg font-semibold mt-8">7. Contact</h2>
          <p>
            Vragen over deze privacyverklaring? Neem contact op via het
            e-mailadres dat op de website of in de app wordt vermeld.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex gap-6 text-sm">
          <Link href={ROUTES.cookies} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Cookiebeleid
          </Link>
          <Link href={ROUTES.home} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Helderly
          </Link>
        </div>
      </div>
    </div>
  );
}
