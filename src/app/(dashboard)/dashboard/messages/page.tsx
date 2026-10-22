"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MessagesView } from "@/components/modules/messages/messages-view"

export default function MessagesPage() {
  const { t } = useTranslation()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6 max-w-7xl">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {t("messages.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("messages.subtitle")}
            </p>
          </div>

          <MessagesView />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
