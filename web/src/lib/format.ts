export function formatPhp(centavos: number): string {
  if (!Number.isSafeInteger(centavos)) {
    throw new Error("Centavos must be a safe integer.")
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(centavos / 100)
}
