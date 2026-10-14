"use client"
import { Drawer as AntDrawer } from "antd"
import { X } from "lucide-react"
import type { ReactNode } from "react"
export function Drawer({title, open, onClose, children}: {title: string; open: boolean; onClose: () => void; children: ReactNode}) { return <AntDrawer title={title} open={open} onClose={onClose} size={420} closeIcon={<X aria-label="Close day details" size={20} />} styles={{section: {maxWidth: "100vw"}}}>{children}</AntDrawer> }
