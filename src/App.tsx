import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dropzone } from '@/components/Dropzone';
import { Preview } from '@/components/Preview';
import { Paywall } from '@/components/Paywall';
import { Footer } from '@/components/Footer';
import { Success } from '@/pages/Success';
import { Login } from '@/components/Login';
import { validateRow, type InvoiceRow } from '@/lib/ksef-logic';

type Step = 'landing' | 'upload' | 'preview';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [step, setStep] = useState<Step>('landing');
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email ?? '',
            invoiceCount: 0,
            plan: 'none',
            createdAt: serverTimestamp(),
          });
        }
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setPaymentSucceeded(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const hasValidationErrors = rows.some((r, i) =>
    validateRow(r, (r._rowIndex ?? 0) || i + 1).length > 0
  );

  const handleData = (data: InvoiceRow[]) => {
    setRows(data);
    setError(null);
    setStep('preview');
  };

  const handleDropzoneError = (msg: string) => {
    setError(msg);
  };

  const handleCta = () => {
    setStep('upload');
  };

  const handleReset = () => {
    setRows([]);
    setStep('upload');
    setError(null);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gov-blue-50">
        <p className="text-gov-blue-700">Ładowanie...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/success" element={<Success />} />
      <Route path="/*" element={(
    <div className="min-h-screen flex flex-col bg-gov-blue-50">
      <Header user={user} />
      <main className="flex-1">
        {step === 'landing' && (
          <section>
            <Hero />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid sm:grid-cols-3 gap-8 mb-12">
                <FeatureCard
                  title="Prześlij CSV lub Excel"
                  desc="Obsługujemy standardowe kolumny: Data, Numer faktury, NIP, Kwoty netto, VAT, brutto."
                />
                <FeatureCard
                  title="Automatyczna walidacja"
                  desc="Wykrywamy błędy w NIP, datach i kwotach przed eksportem."
                />
                <FeatureCard
                  title="Pobierz gotowy XML"
                  desc="100% zgodność z XSD Ministerstwa Finansów – format FA(3)."
                />
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCta}
                  className="px-8 py-4 bg-gov-blue-600 hover:bg-gov-blue-700 text-white font-semibold rounded-xl shadow-lg transition-colors"
                >
                  Rozpocznij konwersję
                </button>
              </div>
            </div>
          </section>
        )}

        {step === 'upload' && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Dropzone onData={handleData} onError={handleDropzoneError} />
            {error && (
              <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
            )}
          </section>
        )}

        {step === 'preview' && rows.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-gov-blue-600 hover:text-gov-blue-800 font-medium text-sm"
              >
                ← Wybierz inny plik
              </button>
            </div>
            <Preview rows={rows} />
            <Paywall
              rows={rows}
              paymentSucceeded={paymentSucceeded}
            />
            {hasValidationErrors && (
              <p className="text-amber-700 text-sm">
                Uwaga: Niektóre wiersze zawierają błędy. Skoryguj dane w pliku źródłowym przed eksportem.
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
      )} />
    </Routes>
  );
}

function FeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-gov-blue-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gov-blue-900 mb-2">{title}</h3>
      <p className="text-gov-blue-600 text-sm">{desc}</p>
    </div>
  );
}

export default App;
