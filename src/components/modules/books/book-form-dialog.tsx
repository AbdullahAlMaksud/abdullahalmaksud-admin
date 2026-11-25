"use client"

import React from "react"
import { Book } from "@/lib/api/types"
import { BookEditorForm } from "./book-editor-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconBook } from "@tabler/icons-react"

interface BookFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book?: Book | null
  onSuccess: (book: Book) => void
}

export function BookFormDialog({ open, onOpenChange, book, onSuccess }: BookFormDialogProps) {
  const isEditing = !!book
  const dialogKey = open ? (book ? book.id || book._id || "edit" : "new") : "closed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <IconBook className="size-4 text-primary" />
            {isEditing ? "Edit Book" : "Add Book to Reading List"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update book details, ratings, reviews, and links."
              : "Add a new book you recommend or have read to your public shelf."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <BookEditorForm
            key={dialogKey}
            book={book}
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
