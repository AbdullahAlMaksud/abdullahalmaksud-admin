"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { CaseStudy } from "@/lib/api/types"
import { getCaseStudies } from "@/lib/api/case-studies"
import { CaseStudiesTable } from "@/components/modules/case-studies/case-studies-table"
import { CaseStudyDeleteDialog } from "@/components/modules/case-studies/case-study-delete-dialog"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import { Button } from "@/components/ui/button"
import { IconCategory, IconPlus, IconTags } from "@tabler/icons-react"
import { toast } from "sonner"

export default function CaseStudiesPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingCaseStudy, setDeletingCaseStudy] = useState<CaseStudy | null>(null)

  const loadCaseStudies = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getCaseStudies({ limit: 50 })
      if (res?.data && Array.isArray(res.data)) {
        setCaseStudies(res.data)
      }
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to load case studies from server"
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCaseStudies()
  }, [loadCaseStudies])

  const handleOpenAdd = () => {
    router.push("/dashboard/case-studies/create")
  }

  const handleOpenEdit = (item: CaseStudy) => {
    const targetId = item.id || item._id
    if (targetId) {
      router.push(`/dashboard/case-studies/${targetId}/edit`)
    }
  }

  const handleOpenDelete = (item: CaseStudy) => {
    setDeletingCaseStudy(item)
    setIsDeleteOpen(true)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setCaseStudies((prev) => prev.filter((c) => (c.id || c._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedItem: CaseStudy) => {
    setCaseStudies((prev) => {
      const targetId = updatedItem.id || updatedItem._id
      return prev.map((c) => ((c.id || c._id) === targetId ? updatedItem : c))
    })
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description={t("caseStudies.subtitle")}
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <CaseStudiesTable
          caseStudies={caseStudies}
          loading={loading}
          showAddButton={false}
          onAdd={handleOpenAdd}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onUpdateSuccess={handleUpdateSuccess}
        />
      </div>

      <StickyActionFooter
        left={
          <>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
              <Link href="/dashboard/case-studies/categories">
                <IconCategory className="size-3.5" />
                Categories
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
              <Link href="/dashboard/case-studies/tags">
                <IconTags className="size-3.5" />
                Tags & Stack
              </Link>
            </Button>
          </>
        }
        right={
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5 font-medium">
            <IconPlus className="size-3.5" />
            {t("caseStudies.addNew")}
          </Button>
        }
      />

      <CaseStudyDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        caseStudy={deletingCaseStudy}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
