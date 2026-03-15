# Stripe koppelen aan Helderly

Stappen om je Stripe-account te koppelen aan de software: API-keys, product/prijzen aanmaken en de webhook instellen.

---

## 1. API-keys ophalen

1. Ga naar [Stripe Dashboard](https://dashboard.stripe.com) en log in.
2. **Developers** → **API keys**.
3. Gebruik **Secret key** (begint met `sk_test_` in testmodus, `sk_live_` in productie). Klik op “Reveal” en kopieer.
4. In de app wordt alleen de **secret key** gebruikt (geen publishable key in de frontend voor deze flow).

**In `.env.local`:**

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

---

## 2. Product en prijzen aanmaken

De app verwacht **Price IDs** (niet Product IDs). Je maakt een product met één of twee prijzen.

### Stappen in Stripe

1. **Product catalog** → **Add product** (of **Products** → **+ Add product**).
2. **Name:** bijv. `Helderly Pro`.
3. **Pricing model:** Recurring.
4. **Price:**  
   - **€19** per month → opslaan.  
   - Stripe toont daarna een **Price ID** (bijv. `price_1ABC...`). **Kopieer die.**
5. (Optioneel) **Add another price** voor jaarabonnement:  
   - **€15** (of ander bedrag) per month, **billed yearly** → opslaan.  
   - Kopieer ook dit **Price ID**.

**In `.env.local`:**

```env
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxx
STRIPE_PRICE_YEARLY=price_yyyyyyyyyyyy
```

- Als je **geen** jaarprijs wilt: laat `STRIPE_PRICE_YEARLY` leeg of weg. De app gebruikt dan alleen de maandprijs.
- De pricing-pagina toont €19/maand en €15/maand (jaar); de bedragen staan in de frontend, de **Price IDs** bepalen wat er in Stripe wordt gefactureerd.

---

## 3. Webhook instellen

De app moet Stripe-events ontvangen zodat abonnementen in de database (profiles) worden bijgewerkt.

### 3a. Webhook-URL

De route in de app is:

```
POST https://jouwdomein.nl/api/stripe/webhook
```

Lokaal kun je Stripe niet rechtstreeks naar `localhost` laten bellen. Gebruik **Stripe CLI** of **ngrok**:

- **Stripe CLI** (aanbevolen voor lokaal testen):
  ```bash
  stripe listen --forward-to localhost:4000/api/stripe/webhook
  ```
  Stripe toont dan een URL zoals `https://events.stripe.com/...` en een **webhook signing secret** (`whsec_...`). Gebruik dat secret in `.env.local` (zie hieronder).

- **Productie:** gebruik je echte domein, bijv. `https://app.helderly.nl/api/stripe/webhook`.

### 3b. Webhook in Stripe Dashboard

1. **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL:** `https://jouwdomein.nl/api/stripe/webhook` (of de Stripe CLI URL voor lokaal).
3. **Events to send:** kies deze events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Add endpoint**.
5. Open het endpoint → **Signing secret** → **Reveal** → kopieer (begint met `whsec_`).

**In `.env.local`:**

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

Voor lokaal testen met Stripe CLI gebruik je het secret dat de CLI toont (kan anders zijn dan in het Dashboard).

---

## 4. Overzicht env-variabelen

Zet in `.env.local` (of productie):

```env
STRIPE_SECRET_KEY=sk_test_...          # of sk_live_... in productie
STRIPE_PRICE_MONTHLY=price_...        # verplicht
STRIPE_PRICE_YEARLY=price_...         # optioneel (leeg = alleen maand)
STRIPE_WEBHOOK_SECRET=whsec_...       # van Webhooks → jouw endpoint → Signing secret
```

---

## 5. Controleren

1. **Checkout:** Ga in de app naar **Pricing** (of `/pricing`) en klik op “Subscribe”. Je wordt doorgestuurd naar Stripe Checkout. Gebruik testkaart `4242 4242 4242 4242`.
2. **Webhook:** Na een geslaagde testbetaling moet in Supabase bij het profiel van de gebruiker `subscription_status` = `active` en `stripe_customer_id` zijn gezet. Controleer in **Table Editor** → **profiles** of in het **Owner-portal** → Abonnementen.
3. **Portal:** In **Instellingen** (dashboard) staat een knop om het Stripe Customer Portal te openen (facturen, betalingsmethode, abonnement opzeggen). Die werkt als `stripe_customer_id` is gezet.

---

## 6. Testmodus vs live

- **Testmodus:** API-keys met `sk_test_` en `whsec_` van een test-webhook. Geen echte betalingen.
- **Live:** Nieuwe **live** API key in Dashboard, live **Product/prices** aanmaken, live **Webhook** endpoint toevoegen met je productie-URL. Dan `sk_live_...` en het bijbehorende `whsec_...` in je productie-omgeving zetten.

Als iets niet werkt: controleer of de juiste key (test/live) en de juiste Price IDs in de env staan, en of de webhook-URL bereikbaar is (bij productie: HTTPS).
