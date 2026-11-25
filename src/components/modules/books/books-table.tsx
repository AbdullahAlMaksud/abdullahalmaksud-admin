"use client"

import React, { useState } from "react"
import { Book } from "@/lib/api/types"
import { updateBook } from "@/lib/api/books"
import { resolveAssetUrl } from "@/lib/asset-url"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconSearch,
  IconPencil,
  IconTrash,
  IconBook,
  IconPlus,
  IconStar,
  IconExternalLink,
} from "@tabler/icons-react"
import { toast } from "sonner"

interface BooksTableProps {
  books: Book[]
  loading?: boolean
  showAddButton?: boolean
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
  onAdd: () => void
  onUpdateSuccess: (updated: Book) => void
}

export function BooksTable({
  books,
  loading = false,
  showAddButton = true,
  onEdit,
  onDelete,
  onAdd,
  onUpdateSuccess,
}: BooksTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredBooks = books.filter((book) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre?.toLowerCase().includes(query) ||
      book.tags?.some((t) => t.toLowerCase().includes(query))

    const matchesFilter =
      filterType === "all" ||
      (filterType === "recommended" && book.isRecommended) ||
      (filterType === "5stars" && book.rating === 5)

    return matchesSearch && matchesFilter
  })

  const handleToggleRecommended = async (book: Book) => {
    const targetId = book.id || book._id
    if (!targetId) return

    try {
      const res = await updateBook(targetId, {
        isRecommended: !book.isRecommended,
      })
      toast.success(
        `Book ${!book.isRecommended ? "marked as recommended" : "removed from recommendations"}!`
      )
      if (res.data) onUpdateSuccess(res.data)
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Failed to update recommendation status"
      toast.error(errMsg)
    }
  }

  return (
    <div className="space-y-4 min-w-0 w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border">
        <div className="flex flex-wrap sm:flex-nowrap flex-1 items-center gap-2.5 min-w-0">
          <div className="relative flex-1 min-w-[160px] max-w-sm">
            <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[150px] shrink-0 h-9 text-xs">
              <SelectValue placeholder="All Books" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="recommended">⭐ Recommended</SelectItem>
              <SelectItem value="5stars">5 Star Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showAddButton && (
          <Button onClick={onAdd} size="sm" className="gap-1.5 h-9 text-xs w-full sm:w-auto shrink-0 font-medium">
            <IconPlus className="size-4" /> Add Book
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Book Title & Author</TableHead>
              <TableHead className="hidden lg:table-cell w-40">Genre</TableHead>
              <TableHead className="hidden sm:table-cell w-28">Rating</TableHead>
              <TableHead className="hidden xl:table-cell w-28">Read Date</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16 text-center text-muted-foreground animate-pulse">
                    Loading books collection...
                  </TableCell>
                </TableRow>
              ))
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconBook className="size-8 opacity-40" />
                    <p className="text-sm font-medium">No books found</p>
                    <p className="text-xs text-muted-foreground/70">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Click 'Add Book' to add your first book to the reading list."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id} className="hover:bg-muted/30 transition-colors">
                  {/* Recommendation star */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleRecommended(book)}
                      className={`p-1 rounded-md transition-colors ${
                        book.isRecommended
                          ? "text-amber-400 hover:text-amber-300"
                          : "text-muted-foreground/40 hover:text-amber-400"
                      }`}
                      title={book.isRecommended ? "Recommended" : "Mark as recommended"}
                    >
                      <IconStar className={`size-4 ${book.isRecommended ? "fill-amber-400" : ""}`} />
                    </button>
                  </TableCell>

                  {/* Title, author & cover */}
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      {book.coverImage && (
                        <div className="w-9 h-12 rounded bg-muted border overflow-hidden shrink-0 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveAssetUrl(book.coverImage)}
                            alt=""
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {book.title}
                          </span>
                          {book.isRecommended && (
                            <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 shrink-0 bg-amber-500/10 text-amber-500 border-amber-500/30">
                              Top Pick
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          by <span className="font-medium">{book.author}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Genre */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs font-medium text-muted-foreground truncate block">
                      {book.genre || "General"}
                    </span>
                  </TableCell>

                  {/* Rating */}
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStar
                          key={i}
                          className={`size-3.5 ${
                            i < (book.rating || 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-muted-foreground/25"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>

                  {/* Read Date */}
                  <TableCell className="hidden xl:table-cell text-xs text-muted-foreground font-mono">
                    {book.readDate || book.createdAt?.split("T")[0] || "—"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {book.purchaseLink && (
                        <a
                          href={book.purchaseLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
                          title="Purchase Link"
                        >
                          <IconExternalLink className="size-4" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(book)}
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <IconPencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(book)}
                        className="size-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
