import { WageCodeChip } from "@/components/shift/wage-code-chip"
import { Panel } from "@/components/shell/panel"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { WageCatalogRow } from "@/server/queries/settings"

type WageCatalogProps = {
  wages: WageCatalogRow[]
}

const HEADER_CLASS =
  "h-10 font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase"

const CATEGORY_LABELS: Record<string, string> = {
  REGULAR_WORK_DAY: "Regular Work Day",
  REST_DAY: "Rest Day",
  SPECIAL_PUBLIC_HOLIDAY: "Special Public Holiday",
  SPECIAL_PUBLIC_HOLIDAY_REST_DAY: "Special Public Holiday + Rest Day",
  REGULAR_PUBLIC_HOLIDAY: "Regular/Public Holiday",
  REGULAR_PUBLIC_HOLIDAY_REST_DAY: "Regular/Public Holiday + Rest Day",
  DOUBLE_REGULAR_HOLIDAY: "Double Regular Holiday",
  DOUBLE_REGULAR_HOLIDAY_REST_DAY: "Double Regular Holiday + Rest Day",
}

const HOURS_LABELS: Record<string, string> = {
  FIRST_8: "First 8 hours",
  EXCESS: "Excess",
}

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

function hoursLabel(hoursCategory: string): string {
  return HOURS_LABELS[hoursCategory] ?? hoursCategory
}

function percentageLabel(percentage: string): string {
  return percentage.endsWith("%") ? percentage : `${percentage}%`
}

function WageCatalog({ wages }: WageCatalogProps) {
  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">
          ADP wage reference
        </h2>
        <p className="max-w-prose text-sm text-[var(--vx-muted)]">
          Read only. Code 2211 is the only confirmed money formula. Every other
          formula stays TBD. This list cannot be edited here.
        </p>
        {wages.length === 0 ? (
          <p className="text-sm text-[var(--vx-ink-soft)]">
            No wage types are configured.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="caption-top">
              <TableCaption className="mt-0 mb-3 text-left text-sm text-[var(--vx-muted)]">
                Configured wage types
              </TableCaption>
              <TableHeader>
                <TableRow className="border-[var(--vx-line)] hover:bg-transparent">
                  <TableHead scope="col" className={HEADER_CLASS}>
                    Code
                  </TableHead>
                  <TableHead scope="col" className={HEADER_CLASS}>
                    Category
                  </TableHead>
                  <TableHead scope="col" className={HEADER_CLASS}>
                    Hours
                  </TableHead>
                  <TableHead
                    scope="col"
                    className={`${HEADER_CLASS} text-right`}
                  >
                    Percentage
                  </TableHead>
                  <TableHead scope="col" className={HEADER_CLASS}>
                    Formula
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wages.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[var(--vx-line)] hover:bg-transparent"
                  >
                    <TableCell>
                      <WageCodeChip
                        code={row.code}
                        tbd={row.formulaLabel === "Formula TBD"}
                      />
                    </TableCell>
                    <TableCell className="text-[var(--vx-ink-soft)]">
                      {categoryLabel(row.category)}
                    </TableCell>
                    <TableCell className="text-[var(--vx-ink-soft)]">
                      {hoursLabel(row.hoursCategory)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--vx-ink)]">
                      {percentageLabel(row.percentage)}
                    </TableCell>
                    <TableCell className="text-[var(--vx-ink-soft)]">
                      {row.formulaLabel}
                      {row.active ? null : " Inactive"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Panel>
  )
}

export { WageCatalog }
export type { WageCatalogProps }
