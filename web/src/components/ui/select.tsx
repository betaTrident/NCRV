"use client"

import { Select as AntSelect } from "antd"
import { ChevronDown } from "lucide-react"
import type { AriaAttributes } from "react"

type SelectProps = Pick<AriaAttributes, "aria-invalid" | "aria-describedby" | "aria-labelledby" | "aria-label" | "aria-required"> & { id?: string; name?: string; value: string; onValueChange: (value: string) => void; options: {value: string; label: string}[]; className?: string; disabled?: boolean }
export function Select({ name, onValueChange, ...props }: SelectProps) {
  return <><AntSelect {...props} virtual={false} onChange={onValueChange} suffixIcon={<ChevronDown size={16} aria-hidden="true" />} style={{ width: "100%", minHeight: 44 }} />{name ? <input type="hidden" name={name} value={props.value} disabled={props.disabled} /> : null}</>
}
