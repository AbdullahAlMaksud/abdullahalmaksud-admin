"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Project } from "@/lib/api/types"
import { getProjects } from "@/lib/api/projects"
import { ProjectsTable } from "@/components/modules/projects/projects-table"
import { ProjectFormDialog } from "@/components/modules/projects/project-form-dialog"
import { ProjectDeleteDialog } from "@/components/modules/projects/project-delete-dialog"
import { toast } from "sonner"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
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
    setSelectedProject(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (project: Project) => {
    setDeletingProject(project)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = (savedProject: Project) => {
    setProjects((prev) => {
      const targetId = savedProject.id || savedProject._id
      const exists = prev.some((p) => (p.id || p._id) === targetId)
      if (exists) {
        return prev.map((p) => ((p.id || p._id) === targetId ? savedProject : p))
      }
      return [savedProject, ...prev]
    })
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setProjects((prev) => prev.filter((p) => (p.id || p._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedProject: Project) => {
    setProjects((prev) => {
      const targetId = updatedProject.id || updatedProject._id
      return prev.map((p) =>
        (p.id || p._id) === targetId ? updatedProject : p
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
            <h2 className="text-2xl font-bold tracking-tight">Software Projects</h2>
            <p className="text-sm text-muted-foreground">
              Manage portfolio projects, tech stacks, GitHub repos, core highlights, and live demo URLs.
            </p>
          </div>

          <ProjectsTable
            projects={projects}
            loading={loading}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onUpdateSuccess={handleUpdateSuccess}
          />

          {/* Form Modal (Create / Edit) */}
          <ProjectFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            project={selectedProject}
            onSuccess={handleFormSuccess}
          />

          {/* Delete Confirmation Modal */}
          <ProjectDeleteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            project={deletingProject}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
