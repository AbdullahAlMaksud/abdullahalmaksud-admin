"use client"

import React, { useState } from "react"
import { Design } from "@/lib/api/types"
import { deleteDesign } from "@/lib/api/designs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface DesignDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  design?: Design | null
  onSuccess: (deletedId: string) => void
}

export function DesignDeleteDialog({
  open,
  onOpenChange,
  design,
  onSuccess,
}: DesignDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const targetId = design?.id || design?._id
    if (!targetId) return

    try {
      setIsDeleting(true)
      await deleteDesign(targetId)
      toast.success("Graphic design item removed successfully.")
      onSuccess(targetId)
      onOpenChange(false)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to delete design"
      toast.error(errMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="gap-2">
          <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto sm:mx-0">
            <IconAlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Delete Graphic Design Item
          </DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to delete &ldquo;{design?.title}&rdquo;? This
            action cannot be undone and will permanently remove this visual item
            from your public portfolio.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting && <IconLoader2 className="size-4 animate-spin" />}
            <span>Delete Item</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
