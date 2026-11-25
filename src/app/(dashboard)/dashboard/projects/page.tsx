"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Project } from "@/lib/api/types"
import { getProjects } from "@/lib/api/projects"
import { ProjectsTable } from "@/components/modules/projects/projects-table"
import { ProjectDeleteDialog } from "@/components/modules/projects/project-delete-dialog"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import { Button } from "@/components/ui/button"
import { IconCategory, IconPlus, IconTags } from "@tabler/icons-react"
import { toast } from "sonner"

export default function ProjectsPage() {
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      if (Array.isArray(data)) {
        setProjects(data)
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to load projects from server"
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleOpenAdd = () => {
    router.push("/dashboard/projects/create")
  }

  const handleOpenEdit = (project: Project) => {
    const targetId = project.id || project._id
    if (targetId) {
      router.push(`/dashboard/projects/${targetId}/edit`)
    }
  }

  const handleOpenDelete = (project: Project) => {
    setDeletingProject(project)
    setIsDeleteOpen(true)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setProjects((prev) => prev.filter((p) => (p.id || p._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedProject: Project) => {
    setProjects((prev) => {
      const targetId = updatedProject.id || updatedProject._id
      return prev.map((p) => ((p.id || p._id) === targetId ? updatedProject : p))
    })
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description="Manage portfolio projects, tech stacks, GitHub repos, core highlights, and live demo URLs."
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <ProjectsTable
          projects={projects}
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
              <Link href="/dashboard/projects/categories">
                <IconCategory className="size-3.5" />
                Categories
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
              <Link href="/dashboard/projects/tags">
                <IconTags className="size-3.5" />
                Tags & Stack
              </Link>
            </Button>
          </>
        }
        right={
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5 font-medium">
            <IconPlus className="size-3.5" />
            Add Project
          </Button>
        }
      />

      <ProjectDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        project={deletingProject}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
