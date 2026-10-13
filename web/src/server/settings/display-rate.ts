import Decimal from "decimal.js"

function displayedHourlyRate(monthlyBasicSalary: string | null): string | null {
  if (monthlyBasicSalary === null || monthlyBasicSalary.trim() === "") {
    return null
  }

  return new Decimal(monthlyBasicSalary)
    .times(12)
    .div(261)
    .div(8)
    .toDecimalPlaces(8, Decimal.ROUND_HALF_UP)
    .toFixed(8)
}

export { displayedHourlyRate }
