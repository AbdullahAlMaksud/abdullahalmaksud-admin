"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Blog } from "@/lib/api/types"
import { getBlogs } from "@/lib/api/blogs"
import { BlogsTable } from "@/components/modules/blogs/blogs-table"
import { BlogFormDialog } from "@/components/modules/blogs/blog-form-dialog"
import { BlogDeleteDialog } from "@/components/modules/blogs/blog-delete-dialog"
import { toast } from "sonner"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null)

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getBlogs({ limit: 50 })
      if (res?.data && Array.isArray(res.data)) {
        setBlogs(res.data)
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to load blog articles from server"
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBlogs()
  }, [loadBlogs])

  const handleOpenAdd = () => {
    setSelectedBlog(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (blog: Blog) => {
    setSelectedBlog(blog)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (blog: Blog) => {
    setDeletingBlog(blog)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = (savedBlog: Blog) => {
    setBlogs((prev) => {
      const targetId = savedBlog.id || savedBlog._id
      const exists = prev.some((b) => (b.id || b._id) === targetId)
      if (exists) {
        return prev.map((b) => ((b.id || b._id) === targetId ? savedBlog : b))
      }
      return [savedBlog, ...prev]
    })
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setBlogs((prev) => prev.filter((b) => (b.id || b._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedBlog: Blog) => {
    setBlogs((prev) => {
      const targetId = updatedBlog.id || updatedBlog._id
      return prev.map((b) =>
        (b.id || b._id) === targetId ? updatedBlog : b
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
            <h2 className="text-2xl font-bold tracking-tight">Blog Articles</h2>
            <p className="text-sm text-muted-foreground">
              Manage technical writings, tutorials, categories, tags, and publishing status.
            </p>
          </div>

          <BlogsTable
            blogs={blogs}
            loading={loading}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onUpdateSuccess={handleUpdateSuccess}
          />

          {/* Form Modal (Create / Edit) */}
          <BlogFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            blog={selectedBlog}
            onSuccess={handleFormSuccess}
          />

          {/* Delete Confirmation Modal */}
          <BlogDeleteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            blog={deletingBlog}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
