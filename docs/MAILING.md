# Mailing instellen met Supabase en Resend

Helderly gebruikt **Resend** voor transactie-e-mails (welkom, uitnodiging, notificaties). Supabase Auth kan óók via Resend (of andere SMTP) lopen, zodat inlog- en magic-link-mails hetzelfde afzenderdomein gebruiken.

---

## 1. Resend configureren

1. **Account:** [resend.com](https://resend.com) → account aanmaken.
2. **API key:** Resend Dashboard → API Keys → Create API Key. Kopieer de key.
3. **Domein (optioneel):** Voor productie voeg je een domein toe en configureer je DNS (SPF, DKIM). Zonder domein kun je alleen naar je eigen e-mailadres testen (Resend beperkt dat).

**Env in `.env.local`:**

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=Helderly <onboarding@resend.dev>   # of: noreply@jouwdomein.nl
```

- `RESEND_FROM_EMAIL`: afzender voor alle app-mails. Default `onboarding@resend.dev` mag alleen voor testen.

---

## 2. Supabase Auth e-mails via Resend (SMTP)

Supabase stuurt zelf e-mails voor **sign up**, **magic link** en **password reset**. Die kun je via **Custom SMTP** door Resend laten lopen.

### Stappen in Supabase

1. **Dashboard** → jouw project → **Authentication** → **Providers** → **Email**.
2. Schakel **Enable Custom SMTP** in.
3. Vul in (Resend SMTP):

   | Veld        | Waarde |
   |------------|--------|
   | Sender email | Hetzelfde als `RESEND_FROM_EMAIL` (bijv. `onboarding@resend.dev` of `noreply@jouwdomein.nl`) |
   | Sender name  | `Helderly` |
   | Host         | `smtp.resend.com` |
   | Port         | `465` (of `587` voor TLS) |
   | Username     | `resend` |
   | Password     | Je **Resend API key** (niet een wachtwoord van je mailbox) |

4. **Save**.

Vanaf dan gaan alle Supabase Auth-mails (magic link, confirmatie, wachtwoord vergeten) via Resend. Je ziet ze terug in Resend → Emails.

---

## 3. App-e-mails (Helderly zelf)

Deze worden niet door Supabase gestuurd maar door onze API-routes, met de Resend SDK:

| Route | Gebruik |
|-------|--------|
| `POST /api/emails/welcome` | Welkomstmail (nieuwe freelancer) |
| `POST /api/emails/invite` | Uitnodiging met magic link (klant uitnodigen voor project) |
| `POST /api/emails/milestone` | Notificatie “milestone voorgesteld” of “goedgekeurd” |

- **API key:** dezelfde `RESEND_API_KEY` als hierboven.
- **Afzender:** `RESEND_FROM_EMAIL` (zelfde als SMTP sender voor herkenning).

Aanroepen doe je vanuit je eigen code (bijv. na signup, na “Invite client”, of in server actions bij milestone-events). Zie de bestaande UI voor “Invite client” en de notificatielogica in de project-actions.

---

## 4. Overzicht

| Wat | Waar geconfigureerd | Verstuurd door |
|-----|---------------------|----------------|
| Magic link (inlog) | Supabase Auth → Custom SMTP | Supabase (via Resend SMTP) |
| Sign up bevestiging | Supabase Auth → Custom SMTP | Supabase (via Resend SMTP) |
| Welkomstmail | `.env`: `RESEND_*` | App (`/api/emails/welcome`) |
| Invite client | `.env`: `RESEND_*` | App (`/api/invite` + Resend) |
| Milestone-notificaties | `.env`: `RESEND_*` | App (`/api/emails/milestone`) |

---

## 5. Testen

1. **Resend:** Stuur een testmail via Resend Dashboard of roep `POST /api/emails/welcome` aan (met `to` in de body).
2. **Supabase magic link:** Gebruik “Invite client” in een project; de klant krijgt een mail met magic link. Controleer in Resend of die mail binnenkomt (als SMTP goed staat, komen Supabase-mails daar ook binnen).
3. **Rate limits:** Resend heeft limieten; bij veel testmails even op de Resend dashboard limits letten.

Als je zowel Supabase SMTP als de app op dezelfde `RESEND_*` /zelfde afzender zet, zien gebruikers één herkenbare afzender (Helderly) voor alle mails.

---

## 6. Rate limiting

- **Supabase Auth:** heeft eigen rate limits; bij misbruik tijdelijk blokkeren.
- **Invite API:** `/api/invite` is beperkt tot 10 uitnodigingen per minuut per gebruiker (in-memory). Voor productie met meerdere instances kun je een gedeelde store (bijv. Redis) gebruiken.
