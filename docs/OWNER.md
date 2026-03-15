# Owner-portal

Het **owner-portal** op `/owner` is bedoeld voor jou als eigenaar van de software. Hier beheer je overzicht, gebruikers en abonnementen.

---

## 0. Env-variabelen (voorbeeld)

Maak een `.env.local` (of gebruik je bestaande) en zorg in ieder geval voor:

```env
# Owner-portal: alleen deze e-mail(s) kunnen /owner openen (komma-gescheiden)
OWNER_EMAILS=jij@voorbeeld.nl
```

Volledige set voor de hele app (zie ook MAILING.md voor Resend):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:4000
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Helderly <noreply@jouwdomein.nl>
OWNER_EMAILS=jij@voorbeeld.nl
```

---

## 1. Toegang instellen

Alleen e-mailadressen die je in de omgeving opgeeft, kunnen `/owner` openen. Andere gebruikers worden doorgestuurd naar het dashboard.

**In `.env.local` (of productie):**

```env
OWNER_EMAILS=jij@voorbeeld.nl,partner@voorbeeld.nl
```

- Komma-gescheiden, geen spaties rond de komma’s (of wel, de app trimmed ze).
- Case-insensitive: `JIJ@voorbeeld.nl` mag.

**Belangrijk:** Zet `OWNER_EMAILS` alleen in server-side env (nooit in `NEXT_PUBLIC_*`), zodat de lijst niet in de frontend terechtkomt.

---

## 2. Wat zit er in het portal?

| Pagina | Doel |
|--------|------|
| **Overzicht** | Aantallen: totaal gebruikers, freelancers, klanten, actieve abonnementen, trial, free. |
| **Gebruikers** | Tabel met alle profielen: naam, user id, rol, abonnement, trial start, aangemaakt. |
| **Abonnementen** | Lijst actieve abonnementen + gebruikers in trial; link naar Stripe Dashboard. |

Data komt server-side uit Supabase met de **service role** (admin client), dus je ziet alle profielen ongeacht RLS.

---

## 3. Beveiliging & aanbevelingen

- **2FA:** Zet voor je eigen Supabase Auth-account twee-factor aan (Supabase Dashboard → Authentication → Users → jouw user).
- **OWNER_EMAILS:** Beperk tot 1–2 vertrouwde e-mailadressen.
- **Stripe:** Gebruik het [Stripe Dashboard](https://dashboard.stripe.com) voor betalingen, facturatie en refunds; de app sync alleen status via webhooks.

---

## 4. Wat is verder belangrijk voor jou als eigenaar?

| Onderwerp | Tip |
|-----------|-----|
| **Omzet** | MRR/ARR kun je in Stripe zien; eventueel later in het owner-overzicht tonen (Stripe API). |
| **Gebruikers** | E-mail staat nu niet in de profielen-tabel; optioneel: kolom toevoegen en vullen vanuit Auth (trigger of job). |
| **Compliance (AVG)** | Zorg voor privacyverklaring en cookiebeleid; overweeg “export mijn data” en “verwijder account” (zie ROADMAP.md). |
| **Operationeel** | Monitoring (bijv. Vercel, Sentry), Supabase backups, controleren of Stripe-webhook blijft werken na wijzigingen. |

Meer ideeën om de software compleet te maken (voor gebruikers én voor jou) staan in **ROADMAP.md**.
