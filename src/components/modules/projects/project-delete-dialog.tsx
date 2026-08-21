"use client"

import React, { useState } from "react"
import { Project } from "@/lib/api/types"
import { deleteProject } from "@/lib/api/projects"
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

interface ProjectDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onSuccess: (deletedId: string) => void
}

export function ProjectDeleteDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!project) return null

  const handleDelete = async () => {
    const targetId = project.id || project._id
    if (!targetId) return

    try {
      setIsDeleting(true)
      await deleteProject(targetId)
      toast.success(`Project "${project.title}" deleted successfully!`)
      onSuccess(targetId)
      onOpenChange(false)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to delete project"
      toast.error(errMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-destructive/10 text-destructive">
              <IconAlertTriangle className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg">Delete Project</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{project.title}&rdquo;
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
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
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
