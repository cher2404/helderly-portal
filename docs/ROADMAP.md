# Roadmap: software compleet maken

Voorstellen om Helderly verder compleet te maken — **voor gebruikers** (freelancers en klanten) en **voor jou als eigenaar**.

---

## Voor gebruikers

### 1. Account & privacy (AVG-vriendelijk)

| Onderdeel | Beschrijving | Prioriteit |
|-----------|--------------|------------|
| **Privacyverklaring** | Pagina (bijv. `/privacy`) + link in footer/signup. Leg uit: welke data, Supabase/Stripe, bewaartermijn. | Hoog |
| **Cookiebeleid** | Korte pagina of sectie als je analytics/cookies gebruikt. | Medium |
| **Export mijn data** | Knop in Instellingen: vraag aan backend → exporteer profiel + projecten (JSON/ZIP). Supabase + eventueel Stripe data. | Hoog |
| **Account verwijderen** | In Instellingen: “Verwijder account” → bevestiging → server-side: Auth user + profiel + anonimiseer of verwijder gekoppelde data (projecten, logs). Stripe-customer kan blijven voor facturatie-historie; wel abonnement opzeggen. | Hoog |

### 2. Instellingen uitbreiden

| Onderdeel | Beschrijving |
|-----------|--------------|
| **E-mail tonen** | In profiel/instellingen: e-mail (uit Auth) tonen, eventueel “wijzig e-mail” (Supabase flow). |
| **Wachtwoord wijzigen** | Link naar Supabase “forgot password” of eigen flow. |
| **Notificatievoorkeuren** | Aan/uit per type (milestones, feedback, wekelijkse digest). |

### 3. Gebruikerservaring

| Onderdeel | Beschrijving |
|-----------|--------------|
| **Zoeken** | Zoek in projecten, beslissingen of documenten (Supabase full-text of filter op titel). |
| **Mobiel** | Huidige layout is al responsive; eventueel PWA of “Add to home screen” voor snelle toegang. |
| **Toegankelijkheid** | Contrast, focus states, aria-labels controleren (vooral op modals en formulieren). |
| **Empty states** | Duidelijke teksten + CTA als er nog geen projecten/feedback/documenten zijn. |

### 4. Betalingen & pro

| Onderdeel | Beschrijving |
|-----------|--------------|
| **Facturen** | Stripe Customer Portal (al in gebruik) toont facturen; eventueel link “Mijn facturen” in Instellingen of Billing. |
| **Pro-features** | Duidelijke scheiding free vs pro (bijv. max projecten, max upload, extra widgets) en overal dezelfde regels. |

---

## Voor jou als eigenaar

### 1. Owner-portal uitbreiden

| Onderdeel | Beschrijving |
|-----------|--------------|
| **E-mail in gebruikerslijst** | E-mail tonen bij elke user (sync vanuit Auth naar profiel of ophalen via Auth Admin API). |
| **Zoeken/filter** | Filter op rol, abonnement, datum; zoeken op naam of e-mail. |
| **Export** | Gebruikers of abonnementen exporteren als CSV. |
| **MRR/omzet** | Stripe API: MRR of revenue tonen op owner-overzicht (optioneel). |

### 2. Operationeel

| Onderdeel | Beschrijving |
|-----------|--------------|
| **Monitoring** | Foutmonitoring (bijv. Sentry), uptime (Vercel of externe check). |
| **Backups** | Supabase dagelijkse backups controleren; eventueel export van kritieke tabellen. |
| **Webhook-status** | Simpele health-check of log dat Stripe-webhook (subscription updated) nog goed wordt aangeroepen. |
| **Logs** | Bij gevoelige acties (invite, role change, delete) een audit-log (tabel of Supabase Edge Function die schrijft). |

### 3. Beveiliging

| Onderdeel | Beschrijving |
|-----------|--------------|
| **2FA voor owner** | Tweede factor inschakelen voor het account dat in `OWNER_EMAILS` staat. |
| **Rate limiting** | Al aanwezig voor invite; eventueel uitbreiden voor login en gevoelige API’s. |
| **OWNER_EMAILS** | Alleen server-side; nooit in frontend of `NEXT_PUBLIC_*`. |

### 4. Product & groei

| Onderdeel | Beschrijving |
|-----------|--------------|
| **Feature usage** | Optioneel: welke widgets/features het meest gebruikt worden (anonieme metrics of in owner). |
| **Feedback** | E-mail of formulier “Idee of bug melden” met context (project id, role) voor jou. |
| **Churn-signalen** | In owner: trial afloop, subscription cancelled (Stripe) om proactief te kunnen reageren. |

---

## Volgorde suggestie

1. **Snel:** `OWNER_EMAILS` in `.env.local` + OWNER.md doorlezen.  
2. **Kort termijn:** Privacyverklaring, cookiebeleid, export data, verwijder account.  
3. **Daarna:** E-mail in owner gebruikerslijst, betere empty states, notificatievoorkeuren.  
4. **Later:** MRR in owner, audit-log, uitgebreidere analytics.

Als je wilt, kunnen we één van deze onderdelen (bijv. “Export mijn data” of “Account verwijderen”) als volgende stap uitwerken in code.
