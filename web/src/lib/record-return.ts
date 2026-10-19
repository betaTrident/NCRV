/** Restrict record return destinations to the two supported list surfaces. */
export function recordReturn(value: unknown): string {
  if (typeof value !== "string" || /[\\\x00-\x20]/.test(value)) return "/records"
  const path = value.split("?")[0]
  return path === "/records" || path === "/calendar" ? value : "/records"
}
