type EstimateNoteProps = Record<string, never>

/**
 * Fixed estimate disclaimer. The sentence is the contract.
 */
function EstimateNote(_props?: EstimateNoteProps) {
  return (
    <p className="text-sm text-[var(--vx-muted)]">
      Estimate only — confirm your payroll rule before relying on this amount.
    </p>
  )
}

export { EstimateNote }
export type { EstimateNoteProps }
