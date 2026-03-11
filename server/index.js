/**
 * Backend for Stripe Checkout – subscription tiers (Starter / Unlimited)
 * Loads STRIPE_SECRET_KEY and price IDs from project root .env
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const ALLOWED_PRICE_IDS = [
  process.env.STRIPE_PRICE_STARTER,
  process.env.STRIPE_PRICE_UNLIMITED,
].filter(Boolean);

function createCheckoutSession(body) {
  const { successUrl, cancelUrl, priceId } = body || {};
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripePriceId = priceId && ALLOWED_PRICE_IDS.includes(priceId) ? priceId : ALLOWED_PRICE_IDS[0];
  const mode = 'subscription';
  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const success_url = successUrl != null && successUrl !== '' ? successUrl : `${frontendOrigin}/success`;
  const cancel_url = cancelUrl != null && cancelUrl !== '' ? cancelUrl : frontendOrigin;

  if (!stripeSecret) {
    return Promise.resolve({ error: 'Missing STRIPE_SECRET_KEY' });
  }
  if (!stripePriceId) {
    return Promise.resolve({ error: 'Missing or invalid priceId; configure STRIPE_PRICE_STARTER and STRIPE_PRICE_UNLIMITED' });
  }

  console.log('Stripe success_url:', success_url);
  console.log('Stripe cancel_url:', cancel_url);
  console.log('Current Mode being sent to Stripe: subscription');
  return fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${stripeSecret}`,
    },
    body: new URLSearchParams({
      'mode': mode,
      'line_items[0][price]': stripePriceId,
      'line_items[0][quantity]': '1',
      'locale': 'pl',
      'success_url': success_url,
      'cancel_url': cancel_url,
    }).toString(),
  })
    .then((res) => res.json())
    .then((data) => (data.url ? { url: data.url } : { error: data.error?.message || 'Failed to create session' }))
    .catch((err) => ({ error: err.message }));
}

app.post('/api/create-checkout-session', async (req, res) => {
  console.log('Backend hit!');
  const result = await createCheckoutSession(req.body);
  console.log('Stripe response:', JSON.stringify(result));
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Stripe Checkout API running on http://localhost:${PORT}`);
});
