import Decimal from "decimal.js"

export type SummaryLine = {
  amountStatus: "estimated" | "tbd"
  centavos: number | null
}

export type SummaryRecord = {
  id: string
  ndHours: string
  lines: SummaryLine[]
}

export type PeriodCandidate = {
  id: string
  periodStart: string
  periodEnd: string
  payDate: string | null
  cutoffDate: string | null
  cutoffTime: string | null
  active: boolean
}

export type CurrentPeriod =
  | { status: "none" }
  | { status: "overlap" }
  | { status: "current"; period: PeriodCandidate }

export type PeriodSummary = {
  totalNdHours: string
  estimatedCentavos: number
  entryCount: number
  tbdLineCount: number
}

function coversToday(period: PeriodCandidate, today: string): boolean {
  return period.periodStart <= today && today <= period.periodEnd
}

export function resolveCurrentPeriod(
  periods: PeriodCandidate[],
  today: string,
): CurrentPeriod {
  const matches = periods.filter(
    (period) => period.active && coversToday(period, today),
  )

  if (matches.length === 0) {
    return { status: "none" }
  }

  if (matches.length === 1) {
    return { status: "current", period: matches[0]! }
  }

  return { status: "overlap" }
}

function estimatedCentavosOf(line: SummaryLine): number {
  if (
    line.amountStatus !== "estimated" ||
    line.centavos === null ||
    !Number.isInteger(line.centavos)
  ) {
    return 0
  }

  return line.centavos
}

export function recordAmount(record: SummaryRecord): {
  estimatedCentavos: number
  hasTbd: boolean
} {
  let estimatedCentavos = 0
  let hasTbd = false

  for (const line of record.lines) {
    if (line.amountStatus === "tbd") {
      hasTbd = true
      continue
    }

    estimatedCentavos += estimatedCentavosOf(line)
  }

  return { estimatedCentavos, hasTbd }
}

function uniqueRecords(records: SummaryRecord[]): SummaryRecord[] {
  const seen = new Map<string, SummaryRecord>()

  for (const record of records) {
    if (!seen.has(record.id)) {
      seen.set(record.id, record)
    }
  }

  return [...seen.values()]
}

function formatHours(value: Decimal): string {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
}

export function summarizeRecords(records: SummaryRecord[]): PeriodSummary {
  const unique = uniqueRecords(records)
  let totalNdHours = new Decimal(0)
  let estimatedCentavos = 0
  let tbdLineCount = 0

  for (const record of unique) {
    totalNdHours = totalNdHours.plus(new Decimal(record.ndHours))
    estimatedCentavos += recordAmount(record).estimatedCentavos

    for (const line of record.lines) {
      if (line.amountStatus === "tbd") {
        tbdLineCount += 1
      }
    }
  }

  return {
    totalNdHours: formatHours(totalNdHours),
    estimatedCentavos,
    entryCount: unique.length,
    tbdLineCount,
  }
}
