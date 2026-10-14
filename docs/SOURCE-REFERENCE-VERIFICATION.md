# Cebu 2026 source reference verification

Verified 2026-10-15 against local renders of the supplied PDFs (temporary images were removed after verification):

- `calendar-1.png` from `2026_NCRV_Cebu Calendar.pdf`
- `expectations-3.png` from `New Hire - Setting of Expectations (1).pdf`, page 3

The candidate manifest was independently compared to the calendar image by reading both the holiday table and every grey cutoff/star pay-day marker in each month. The result is 69 events: 21 holidays, 24 payroll cutoffs, and 24 NCPI pay days. No date or label correction was required.

Holiday rows verified: 01-Jan, 17-Feb, 24-Feb, 02-Apr, 03-Apr, 04-Apr, 09-Apr, 01-May, 12-Jun, 06-Aug, 21-Aug, 31-Aug, 09-Sep, 01-Nov, 02-Nov, 30-Nov, 08-Dec, 24-Dec, 25-Dec, 30-Dec, 31-Dec. Regular/special classifications match the `[R]` and `[S]` legend.

The ADP image was compared row-by-row for the 14 non-night rows stored as `reference_codes`: 2251, 2301, 2215, 2235, 2170, 2226, 2240, 2246, 2425, 2535, 2420, 2520, 2430, and 2233. Their source percentages and categories match the image. They remain reference-only with formula status `TBD` and are never inserted into `wage_types`.

Provenance hashes retained in the migration and manifest:

- Calendar SHA-256: `f229a4efdde407f2a17efe44102b71d5d6ee65c8c639024f62f9e18d38eadf09`
- ADP reference SHA-256: `ffde16184f5e545b4203dcddacd4c2ff0de27d14a1345fdc8075e22e221d440c`

This verification covers transcription only. It does not establish payroll formulas, shift classifications, or employer submission behavior.
