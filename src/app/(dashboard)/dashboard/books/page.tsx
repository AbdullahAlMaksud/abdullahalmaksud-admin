"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Book } from "@/lib/api/types"
import { getBooks } from "@/lib/api/books"
import { BooksTable } from "@/components/modules/books/books-table"
import { BookFormDialog } from "@/components/modules/books/book-form-dialog"
import { BookDeleteDialog } from "@/components/modules/books/book-delete-dialog"
import { toast } from "sonner"

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getBooks({ limit: 50 })
      if (res?.data && Array.isArray(res.data)) {
        setBooks(res.data)
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to load books from server"
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleOpenAdd = () => {
    setSelectedBook(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (book: Book) => {
    setSelectedBook(book)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (book: Book) => {
    setDeletingBook(book)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = (savedBook: Book) => {
    setBooks((prev) => {
      const targetId = savedBook.id || savedBook._id
      const exists = prev.some((b) => (b.id || b._id) === targetId)
      if (exists) {
        return prev.map((b) => ((b.id || b._id) === targetId ? savedBook : b))
      }
      return [savedBook, ...prev]
    })
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setBooks((prev) => prev.filter((b) => (b.id || b._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedBook: Book) => {
    setBooks((prev) => {
      const targetId = updatedBook.id || updatedBook._id
      return prev.map((b) =>
        (b.id || b._id) === targetId ? updatedBook : b
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
            <h2 className="text-2xl font-bold tracking-tight">Reading List & Books</h2>
            <p className="text-sm text-muted-foreground">
              Curate books, ratings, reading dates, personal reviews, and recommendations.
            </p>
          </div>

          <BooksTable
            books={books}
            loading={loading}
            onAdd={handleOpenAdd}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onUpdateSuccess={handleUpdateSuccess}
          />

          {/* Form Modal (Create / Edit) */}
          <BookFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            book={selectedBook}
            onSuccess={handleFormSuccess}
          />

          {/* Delete Confirmation Modal */}
          <BookDeleteDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            book={deletingBook}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
