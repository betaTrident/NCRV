/**
 * Fixed estimate disclaimer. The sentence is the contract.
 */
function EstimateNote() {
  return (
    <p className="text-sm text-[var(--vx-muted)]">
      Estimate only — confirm your payroll rule before relying on this amount.
    </p>
  )
}

export { EstimateNote }
