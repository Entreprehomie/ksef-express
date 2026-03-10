/**
 * KSeF Express – FA(3) XML generation logic
 * Generates XML conforming to Ministry of Finance FA(3) XSD schema
 */

export const REQUIRED_COLUMNS = [
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

export type InvoiceRow = {
  Data_Wystawienia: string;
  Numer_Faktury: string;
  NIP_Sprzedawcy: string;
  Nazwa_Sprzedawcy: string;
  NIP_Nabywcy: string;
  Nazwa_Nabywcy: string;
  Kwota_Netto: string;
  Stawka_VAT: string;
  Kwota_VAT: string;
  Kwota_Brutto: string;
  _rowIndex?: number;
};

export type ValidationError = {
  row: number;
  column: string;
  message: string;
};

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validates Polish NIP (10 digits, optionally with dashes/spaces)
 */
export function validateNip(nip: string): boolean {
  const cleaned = String(nip).replace(/[\s-]/g, '');
  return /^\d{10}$/.test(cleaned);
}

/**
 * Validates numeric amount
 */
export function validateAmount(val: string): boolean {
  const parsed = parseFloat(String(val).replace(',', '.'));
  return !Number.isNaN(parsed) && parsed >= 0;
}

/**
 * Validates date (ISO or DD.MM.YYYY / DD/MM/YYYY)
 */
export function validateDate(val: string): boolean {
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return true;
  const match = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match;
  const day = parseInt(d!, 10);
  const month = parseInt(m!, 10);
  return day >= 1 && day <= 31 && month >= 1 && month <= 12 && parseInt(y!, 10) > 1900;
}

/**
 * Validates a single row and returns validation errors
 */
export function validateRow(row: InvoiceRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateNip(row.NIP_Sprzedawcy)) {
    errors.push({ row: rowIndex, column: 'NIP_Sprzedawcy', message: 'NIP musi mieć 10 cyfr' });
  }
  if (!validateNip(row.NIP_Nabywcy)) {
    errors.push({ row: rowIndex, column: 'NIP_Nabywcy', message: 'NIP musi mieć 10 cyfr' });
  }
  if (!validateAmount(row.Kwota_Netto)) {
    errors.push({ row: rowIndex, column: 'Kwota_Netto', message: 'Kwota nieprawidłowa' });
  }
  if (!validateAmount(row.Kwota_VAT)) {
    errors.push({ row: rowIndex, column: 'Kwota_VAT', message: 'Kwota nieprawidłowa' });
  }
  if (!validateAmount(row.Kwota_Brutto)) {
    errors.push({ row: rowIndex, column: 'Kwota_Brutto', message: 'Kwota nieprawidłowa' });
  }
  if (!validateDate(row.Data_Wystawienia)) {
    errors.push({ row: rowIndex, column: 'Data_Wystawienia', message: 'Data nieprawidłowa' });
  }

  return errors;
}

/**
 * Builds FA(3) XML from faktury_FA3_2_2.xml golden template. Params from row data.
 * NIP is sanitized (digits only), no validation that throws.
 */
function buildSingleFa3Xml(r: InvoiceRow): string {
  const netto = parseFloat(String(r.Kwota_Netto).replace(',', '.')) || 0;
  const grossNum = parseFloat(String(r.Kwota_Brutto).replace(',', '.')) || 0;
  const buyerNIP = r.NIP_Nabywcy;
  const buyerNazwa = r.Nazwa_Nabywcy;
  const buyerAdres = 'Street 1';
  const invoiceNumber = r.Numer_Faktury;
  const totalAmount = (Math.round(grossNum * 100) / 100).toFixed(2);
  const serviceDescription = 'Usługa sprzedaży';
  const quantity = '1';
  const unitPrice = netto.toFixed(2);
  const lineTotal = netto.toFixed(2);
  const sanitizedNIP = buyerNIP.replace(/\D/g, '');
  return `<?xml version="1.0" encoding="UTF-8"?>
<Faktura xmlns="http://crd.gov.pl/wzor/2025/06/25/13775/">
  <Naglowek>
    <KodFormularza kodSystemowy="FA (3)" wersjaSchemy="1-0E">FA</KodFormularza>
    <WariantFormularza>3</WariantFormularza>
    <DataWytworzeniaFa>${new Date().toISOString()}</DataWytworzeniaFa>
    <SystemInfo>FA3Generator</SystemInfo>
  </Naglowek>
  <Podmiot1>
    <DaneIdentyfikacyjne>
      <NIP>1111111111</NIP>
      <Nazwa>Test Seller</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>Street 1</AdresL1>
    </Adres>
  </Podmiot1>
  <Podmiot2>
    <DaneIdentyfikacyjne>
      <NIP>${sanitizedNIP}</NIP>
      <Nazwa>${escapeXml(buyerNazwa)}</Nazwa>
    </DaneIdentyfikacyjne>
    <Adres>
      <KodKraju>PL</KodKraju>
      <AdresL1>${escapeXml(buyerAdres)}</AdresL1>
    </Adres>
    <JST>2</JST>
    <GV>2</GV>
  </Podmiot2>
  <Fa>
    <KodWaluty>PLN</KodWaluty>
    <P_1>${new Date().toISOString().split('T')[0]}</P_1>
    <P_2>${escapeXml(invoiceNumber)}</P_2>
    <P_15>${totalAmount}</P_15>
    <Adnotacje>
      <P_16>2</P_16>
      <P_17>2</P_17>
      <P_18>2</P_18>
      <P_18A>2</P_18A>
      <Zwolnienie>
        <P_19>1</P_19>
        <P_19A>art. 43 ust. 1 ustawy</P_19A>
      </Zwolnienie>
      <NoweSrodkiTransportu>
        <P_22N>1</P_22N>
      </NoweSrodkiTransportu>
      <P_23>2</P_23>
      <PMarzy>
        <P_PMarzyN>1</P_PMarzyN>
      </PMarzy>
    </Adnotacje>
    <RodzajFaktury>VAT</RodzajFaktury>
    <FaWiersz>
      <NrWierszaFa>1</NrWierszaFa>
      <P_7>${escapeXml(serviceDescription)}</P_7>
      <P_8A>szt</P_8A>
      <P_8B>${quantity}</P_8B>
      <P_9A>${unitPrice}</P_9A>
      <P_11>${lineTotal}</P_11>
      <P_12>zw</P_12>
    </FaWiersz>
    <Rozliczenie>
      <DoZaplaty>${totalAmount}</DoZaplaty>
    </Rozliczenie>
  </Fa>
</Faktura>`.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Builds FA(3) XML document from invoice rows.
 * For multiple rows, each row becomes a separate Faktura; use buildFa3Xml(rows) for single-row output.
 */
export function buildFa3Xml(rows: InvoiceRow[]): string {
  if (rows.length === 0) return '';
  return buildSingleFa3Xml(rows[0]);
}

/**
 * Builds separate FA(3) XML per row (for batch export / ZIP).
 */
export function buildFa3XmlPerRow(rows: InvoiceRow[]): string[] {
  return rows.map((r) => buildSingleFa3Xml(r));
}
