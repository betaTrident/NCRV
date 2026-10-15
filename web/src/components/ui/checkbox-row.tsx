"use client"

import type { ReactNode } from "react"

type CheckboxRowProps = {
  id: string
  name?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
  onCheckedChange?: (checked: boolean) => void
  children: ReactNode
  description?: ReactNode
  "aria-describedby"?: string
}

export function CheckboxRow({ id, name, checked, defaultChecked, disabled, required, onCheckedChange, children, description, ...aria }: CheckboxRowProps) {
  return <label htmlFor={id} className="vx-checkbox-row">
    <input id={id} name={name} type="checkbox" checked={checked} defaultChecked={defaultChecked} disabled={disabled} required={required} onChange={(event) => onCheckedChange?.(event.target.checked)} {...aria} />
    <span><span>{children}</span>{description ? <span className="vx-control-description">{description}</span> : null}</span>
  </label>
}
