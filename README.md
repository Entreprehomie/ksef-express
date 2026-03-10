# KSeF Express

Konwertuj CSV/Excel na FA(3) XML zgodnie z wymogami KSeF od 1 kwietnia 2026.

## Wymagane kolumny

- `Data_Wystawienia`
- `Numer_Faktury`
- `NIP_Sprzedawcy`
- `Nazwa_Sprzedawcy`
- `NIP_Nabywcy`
- `Nazwa_Nabywcy`
- `Kwota_Netto`
- `Stawka_VAT`
- `Kwota_VAT`
- `Kwota_Brutto`

## Uruchomienie

```bash
npm install
npm run dev
```

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i uzupełnij:

- `VITE_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key
- `VITE_STRIPE_PRICE_ID` – ID ceny 115 PLN (Stripe)
- `VITE_API_URL` – URL backendu tworzącego sesję Checkout (np. `https://api.example.com/api/create-checkout-session`)

## Backend (Stripe Checkout)

Uruchom przykładowy serwer:

```bash
STRIPE_SECRET_KEY=sk_xxx STRIPE_PRICE_ID=price_xxx node server/index.js
```

Lub skonfiguruj własny endpoint zgodny z `server/index.js`.
