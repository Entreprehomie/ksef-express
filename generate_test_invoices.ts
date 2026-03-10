/**
 * Generates 4 test FA(3) XML files using the validated buildFa3Xml function.
 * Does not modify ksef-logic.ts or any core XML generation code.
 *
 * Run: npx tsx generate_test_invoices.ts
 * Or:  npm run generate:test-invoices
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { buildFa3Xml, type InvoiceRow } from './src/lib/ksef-logic.ts';

const OUT_DIR = join(process.cwd(), 'test-outputs');

const mockPayloads: { name: string; row: InvoiceRow }[] = [
  {
    name: 'Standard B2B (23% VAT)',
    row: {
      Data_Wystawienia: '2025-03-15',
      Numer_Faktury: 'FA/2025/001',
      NIP_Sprzedawcy: '5213776394',
      Nazwa_Sprzedawcy: 'Sprzedawca Sp. z o.o.',
      NIP_Nabywcy: '2222222222',
      Nazwa_Nabywcy: 'Nabywca S.A.',
      Kwota_Netto: '100.00',
      Stawka_VAT: '23',
      Kwota_VAT: '23.00',
      Kwota_Brutto: '123.00',
    },
  },
  {
    name: 'VAT Exempt (ZW)',
    row: {
      Data_Wystawienia: '2025-03-16',
      Numer_Faktury: 'FA/2025/002',
      NIP_Sprzedawcy: '5213776394',
      Nazwa_Sprzedawcy: 'Sprzedawca Sp. z o.o.',
      NIP_Nabywcy: '2222222222',
      Nazwa_Nabywcy: 'Nabywca S.A.',
      Kwota_Netto: '100.00',
      Stawka_VAT: 'ZW',
      Kwota_VAT: '0.00',
      Kwota_Brutto: '100.00',
    },
  },
  {
    name: 'Reverse Charge (NP)',
    row: {
      Data_Wystawienia: '2025-03-17',
      Numer_Faktury: 'FA/2025/003',
      NIP_Sprzedawcy: '5213776394',
      Nazwa_Sprzedawcy: 'Sprzedawca Sp. z o.o.',
      NIP_Nabywcy: '2222222222',
      Nazwa_Nabywcy: 'Nabywca S.A.',
      Kwota_Netto: '500.00',
      Stawka_VAT: 'NP',
      Kwota_VAT: '0.00',
      Kwota_Brutto: '500.00',
    },
  },
  {
    name: 'Foreign Currency (EUR → PLN equivalent)',
    row: {
      Data_Wystawienia: '2025-03-18',
      Numer_Faktury: 'FA/2025/004',
      NIP_Sprzedawcy: '5213776394',
      Nazwa_Sprzedawcy: 'Sprzedawca Sp. z o.o.',
      NIP_Nabywcy: '2222222222',
      Nazwa_Nabywcy: 'Nabywca S.A.',
      Kwota_Netto: '432.00',
      Stawka_VAT: '23',
      Kwota_VAT: '99.36',
      Kwota_Brutto: '531.36',
    },
  },
];

const outputFiles = [
  'test_standard.xml',
  'test_exempt.xml',
  'test_reverse_charge.xml',
  'test_currency.xml',
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (let i = 0; i < mockPayloads.length; i++) {
    const { name, row } = mockPayloads[i];
    const xml = buildFa3Xml([row]);
    const filePath = join(OUT_DIR, outputFiles[i]);
    await writeFile(filePath, xml, 'utf-8');
    console.log(`Generated ${outputFiles[i]} (${name})`);
  }

  console.log(`\nAll 4 files written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
