"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Blog } from "@/lib/api/types"
import { getBlogs } from "@/lib/api/blogs"
import { BlogsTable } from "@/components/modules/blogs/blogs-table"
import { BlogDeleteDialog } from "@/components/modules/blogs/blog-delete-dialog"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import { Button } from "@/components/ui/button"
import { IconCategory, IconPlus, IconTags } from "@tabler/icons-react"
import { toast } from "sonner"

export default function BlogsPage() {
  const router = useRouter()

  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
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
    router.push("/dashboard/blogs/create")
  }

  const handleOpenEdit = (blog: Blog) => {
    const blogId = blog.id || blog._id
    if (blogId) {
      router.push(`/dashboard/blogs/${blogId}/edit`)
    }
  }

  const handleOpenDelete = (blog: Blog) => {
    setDeletingBlog(blog)
    setIsDeleteOpen(true)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setBlogs((prev) => prev.filter((b) => (b.id || b._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedBlog: Blog) => {
    setBlogs((prev) => {
      const targetId = updatedBlog.id || updatedBlog._id
      return prev.map((b) => ((b.id || b._id) === targetId ? updatedBlog : b))
    })
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description="Manage technical writings, tutorials, categories, tags, and publishing status."
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <BlogsTable
          blogs={blogs}
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
              <Link href="/dashboard/blogs/categories">
                <IconCategory className="size-3.5" />
                Categories
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
              <Link href="/dashboard/blogs/tags">
                <IconTags className="size-3.5" />
                Tags
              </Link>
            </Button>
          </>
        }
        right={
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5 font-medium">
            <IconPlus className="size-3.5" />
            New Article
          </Button>
        }
      />

      <BlogDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        blog={deletingBlog}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
