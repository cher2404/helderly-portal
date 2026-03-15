# Sandbox-omgeving

Een **sandbox** is een aparte omgeving waar je (of testgebruikers) de app kunt uitproberen met **testdata** en **geen echte betalingen**. De code is hetzelfde; je draait hem twee keer met andere configuratie.

---

## Twee omgevingen

| | **Productie** | **Sandbox** |
|--|----------------|-------------|
| **URL** | helderly.ip | sandbox.helderly.ip |
| **Supabase** | Eén project (echte data) | Een tweede project (testdata) |
| **Stripe** | Live keys (echte betalingen) | Test keys (geen echte betalingen) |
| **Doel** | Echte gebruikers | Demo, testen, klanten laten proberen |

---

## Optie 1: Sandbox als aparte Vercel-project (aanbevolen)

Je hebt dan **twee Vercel-projecten** die van dezelfde GitHub-repo deployen:

1. **Productie:** project `helderly-portal` → domein **helderly.ip**
2. **Sandbox:** project `helderly-portal-sandbox` → domein **sandbox.helderly.ip**

### Stappen voor de sandbox

1. **Supabase:** Maak een **tweede** project aan (bijv. "Helderly Sandbox"). Daar komt alleen testdata in. Noteer de nieuwe Project URL en anon + service_role keys.

2. **Stripe:** Blijf in **testmodus** (sk_test_..., geen live keys). Eventueel een apart Stripe-account voor sandbox, of dezelfde met test keys.

3. **Vercel:**  
   - **Add New** → **Project** → kies **dezelfde** repo (helderly-portal).  
   - Geef het project een andere naam, bijv. **helderly-portal-sandbox**.  
   - **Environment Variables** vul je met de **sandbox-waarden**:

   | Name | Waarde (sandbox) |
   |------|------------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL van het **sandbox** Supabase-project |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key van sandbox-project |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key van sandbox-project |
   | `NEXT_PUBLIC_APP_URL` | https://sandbox.helderly.ip |
   | `STRIPE_SECRET_KEY` | sk_test_... (Stripe testmodus) |
   | `STRIPE_WEBHOOK_SECRET` | whsec_... van webhook voor **sandbox** URL (zie hieronder) |
   | `STRIPE_PRICE_MONTHLY` | price_... (test price in Stripe) |
   | `OWNER_EMAILS` | jouw@email.nl |
   | Resend | Zelfde of een test-afzender |

4. **Domein:** In dit Vercel-project bij **Domains** het domein **sandbox.helderly.ip** toevoegen. Bij je DNS-provider: **sandbox** als subdomein (CNAME naar `cname.vercel-dns.com` of het adres dat Vercel toont).

5. **Stripe webhook voor sandbox:** In Stripe (testmodus) een **tweede** webhook endpoint toevoegen:  
   `https://sandbox.helderly.ip/api/stripe/webhook`  
   Het bijbehorende **Signing secret** zet je in de sandbox-Vercel-project als `STRIPE_WEBHOOK_SECRET`.

Daarna is **sandbox.helderly.ip** een volledige kopie van de app op testdata en testbetalingen; je kunt daar gerust experimenteren of klanten laten rondkijken.

---

## Optie 2: Eén project, twee branches (alternatief)

- **main** → productie (helderly.ip), productie-env in Vercel.
- **sandbox** (of **staging**) → sandbox.helderly.ip, andere env (sandbox Supabase + Stripe test).

In Vercel kun je per branch een ander domein koppelen (Production = main, Preview = sandbox branch). Dan deploy je sandbox alleen wanneer je naar de sandbox-branch pusht. De env vars voor die branch zet je onder **Environment Variables** met scope "Preview".

---

## Samenvatting

- **Sandbox = dezelfde code**, andere Supabase (testdata) en Stripe test keys.
- **helderly.ip** = productie, **sandbox.helderly.ip** = sandbox (aparte Vercel-project of preview-branch met sandbox-env).
- Zo kun je alles op sandbox.helderly.ip uitproberen zonder echte data of betalingen te raken.
