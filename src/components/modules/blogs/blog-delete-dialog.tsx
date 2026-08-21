"use client"

import React, { useState } from "react"
import { Blog } from "@/lib/api/types"
import { deleteBlog } from "@/lib/api/blogs"
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

interface BlogDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blog: Blog | null
  onSuccess: (deletedId: string) => void
}

export function BlogDeleteDialog({
  open,
  onOpenChange,
  blog,
  onSuccess,
}: BlogDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!blog) return null

  const handleDelete = async () => {
    const targetId = blog.id || blog._id
    if (!targetId) return

    try {
      setIsDeleting(true)
      await deleteBlog(targetId)
      toast.success(`Blog post "${blog.title}" deleted successfully!`)
      onSuccess(targetId)
      onOpenChange(false)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to delete blog post"
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
              <DialogTitle className="text-lg">Delete Blog Article</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{blog.title}&rdquo;
                </span>
                ? This will permanently remove the post from your portfolio.
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
            Delete Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
