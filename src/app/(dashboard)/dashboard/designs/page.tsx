"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Design } from "@/lib/api/types"
import { getDesigns } from "@/lib/api/designs"
import { DesignsTable } from "@/components/modules/designs/designs-table"
import { DesignFormDialog } from "@/components/modules/designs/design-form-dialog"
import { DesignDeleteDialog } from "@/components/modules/designs/design-delete-dialog"
import { toast } from "sonner"

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingDesign, setDeletingDesign] = useState<Design | null>(null)

  const loadDesigns = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDesigns()
      if (Array.isArray(data)) {
        setDesigns(data)
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to load graphic designs"
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDesigns()
  }, [loadDesigns])

  const handleOpenAdd = () => {
    setSelectedDesign(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (design: Design) => {
    setSelectedDesign(design)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (design: Design) => {
    setDeletingDesign(design)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = (savedDesign: Design) => {
    setDesigns((prev) => {
      const targetId = savedDesign.id || savedDesign._id
      const exists = prev.some((d) => (d.id || d._id) === targetId)
      if (exists) {
        return prev.map((d) =>
          (d.id || d._id) === targetId ? savedDesign : d
        )
      }
      return [savedDesign, ...prev]
    })
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setDesigns((prev) => prev.filter((d) => (d.id || d._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedDesign: Design) => {
    setDesigns((prev) => {
      const targetId = updatedDesign.id || updatedDesign._id
      return prev.map((d) =>
        (d.id || d._id) === targetId ? updatedDesign : d
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
            <h2 className="text-2xl font-bold tracking-tight">Graphic Designs</h2>
            <p className="text-sm text-muted-foreground">
              Manage branding showcases, UI/UX aesthetics, posters, packaging, and visual assets.
            </p>
          </div>

          <DesignsTable
            designs={designs}
            loading={loading}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onUpdateSuccess={handleUpdateSuccess}
          />

          {/* Form Modal (Create / Edit) */}
          <DesignFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            design={selectedDesign}
            onSuccess={handleFormSuccess}
          />

          {/* Delete Confirmation Modal */}
          <DesignDeleteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            design={deletingDesign}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
