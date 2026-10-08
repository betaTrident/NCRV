import { cloneElement, isValidElement, type ReactNode } from "react"
import { Label } from "@/components/ui/label"

type FieldProps = {
  label: string
  htmlFor: string
  helper?: string
  error?: string
  children: ReactNode
}

type DescribedControlProps = {
  id?: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  "aria-describedby"?: string
}

function mergeDescribedBy(...ids: Array<string | undefined>) {
  const merged = ids.filter((id): id is string => Boolean(id)).join(" ")
  return merged.length > 0 ? merged : undefined
}

function Field({ label, htmlFor, helper, error, children }: FieldProps) {
  const helperId = helper ? `${htmlFor}-helper` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  const describedBy = mergeDescribedBy(errorId, helperId)

  const control = isValidElement<DescribedControlProps>(children)
    ? cloneElement(children, {
        id: children.props.id ?? htmlFor,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": mergeDescribedBy(
          describedBy,
          children.props["aria-describedby"],
        ),
      })
    : children

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {helper ? (
        <p id={helperId} className="text-xs text-[var(--vx-muted)]">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-[var(--vx-rose)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Field }
export type { FieldProps }
