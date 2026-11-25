"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { MessagesView } from "@/components/modules/messages/messages-view"
import { PageSubHeader } from "@/components/dashboard-01/components/sticky-action-bar"

export default function MessagesPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description={t("messages.subtitle")}
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6 w-full">
        <MessagesView />
      </div>
    </div>
  )
}
