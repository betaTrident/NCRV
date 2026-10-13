# Extractable components

## Layout Components

## AppShell
- Source: `src/components/shell/app-shell.tsx`
- Category: layout
- Description: Authenticated shell with desktop rail, top bar, mobile bottom navigation, and main landmark.
- Extractable props: `activeItem` (derived from pathname), `showPrivacyIndicator` (boolean), `addShiftHref` (string)
- Hardcoded: wordmark, navigation labels/icons, rail/top-bar/bottom-bar CSS, Add shift label.

## AuthSplit
- Source: `src/components/shell/auth-split.tsx`
- Category: layout
- Description: Responsive deep-purple story column with a centered auth form column.
- Extractable props: `title` (string), `description` (string), `children`
- Hardcoded: wordmark, privacy framing, all layout CSS.

## PageHeader
- Source: `src/components/shell/page-header.tsx`
- Category: layout
- Description: Standard page eyebrow, H1, explanation, and optional right-aligned action.
- Extractable props: `eyebrow`, `title`, `description`, `action`
- Hardcoded: type hierarchy, divider, page-enter class, spacing.

## Basic Components

## Button
- Source: `src/components/ui/button.tsx`
- Category: basic
- Description: Primary, outline, and quiet action control.
- Extractable props: `variant` (primary | outline | quiet), `size` (default | icon), `asChild`
- Hardcoded: control sizing, focus ring, hover and active treatments.

## Panel
- Source: `src/components/shell/panel.tsx`
- Category: basic
- Description: Product-standard paper surface for content groups.
- Extractable props: `className`
- Hardcoded: white surface, line border, 14px radius, modest shadow.

## Field
- Source: `src/components/forms/field.tsx`
- Category: basic
- Description: Persistent-label form wrapper with helper/error and ARIA wiring.
- Extractable props: `label`, `helper`, `error`, `htmlFor`
- Hardcoded: label/control/helper ordering and text treatments.

## StatusLine
- Source: `src/components/forms/status-line.tsx`
- Category: basic
- Description: Explicit estimate, pending, saved, or error status with icon and text.
- Extractable props: `tone` (estimate | pending | saved | error)
- Hardcoded: tone copy, icons, colors, and pill geometry.

## EmptyState
- Source: `src/components/shell/empty-state.tsx`
- Category: basic
- Description: Quiet empty-state panel with explanation and one optional action.
- Extractable props: `title`, `description`, `action`
- Hardcoded: no icon tile, panel spacing, text hierarchy.

## WageCodeChip
- Source: `src/components/shift/wage-code-chip.tsx`
- Category: basic
- Description: Compact mono wage-code tag that makes unresolved status explicit.
- Extractable props: `code`, `tbd`
- Hardcoded: purple and amber token treatments, visible TBD text.

## Metric
- Source: `src/components/records/metric.tsx`
- Category: basic
- Description: Overview metric card with mono label and tabular value.
- Extractable props: `label`, `value`, `detail`
- Hardcoded: Panel composition, typography, and spacing.

## PeriodBanner
- Source: `src/components/records/period-banner.tsx`
- Category: basic
- Description: Payroll-period summary banner for overview contexts.
- Extractable props: `periodStart`, `periodEnd`, `cutoffLabel`
- Hardcoded: deep-purple surface and uppercase mono eyebrow.

## Ledger
- Source: `src/components/records/ledger.tsx`
- Category: basic
- Description: Reusable responsive tabular ledger with a precise empty state.
- Extractable props: `caption`, `columns`, `rows`, `empty`
- Hardcoded: table heading style, numeric alignment, overflow behavior.

