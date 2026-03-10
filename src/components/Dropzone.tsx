import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import pl from '@/locales/pl.json';
import { REQUIRED_COLUMNS, type InvoiceRow } from '@/lib/ksef-logic';

const ACCEPT = {
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

type DropzoneProps = {
  onData: (rows: InvoiceRow[]) => void;
  onError: (message: string) => void;
};

function parseCsv(file: File): Promise<InvoiceRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete(results) {
        const rows = results.data as Record<string, string>[];
        const normalized = rows.map((r, i) => normalizeRow(r, i + 2));
        resolve(normalized);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

function parseExcel(file: File): Promise<InvoiceRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][];
        if (json.length < 2) {
          resolve([]);
          return;
        }
        const headers = (json[0] ?? []) as string[];
        const rows: InvoiceRow[] = [];
        for (let i = 1; i < json.length; i++) {
          const row = (json[i] ?? []) as unknown[];
          const obj: Record<string, string> = {};
          headers.forEach((h, j) => {
            if (h) obj[h] = row[j] != null ? String(row[j]) : '';
          });
          rows.push(normalizeRow(obj, i + 2));
        }
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

function normalizeRow(r: Record<string, string>, rowIndex: number): InvoiceRow {
  const get = (key: string) => {
    const k = Object.keys(r).find(
      (x) => x.toLowerCase().replace(/\s+/g, '_') === key.toLowerCase().replace(/\s+/g, '_')
    );
    return (k ? r[k] : '') ?? '';
  };
  return {
    Data_Wystawienia: get('Data_Wystawienia'),
    Numer_Faktury: get('Numer_Faktury'),
    NIP_Sprzedawcy: get('NIP_Sprzedawcy'),
    Nazwa_Sprzedawcy: get('Nazwa_Sprzedawcy'),
    NIP_Nabywcy: get('NIP_Nabywcy'),
    Nazwa_Nabywcy: get('Nazwa_Nabywcy'),
    Kwota_Netto: get('Kwota_Netto'),
    Stawka_VAT: get('Stawka_VAT'),
    Kwota_VAT: get('Kwota_VAT'),
    Kwota_Brutto: get('Kwota_Brutto'),
    _rowIndex: rowIndex,
  };
}

function validateHeaders(row: Record<string, string>): boolean {
  const keys = Object.keys(row).map((k) => k.trim().replace(/\s+/g, '_').toLowerCase());
  const required = REQUIRED_COLUMNS.map((c) => c.toLowerCase());
  for (const r of required) {
    const found = keys.some((k) => k === r || k.replace(/[-_]/g, '') === r.replace(/[-_]/g, ''));
    if (!found) return false;
  }
  return true;
}

export function Dropzone({ onData, onError }: DropzoneProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let rows: InvoiceRow[];

        if (ext === 'csv') {
          rows = await parseCsv(file);
        } else if (ext === 'xls' || ext === 'xlsx') {
          rows = await parseExcel(file);
        } else {
          onError(pl.upload.errorFileType);
          return;
        }

        if (rows.length === 0) {
          onError(pl.upload.errorHeaders);
          return;
        }

        const firstRow = rows[0];
        const sample: Record<string, string> = {};
        (Object.keys(firstRow) as (keyof InvoiceRow)[]).forEach((k) => {
          if (k !== '_rowIndex') sample[k] = firstRow[k];
        });
        if (!validateHeaders(sample)) {
          onError(pl.upload.errorHeaders);
          return;
        }

        onData(rows);
      } catch {
        onError(pl.upload.errorHeaders);
      }
    },
    [onData, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive
          ? 'border-gov-blue-500 bg-gov-blue-500/10'
          : 'border-gov-blue-400/60 hover:border-gov-blue-500 hover:bg-gov-blue-500/5'
        }
      `}
    >
      <input {...getInputProps()} />
      <p className="text-gov-blue-800 font-medium">
        {pl.upload.dropzone}
      </p>
      <p className="text-sm text-gov-blue-600 mt-1">{pl.upload.acceptTypes}</p>
    </div>
  );
}
