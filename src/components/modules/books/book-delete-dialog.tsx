"use client"

import React, { useState } from "react"
import { Book } from "@/lib/api/types"
import { deleteBook } from "@/lib/api/books"
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

interface BookDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: Book | null
  onSuccess: (deletedId: string) => void
}

export function BookDeleteDialog({
  open,
  onOpenChange,
  book,
  onSuccess,
}: BookDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!book) return null

  const handleDelete = async () => {
    const targetId = book.id || book._id
    if (!targetId) return

    try {
      setIsDeleting(true)
      await deleteBook(targetId)
      toast.success(`Book "${book.title}" removed from reading list!`)
      onSuccess(targetId)
      onOpenChange(false)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to delete book"
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
              <DialogTitle className="text-lg">Delete Book</DialogTitle>
              <DialogDescription className="mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{book.title}&rdquo;
                </span>{" "}
                from your reading list?
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
            Delete Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
