import { useMemo } from 'react';
import pl from '@/locales/pl.json';
import {
  type InvoiceRow,
  type ValidationError,
  validateRow,
} from '@/lib/ksef-logic';

type PreviewProps = {
  rows: InvoiceRow[];
};

export function Preview({ rows }: PreviewProps) {
  const { errors, errorSet } = useMemo(() => {
    const errs: ValidationError[] = [];
    rows.forEach((r, i) => {
      errs.push(...validateRow(r, (r._rowIndex ?? 0) || i + 1));
    });
    const set = new Set(errs.map((e) => `${e.row}-${e.column}`));
    return { errors: errs, errorSet: set };
  }, [rows]);

  const cols = [
    'Data_Wystawienia',
    'Numer_Faktury',
    'NIP_Sprzedawcy',
    'Nazwa_Sprzedawcy',
    'NIP_Nabywcy',
    'Nazwa_Nabywcy',
    'Kwota_Netto',
    'Stawka_VAT',
    'Kwota_VAT',
    'Kwota_Brutto',
  ] as const;

  return (
    <div className="rounded-xl border border-gov-blue-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-gov-blue-50 border-b border-gov-blue-200 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gov-blue-900">{pl.preview.title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gov-blue-700">
            {pl.preview.rowsCount}: <strong>{rows.length}</strong>
          </span>
          {errors.length > 0 ? (
            <span className="text-red-600 font-medium">{pl.preview.hasErrors}</span>
          ) : (
            <span className="text-green-700 font-medium">{pl.preview.noErrors}</span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gov-blue-100 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gov-blue-800 whitespace-nowrap">
                #
              </th>
              {cols.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2 text-left font-medium text-gov-blue-800 whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((row, i) => (
              <tr
                key={i}
                className="border-t border-gov-blue-100 hover:bg-gov-blue-50/50"
              >
                <td className="px-3 py-2 text-gov-blue-600 font-mono">
                  {(row._rowIndex ?? 0) || i + 1}
                </td>
                {cols.map((col) => {
                  const key = `${(row._rowIndex ?? 0) || i + 1}-${col}`;
                  const hasError = errorSet.has(key);
                  return (
                    <td
                      key={col}
                      className={`px-3 py-2 ${hasError ? 'bg-red-100 text-red-800' : ''}`}
                    >
                      {String(row[col] ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 50 && (
          <p className="text-center py-2 text-gov-blue-600 text-sm bg-gov-blue-50">
            Wyświetlono pierwsze 50 z {rows.length} wierszy
          </p>
        )}
      </div>
    </div>
  );
}
