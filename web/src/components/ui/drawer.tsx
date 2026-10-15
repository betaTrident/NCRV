"use client"
import { Drawer as AntDrawer } from "antd"
import { X } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

type DrawerProps = Omit<ComponentProps<typeof AntDrawer>, "title" | "open" | "onClose" | "children" | "closeIcon"> & {
  title: ReactNode
  open: boolean
  onClose: () => void
  children: ReactNode
  closeLabel?: string
}

export function Drawer({ title, open, onClose, children, closeLabel = "Close drawer", ...props }: DrawerProps) {
  return <AntDrawer {...props} title={title} open={open} onClose={onClose} size={420} closeIcon={<X aria-label={closeLabel} size={20} />} styles={{ section: { maxWidth: "100vw" }, ...props.styles }}>{children}</AntDrawer>
}
