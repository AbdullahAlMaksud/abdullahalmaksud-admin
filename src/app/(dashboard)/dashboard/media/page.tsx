"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { MediaManager } from "@/components/modules/media/media-manager"
import { PageSubHeader } from "@/components/dashboard-01/components/sticky-action-bar"

export default function MediaPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description={t("media.subtitle")}
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6 w-full">
        <MediaManager />
      </div>
    </div>
  )
}
