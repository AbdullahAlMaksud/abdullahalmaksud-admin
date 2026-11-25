"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Design } from "@/lib/api/types"
import { getDesigns } from "@/lib/api/designs"
import { DesignsTable } from "@/components/modules/designs/designs-table"
import { DesignDeleteDialog } from "@/components/modules/designs/design-delete-dialog"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import { Button } from "@/components/ui/button"
import { IconCategory, IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"

export default function DesignsPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
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
    router.push("/dashboard/designs/create")
  }

  const handleOpenEdit = (design: Design) => {
    const targetId = design.id || design._id
    if (targetId) {
      router.push(`/dashboard/designs/${targetId}/edit`)
    }
  }

  const handleOpenDelete = (design: Design) => {
    setDeletingDesign(design)
    setIsDeleteOpen(true)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setDesigns((prev) => prev.filter((d) => (d.id || d._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedDesign: Design) => {
    setDesigns((prev) => {
      const targetId = updatedDesign.id || updatedDesign._id
      return prev.map((d) => ((d.id || d._id) === targetId ? updatedDesign : d))
    })
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description="Manage branding showcases, UI/UX aesthetics, posters, packaging, and visual assets."
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <DesignsTable
          designs={designs}
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
          <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
            <Link href="/dashboard/designs/categories">
              <IconCategory className="size-3.5" />
              Categories & Tools
            </Link>
          </Button>
        }
        right={
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5 font-medium">
            <IconPlus className="size-3.5" />
            Add Design
          </Button>
        }
      />

      <DesignDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        design={deletingDesign}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
