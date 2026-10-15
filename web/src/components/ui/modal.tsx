"use client"

import { Modal as AntModal } from "antd"
import { X } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

type ModalProps = Omit<ComponentProps<typeof AntModal>, "title" | "open" | "onCancel" | "children" | "closeIcon"> & {
  title: ReactNode
  open: boolean
  onClose: () => void
  children: ReactNode
  closeLabel?: string
}

export function Modal({ title, open, onClose, children, closeLabel = "Close dialog", ...props }: ModalProps) {
  return <AntModal {...props} title={title} open={open} onCancel={onClose} focusable={{ trap: true, focusTriggerAfterClose: true }} closeIcon={<X aria-label={closeLabel} size={20} />} styles={{ close: { width: 44, height: 44 }, ...props.styles }}>{children}</AntModal>
}
