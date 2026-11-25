"use client"

import React, { useCallback } from "react"
import { getDesignById } from "@/lib/api/designs"
import type { Design } from "@/lib/api/types"
import { EntityEditLoader } from "@/components/modules/shared/entity-edit-loader"
import { DesignEditorForm } from "@/components/modules/designs/design-editor-form"

export default function EditDesignPage() {
  const fetchDesign = useCallback(async (id: string): Promise<Design | null> => {
    const res = await getDesignById(id)
    const candidate = (res as unknown as { data?: Design })?.data ?? res
    return candidate && candidate.title ? candidate : null
  }, [])

  return (
    <EntityEditLoader backHref="/dashboard/designs" entityLabel="Design" fetcher={fetchDesign}>
      {(design) => <DesignEditorForm design={design} mode="edit" />}
    </EntityEditLoader>
  )
}
