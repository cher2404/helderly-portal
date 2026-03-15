# Deploy naar helderly.io

Zo zet je de app live op jouw domein **helderly.io** (of www.helderly.io). De eenvoudigste manier is **Vercel** (gratis voor hobby, ideaal voor Next.js).

---

## 1. Code op GitHub zetten (als dat nog niet is)

1. Maak een repo op [github.com](https://github.com) (bijv. `helderly-portal`).
2. Lokaal in de projectmap:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/JOUW_USERNAME/helderly-portal.git
   git push -u origin main
   ```
3. Zorg dat **.env.local niet** in de repo zit (staat in .gitignore). Gevoelige waarden zet je straks in Vercel als Environment Variables.

---

## 2. Deploy op Vercel

1. Ga naar [vercel.com](https://vercel.com) en log in (met GitHub).
2. **Add New** → **Project** → importeer je **helderly-portal** repo.
3. **Framework Preset:** Next.js (wordt automatisch herkend).
4. **Root Directory:** leeg laten.
5. **Environment Variables:** voeg hier alle waarden uit je .env.local toe (voor Production, en eventueel Preview):

   | Name | Value |
   |------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... |
   | `SUPABASE_SERVICE_ROLE_KEY` | eyJ... |
   | `NEXT_PUBLIC_APP_URL` | https://helderly.io |
   | `STRIPE_SECRET_KEY` | sk_live_... (productie) of sk_test_... |
   | `STRIPE_WEBHOOK_SECRET` | whsec_... |
   | `STRIPE_PRICE_MONTHLY` | price_... |
   | `STRIPE_PRICE_YEARLY` | price_... (optioneel) |
   | `RESEND_API_KEY` | re_... |
   | `RESEND_FROM_EMAIL` | Helderly &lt;noreply@helderly.io&gt; |
   | `OWNER_EMAILS` | jouw@email.nl |

6. Klik **Deploy**. Na een paar minuten krijg je een URL zoals `helderly-portal.vercel.app`.

---

## 3. Domein helderly.io koppelen

1. In Vercel: je project → **Settings** → **Domains**.
2. Voeg toe: **helderly.io** en eventueel **www.helderly.io**.
3. Vercel toont dan welke DNS-records je moet zetten (meestal een **CNAME** of **A** record).

**Bij je domeinregistrar (waar je helderly.io beheert):**

- Voor **helderly.io** (hoofddomein): vaak een **A-record** naar het IP dat Vercel geeft, of een **CNAME** naar `cname.vercel-dns.com` (als je registrar dat toestaat voor de root).
- Voor **www.helderly.io**: **CNAME** naar `cname.vercel-dns.com`.

Exacte stappen hangen af van je DNS-provider; Vercel toont per domein de juiste instructies.

4. SSL wordt door Vercel geregeld (automatisch HTTPS).

---

## 4. Na deploy: Stripe en e-mail

- **Stripe:** In het Stripe Dashboard bij **Webhooks** een endpoint toevoegen:  
  `https://helderly.io/api/stripe/webhook`  
  (en het bijbehorende **Signing secret** als `STRIPE_WEBHOOK_SECRET` in Vercel zetten.)
- **Resend:** Als je e-mail vanaf je eigen domein wilt sturen, voeg in Resend het domein **helderly.io** toe en zet de DNS-records (SPF/DKIM). Gebruik dan bv. `noreply@helderly.io` als `RESEND_FROM_EMAIL`.

---

## 5. Later: code wijzigen en opnieuw live zetten

Bij elke **push** naar `main` bouwt Vercel automatisch opnieuw en gaat de live site op helderly.io naar de nieuwe versie. Geen handmatige upload nodig.

---

## Alternatief: eigen server (VPS)

Als je op een eigen server (VPS) wilt draaien in plaats van Vercel:

1. Op de server: Node.js 18+ installeren, repo clonen, `npm install` en `npm run build`.
2. Starten met `npm run start` (poort 3000) of een process manager (pm2) en eventueel een reverse proxy (nginx) voor HTTPS.
3. In nginx of bij je DNS: **helderly.io** laten wijzen naar deze server.

Voor een snelle en stabiele start is Vercel het makkelijkst; de **code** is hetzelfde, je krijgt hem op helderly.io door het domein in Vercel te koppelen.

