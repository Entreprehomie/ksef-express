import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import pl from '@/locales/pl.json';
import { buildFa3Xml, buildFa3XmlPerRow, type InvoiceRow } from '@/lib/ksef-logic';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type PaywallProps = {
  rows: InvoiceRow[];
  paymentSucceeded: boolean;
};

function PaywallContent({ rows, paymentSucceeded }: PaywallProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId,
            successUrl: `${window.location.origin}/success`,
            cancelUrl: `${window.location.origin}/`,
          }),
        }
      );
      const data = await res.json();
      const { url } = data;
      console.log('Redirecting to:', url);
      if (url) {
        try {
          sessionStorage.setItem('ksef_export_rows', JSON.stringify(rows));
        } catch {
          /* ignore storage errors */
        }
        window.location.href = url;
      } else {
        console.error('No redirect URL in response:', data);
        throw new Error(data.error || 'No checkout URL');
      }
    } catch {
      setLoading(null);
    }
  };

  const handleDownload = () => {
    const fileName = pl.export.fileName;
    if (rows.length === 1) {
      const xml = buildFa3Xml(rows);
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      saveAs(blob, `${fileName}.xml`);
    } else {
      const zip = new JSZip();
      const xmls = buildFa3XmlPerRow(rows);
      xmls.forEach((xml, i) => {
        zip.file(`${fileName}_${i + 1}.xml`, xml);
      });
      zip.generateAsync({ type: 'blob' }).then((blob) => {
        saveAs(blob, `${fileName}.zip`);
      });
    }
  };

  if (paymentSucceeded) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-800 font-medium mb-4">{pl.paywall.success}</p>
        <button
          type="button"
          onClick={handleDownload}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          {pl.paywall.downloadButton}
        </button>
      </div>
    );
  }

  const starterPriceId = import.meta.env.VITE_STRIPE_PRICE_STARTER;
  const unlimitedPriceId = import.meta.env.VITE_STRIPE_PRICE_UNLIMITED;

  return (
    <div className="rounded-xl border border-gov-blue-200 bg-white p-6 sm:p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-gov-blue-900 mb-2">
        {pl.paywall.title}
      </h3>
      <p className="text-gov-blue-700 mb-6">
        Wybierz plan subskrypcji poniżej. Płatność nastąpi dopiero po kliknięciu wybranego planu.
      </p>
      <div className="grid sm:grid-cols-2 gap-6 min-h-0">
        <div className="rounded-lg border border-gov-blue-200 bg-gov-blue-50/50 p-5 flex flex-col">
          <h4 className="font-semibold text-gov-blue-900 mb-1">Starter — 119 PLN/miesiąc</h4>
          <p className="text-2xl font-bold text-gov-blue-800 mb-2">119 PLN<span className="text-sm font-normal text-gov-blue-600">/miesiąc</span></p>
          <p className="text-sm text-gov-blue-700 mb-4">Do 50 faktur miesięcznie</p>
          <button
            type="button"
            onClick={() => starterPriceId && handleCheckout(starterPriceId)}
            disabled={!!loading || !starterPriceId}
            className="w-full mt-auto px-4 py-3 bg-gov-blue-600 hover:bg-gov-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
          >
            {loading === starterPriceId ? pl.paywall.processing : 'Wybierz Starter'}
          </button>
        </div>
        <div className="rounded-lg border border-gov-blue-200 bg-white p-5 flex flex-col ring-1 ring-gov-blue-200">
          <h4 className="font-semibold text-gov-blue-900 mb-1">Unlimited — 239 PLN/miesiąc</h4>
          <p className="text-2xl font-bold text-gov-blue-800 mb-2">239 PLN<span className="text-sm font-normal text-gov-blue-600">/miesiąc</span></p>
          <p className="text-sm text-gov-blue-700 mb-4">Nieograniczona liczba faktur</p>
          <button
            type="button"
            onClick={() => unlimitedPriceId && handleCheckout(unlimitedPriceId)}
            disabled={!!loading || !unlimitedPriceId}
            className="w-full mt-auto px-4 py-3 bg-gov-blue-600 hover:bg-gov-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
          >
            {loading === unlimitedPriceId ? pl.paywall.processing : 'Wybierz Unlimited'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Paywall(props: PaywallProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
        Brak klucza Stripe (VITE_STRIPE_PUBLISHABLE_KEY). Dodaj go do pliku .env.
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <PaywallContent {...props} />
    </Elements>
  );
}
