"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Book } from "@/lib/api/types"
import { getBooks } from "@/lib/api/books"
import { BooksTable } from "@/components/modules/books/books-table"
import { BookDeleteDialog } from "@/components/modules/books/book-delete-dialog"
import { PageSubHeader, StickyActionFooter } from "@/components/dashboard-01/components/sticky-action-bar"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSparkles, IconTags } from "@tabler/icons-react"
import { toast } from "sonner"

export default function BooksPage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
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
    router.push("/dashboard/books/create")
  }

  const handleOpenEdit = (book: Book) => {
    const targetId = book.id || book._id
    if (targetId) {
      router.push(`/dashboard/books/${targetId}/edit`)
    }
  }

  const handleOpenDelete = (book: Book) => {
    setDeletingBook(book)
    setIsDeleteOpen(true)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setBooks((prev) => prev.filter((b) => (b.id || b._id) !== deletedId))
  }

  const handleUpdateSuccess = (updatedBook: Book) => {
    setBooks((prev) => {
      const targetId = updatedBook.id || updatedBook._id
      return prev.map((b) => ((b.id || b._id) === targetId ? updatedBook : b))
    })
  }

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref="/dashboard"
        backLabel="Overview"
        description={t("books.subtitle")}
      />

      <div className="flex-1 min-w-0 p-4 lg:p-6">
        <BooksTable
          books={books}
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
              <Link href="/dashboard/books/bundle">
                <IconSparkles className="size-3.5" />
                Featured Bundle
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1.5">
              <Link href="/dashboard/books/tags">
                <IconTags className="size-3.5" />
                Tags & Genres
              </Link>
            </Button>
          </>
        }
        right={
          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5 font-medium">
            <IconPlus className="size-3.5" />
            Add Book
          </Button>
        }
      />

      <BookDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        book={deletingBook}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
