"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CaseStudy } from "@/lib/api/types"
import { getCaseStudies } from "@/lib/api/case-studies"
import { CaseStudiesTable } from "@/components/modules/case-studies/case-studies-table"
import { CaseStudyFormDialog } from "@/components/modules/case-studies/case-study-form-dialog"
import { CaseStudyDeleteDialog } from "@/components/modules/case-studies/case-study-delete-dialog"
import { toast } from "sonner"

export default function CaseStudiesPage() {
  const { t } = useTranslation()
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null)
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
    setSelectedCaseStudy(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: CaseStudy) => {
    setSelectedCaseStudy(item)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (item: CaseStudy) => {
    setDeletingCaseStudy(item)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = (savedItem: CaseStudy) => {
    setCaseStudies((prev) => {
      const targetId = savedItem.id || savedItem._id
      const exists = prev.some((c) => (c.id || c._id) === targetId)
      if (exists) {
        return prev.map((c) => ((c.id || c._id) === targetId ? savedItem : c))
      }
      return [savedItem, ...prev]
    })
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setCaseStudies((prev) => prev.filter((c) => (c.id || c._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedItem: CaseStudy) => {
    setCaseStudies((prev) => {
      const targetId = updatedItem.id || updatedItem._id
      return prev.map((c) =>
        (c.id || c._id) === targetId ? updatedItem : c
      )
    })
  }

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
              {t("caseStudies.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("caseStudies.subtitle")}
            </p>
          </div>

          <CaseStudiesTable
            caseStudies={caseStudies}
            loading={loading}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onUpdateSuccess={handleUpdateSuccess}
          />

          {/* Form Modal (Create / Edit) */}
          <CaseStudyFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            caseStudy={selectedCaseStudy}
            onSuccess={handleFormSuccess}
          />

          {/* Delete Confirmation Modal */}
          <CaseStudyDeleteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            caseStudy={deletingCaseStudy}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
