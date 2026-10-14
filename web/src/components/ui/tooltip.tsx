"use client"
import { Tooltip as AntTooltip } from "antd"
import type { ReactElement } from "react"
export function Tooltip({title, children}: {title: string; children: ReactElement}) { return <AntTooltip title={title} trigger={["hover", "focus"]}>{children}</AntTooltip> }
