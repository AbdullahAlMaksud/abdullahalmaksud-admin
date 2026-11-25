"use client"

import React from "react"
import { Design } from "@/lib/api/types"
import { DesignEditorForm } from "./design-editor-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconPalette } from "@tabler/icons-react"

interface DesignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  design?: Design | null
  onSuccess: (design: Design) => void
}

export function DesignFormDialog({ open, onOpenChange, design, onSuccess }: DesignFormDialogProps) {
  const isEditing = !!design
  const dialogKey = open ? (design ? design.id || design._id || "edit" : "new") : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <IconPalette className="size-4 text-primary" />
            {isEditing ? "Edit Graphic Design Item" : "Add New Graphic Design"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update visual showcase, branding assets, tools, and links."
              : "Upload and showcase your creative branding, posters, UI/UX, or packaging design."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <DesignEditorForm
            key={dialogKey}
            design={design}
            mode={isEditing ? "edit" : "create"}
            variant="embedded"
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
