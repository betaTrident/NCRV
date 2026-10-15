"use client"

import { useEffect, useState } from "react"
import { DateTime } from "luxon"

import { Drawer } from "@/components/ui/drawer"
import type { WeekShiftDraft } from "@/server/shift/week-entry"
import type { ShiftFieldErrors } from "@/server/shift/parse-shift-entry"

import { WeekDayEditor } from "./week-day-editor"

type WeekDayEditorDrawerProps = {
  row: WeekShiftDraft | null
  errors?: ShiftFieldErrors
  onClose: () => void
  onUpdate: (patch: Partial<WeekShiftDraft>) => void
}

function WeekDayEditorDrawer({ row, errors, onClose, onUpdate }: WeekDayEditorDrawerProps) {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const sync = () => setMobile(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  if (!mobile) return null
  return (
    <Drawer title={row ? `Edit ${DateTime.fromISO(row.workDate).toFormat("ccc, MMM d")}` : "Edit shift"} open={row !== null} onClose={onClose}>
      {row ? <WeekDayEditor row={row} errors={errors} onUpdate={onUpdate} /> : null}
    </Drawer>
  )
}

export { WeekDayEditorDrawer }
export type { WeekDayEditorDrawerProps }
