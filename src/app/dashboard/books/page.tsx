"use client"

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { initialBooks, BookItem } from "@/lib/admin-data"
import { IconBook, IconPlus, IconSearch, IconPencil, IconTrash, IconCheck, IconFilter } from "@tabler/icons-react"
import { toast } from "sonner"

export default function BooksPage() {
  const { t } = useTranslation()
  const [books, setBooks] = useState<BookItem[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Drawer / Form state
  const [isOpen, setIsOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookItem | null>(null)
  
  const [formData, setFormData] = useState<Partial<BookItem>>({
    title: "",
    author: "Abdullah Al Maksud",
    category: "Programming & Web",
    price: 450,
    isbn: "",
    publishedYear: 2026,
    status: "Published",
    description: "",
  })

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
    const matchesStatus =
      statusFilter === "all" || book.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleOpenAdd = () => {
    setEditingBook(null)
    setFormData({
      title: "",
      author: "Abdullah Al Maksud",
      category: "Programming & Web",
      price: 500,
      isbn: `978-984-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
      publishedYear: new Date().getFullYear(),
      status: "Published",
      description: "",
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (book: BookItem) => {
    setEditingBook(book)
    setFormData({ ...book })
    setIsOpen(true)
  }

  const handleDelete = (id: string, title: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
    toast.success(t("books.deleteSuccess"))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error(t("books.errorTitle"))
      return
    }

    if (editingBook) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === editingBook.id
            ? ({ ...b, ...formData } as BookItem)
            : b
        )
      )
      toast.success(t("books.updateSuccess"))
    } else {
      const newBook: BookItem = {
        id: `bk-${Date.now()}`,
        title: formData.title || "",
        author: formData.author || "Abdullah Al Maksud",
        category: formData.category || "Programming",
        price: Number(formData.price) || 0,
        isbn: formData.isbn || "978-984-0000-00-0",
        publishedYear: Number(formData.publishedYear) || 2026,
        salesCount: 0,
        status: (formData.status as any) || "Published",
        description: formData.description || "",
      }
      setBooks((prev) => [newBook, ...prev])
      toast.success(t("books.addSuccess"))
    }

    setIsOpen(false)
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
        <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">
          {/* Top Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("books.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("books.subtitle")}
              </p>
            </div>

            <Button onClick={handleOpenAdd} className="flex items-center gap-2">
              <IconPlus className="size-4" />
              <span>{t("books.addNew")}</span>
            </Button>
          </div>

          {/* Stat summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("books.totalBooks")}</CardTitle>
                <IconBook className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{books.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("books.published")}</CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Live</Badge>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{books.filter(b => b.status === "Published").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("books.drafts")}</CardTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">Draft</Badge>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{books.filter(b => b.status === "Draft").length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder={t("books.searchPlaceholder")}
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <IconFilter className="size-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder={t("common.filter")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("books.filterAll")}</SelectItem>
                      <SelectItem value="published">{t("books.filterPublished")}</SelectItem>
                      <SelectItem value="draft">{t("books.filterDraft")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("books.tableTitle")}</TableHead>
                    <TableHead>{t("books.tableCategory")}</TableHead>
                    <TableHead>{t("books.tablePrice")}</TableHead>
                    <TableHead>{t("books.tableIsbn")}</TableHead>
                    <TableHead>{t("books.tableStatus")}</TableHead>
                    <TableHead className="text-right">{t("books.tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t("common.noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-bold text-foreground">{book.title}</div>
                            <div className="text-xs text-muted-foreground">{book.author} ({book.publishedYear})</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {book.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums font-semibold">৳{book.price}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{book.isbn}</TableCell>
                        <TableCell>
                          {book.status === "Published" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300">
                              {t("books.publishedBadge")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300">
                              {t("books.draftBadge")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenEdit(book)}
                              title={t("common.edit")}
                            >
                              <IconPencil className="size-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(book.id, book.title)}
                              title={t("common.delete")}
                            >
                              <IconTrash className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Drawer Dialog for Add / Edit */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="max-w-2xl mx-auto p-6">
          <DrawerHeader className="px-0">
            <DrawerTitle>{editingBook ? t("books.editTitle") : t("books.addTitle")}</DrawerTitle>
            <DrawerDescription>
              {t("books.formSubtitle")}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">{t("books.formBookTitle")}</Label>
                <Input
                  id="title"
                  placeholder={t("books.formTitlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">{t("books.formAuthor")}</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t("books.formCategory")}</Label>
                <Input
                  id="category"
                  placeholder="Programming, AI, Engineering..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t("books.formPrice")}</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedYear">{t("books.formYear")}</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => setFormData({ ...formData, publishedYear: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">{t("books.formIsbn")}</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t("books.formStatus")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">{t("books.statusPublished")}</SelectItem>
                    <SelectItem value="Draft">{t("books.statusDraft")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">{t("books.formDescription")}</Label>
                <Input
                  id="description"
                  placeholder={t("books.formDescPlaceholder")}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <DrawerFooter className="px-0 pt-4 flex flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex items-center gap-1">
                <IconCheck className="size-4" />
                <span>{editingBook ? t("common.update") : t("common.save")}</span>
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </SidebarProvider>
  )
}
