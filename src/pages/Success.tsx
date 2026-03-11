import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { buildFa3Xml, buildFa3XmlPerRow, type InvoiceRow } from '@/lib/ksef-logic';
import { auth, db } from '@/lib/firebase';

const STORAGE_KEY = 'ksef_export_rows';
const FILE_NAME = 'faktury_FA3';

async function incrementUserInvoiceCount() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { invoiceCount: increment(1) });
}

function doDownload(rows: InvoiceRow[]) {
  if (rows.length === 1) {
    const xml = buildFa3Xml(rows);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    saveAs(blob, `${FILE_NAME}.xml`, { autoBom: false });
  } else if (rows.length > 1) {
    const zip = new JSZip();
    const xmls = buildFa3XmlPerRow(rows);
    xmls.forEach((xml, i) => {
      zip.file(`${FILE_NAME}_${i + 1}.xml`, xml);
    });
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      saveAs(blob, `${FILE_NAME}.zip`);
    });
  }
  incrementUserInvoiceCount();
}

export function Success() {
  const [rows, setRows] = useState<InvoiceRow[] | null>(null);
  const [autoDownloadDone, setAutoDownloadDone] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as InvoiceRow[];
        setRows(parsed);
      }
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    if (rows && rows.length > 0 && !autoDownloadDone) {
      try {
        doDownload(rows);
        setAutoDownloadDone(true);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to generate invoice');
      }
    }
  }, [rows, autoDownloadDone]);

  const handleDownload = () => {
    if (rows && rows.length > 0) {
      try {
        doDownload(rows);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to generate invoice');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gov-blue-50 to-gov-blue-100 px-4">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 text-white mb-6 animate-bounce">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gov-blue-900 mb-3">
          Płatność zakończona pomyślnie!
        </h1>
        <p className="text-gov-blue-700 text-lg mb-8">
          Dziękujemy za skorzystanie z KSeF Express. Twój plik XML FA(3) jest gotowy do pobrania.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {rows && rows.length > 0 && (
            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
            >
              Pobierz XML
            </button>
          )}
          <Link
            to="/"
            className="px-6 py-3 bg-gov-blue-600 hover:bg-gov-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
          >
            Powrót
          </Link>
        </div>
      </div>
    </div>
  );
}
