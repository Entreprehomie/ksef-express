# FA(3) Schema Audit – KSeF Express

## Audit Date
March 9, 2026

## Cross-Reference Against FA(3) Requirements

### Podmiot1 (Seller)
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| NIP | ✓ | ✓ Present | 10 digits, inside DaneIdentyfikacyjne |
| Nazwa | ✓ | ✓ Present | Seller name |
| Adres | ✓ | ✓ Present | KodKraju=PL (minimal address) |

### Podmiot2 (Buyer)
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| NIP | ✓ | ✓ Present | 10 digits, formatted via getNipDigits() |
| Nazwa | ✓ | ✓ Present | Buyer company name |
| Adres | ✓ | ✓ Present | KodKraju=PL |

### FaWiersz (Invoice Line)
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| P_7 (Description) | ✓ | ✓ Present | "Usługa sprzedaży" (placeholder) |
| P_8A (Unit) | ✓ | ✓ Present | "szt" |
| P_8B (Quantity) | ✓ | ✓ Present | 1 |
| P_9A (Net price) | ✓ | ✓ Present | From Kwota_Netto |

### Totals (Rozliczenie)
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| P_13_1 (Net total) | ✓ | ✓ Present | In Rozliczenie |
| P_14_1 (VAT total) | ✓ | ✓ Present | In Rozliczenie |
| P_15 (Gross total) | ✓ | ✓ Present | In Fa |

### Naglowek
| Field | Required | Status | Notes |
|-------|----------|--------|-------|
| KodFormularza | ✓ | ✓ | kodSystemowy="FA (3)" |
| WariantFormularza | ✓ | ✓ | 3 |
| DataWytworzeniaFa | ✓ | ✓ | YYYY-MM-DDTHH:MM:SSZ |

## Test Output
See `test-output-fa3.xml` for a sample generated XML with all mandatory fields.

## Placeholders Used
- **P_7**: "Usługa sprzedaży" – generic description when CSV has no line-item data
- **P_8A**: "szt" – standard unit
- **P_8B**: 1 – single line per invoice from CSV row
