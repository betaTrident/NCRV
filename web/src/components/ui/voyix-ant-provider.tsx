"use client"

import { ConfigProvider } from "antd"
import type { ReactNode } from "react"
import { voyixTokens } from "./voyix-ant-theme"

export function VoyixAntProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider wave={{ disabled: true }} theme={{ cssVar: { key: "voyix" }, token: voyixTokens, components: { Button: { primaryShadow: "none", defaultShadow: "none" }, Modal: { borderRadiusLG: 14 }, Drawer: { footerPaddingBlock: 16 } } }}>{children}</ConfigProvider>
}
