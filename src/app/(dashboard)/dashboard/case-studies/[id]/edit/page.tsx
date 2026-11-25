"use client"

import React, { useCallback } from "react"
import { getCaseStudyById } from "@/lib/api/case-studies"
import type { CaseStudy } from "@/lib/api/types"
import { EntityEditLoader } from "@/components/modules/shared/entity-edit-loader"
import { CaseStudyEditorForm } from "@/components/modules/case-studies/case-study-editor-form"

export default function EditCaseStudyPage() {
  const fetchCaseStudy = useCallback(async (id: string): Promise<CaseStudy | null> => {
    const res = await getCaseStudyById(id)
    return res?.data ?? null
  }, [])

  return (
    <EntityEditLoader
      backHref="/dashboard/case-studies"
      entityLabel="Case Study"
      fetcher={fetchCaseStudy}
    >
      {(caseStudy) => <CaseStudyEditorForm caseStudy={caseStudy} mode="edit" />}
    </EntityEditLoader>
  )
}
