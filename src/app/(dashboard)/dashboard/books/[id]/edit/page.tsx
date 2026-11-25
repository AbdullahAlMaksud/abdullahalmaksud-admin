"use client"

import React, { useCallback } from "react"
import { getBookById } from "@/lib/api/books"
import type { Book } from "@/lib/api/types"
import { EntityEditLoader } from "@/components/modules/shared/entity-edit-loader"
import { BookEditorForm } from "@/components/modules/books/book-editor-form"

export default function EditBookPage() {
  const fetchBook = useCallback(async (id: string): Promise<Book | null> => {
    const res = await getBookById(id)
    return res?.data ?? null
  }, [])

  return (
    <EntityEditLoader backHref="/dashboard/books" entityLabel="Book" fetcher={fetchBook}>
      {(book) => <BookEditorForm book={book} mode="edit" />}
    </EntityEditLoader>
  )
}
