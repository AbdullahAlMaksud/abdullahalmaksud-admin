"use client"

import React, { useCallback } from "react"
import { getProjectById } from "@/lib/api/projects"
import type { Project } from "@/lib/api/types"
import { EntityEditLoader } from "@/components/modules/shared/entity-edit-loader"
import { ProjectEditorForm } from "@/components/modules/projects/project-editor-form"

export default function EditProjectPage() {
  const fetchProject = useCallback(async (id: string): Promise<Project | null> => {
    const res = await getProjectById(id)
    const candidate = (res as { data?: Project })?.data ?? (res as unknown as Project)
    return candidate && candidate.title ? candidate : null
  }, [])

  return (
    <EntityEditLoader backHref="/dashboard/projects" entityLabel="Project" fetcher={fetchProject}>
      {(project) => <ProjectEditorForm project={project} mode="edit" />}
    </EntityEditLoader>
  )
}
