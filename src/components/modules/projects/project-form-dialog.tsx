"use client"

import React from "react"
import { Project } from "@/lib/api/types"
import { ProjectEditorForm } from "./project-editor-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconSparkles } from "@tabler/icons-react"

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  onSuccess: (project: Project) => void
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectFormDialogProps) {
  const isEditing = !!project
  const dialogKey = open ? (project ? project.id || project._id || "edit" : "new") : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <IconSparkles className="size-4 text-primary" />
            {isEditing ? "Edit Software Project" : "Add New Software Project"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update project details, features, stack, and demo links."
              : "Create a new project entry to showcase on your portfolio website."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ProjectEditorForm
            key={dialogKey}
            project={project}
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
