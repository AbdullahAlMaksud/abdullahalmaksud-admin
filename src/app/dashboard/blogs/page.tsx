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
import { initialBlogs, BlogItem } from "@/lib/admin-data"
import { IconArticle, IconPlus, IconSearch, IconPencil, IconTrash, IconCheck, IconEye, IconFilter } from "@tabler/icons-react"
import { toast } from "sonner"

export default function BlogsPage() {
  const { t } = useTranslation()
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Form State
  const [isOpen, setIsOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "Web Development",
    author: "Abdullah Al Maksud",
    publishDate: new Date().toISOString().split("T")[0],
    readTime: "5 min read",
    status: "Published" as BlogItem["status"],
    tagsString: "Next.js, React, Web",
    excerpt: "",
  })

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus =
      statusFilter === "all" || blog.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleOpenAdd = () => {
    setEditingBlog(null)
    setFormData({
      title: "",
      category: "Web Development",
      author: "Abdullah Al Maksud",
      publishDate: new Date().toISOString().split("T")[0],
      readTime: "6 min read",
      status: "Published",
      tagsString: "Next.js, TypeScript, Web",
      excerpt: "",
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (blog: BlogItem) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      category: blog.category,
      author: blog.author,
      publishDate: blog.publishDate,
      readTime: blog.readTime,
      status: blog.status,
      tagsString: blog.tags.join(", "),
      excerpt: blog.excerpt,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string, title: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id))
    toast.success(t("blogs.deleteSuccess"))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error(t("blogs.errorTitle"))
      return
    }

    const tags = formData.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingBlog) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingBlog.id
            ? {
                ...b,
                title: formData.title,
                category: formData.category,
                author: formData.author,
                publishDate: formData.publishDate,
                readTime: formData.readTime,
                status: formData.status,
                tags,
                excerpt: formData.excerpt,
              }
            : b
        )
      )
      toast.success(t("blogs.updateSuccess"))
    } else {
      const newBlog: BlogItem = {
        id: `blog-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        author: formData.author,
        publishDate: formData.publishDate,
        readTime: formData.readTime,
        views: 0,
        status: formData.status,
        tags,
        excerpt: formData.excerpt,
      }
      setBlogs((prev) => [newBlog, ...prev])
      toast.success(t("blogs.addSuccess"))
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("blogs.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("blogs.subtitle")}
              </p>
            </div>

            <Button onClick={handleOpenAdd} className="flex items-center gap-2">
              <IconPlus className="size-4" />
              <span>{t("blogs.addNew")}</span>
            </Button>
          </div>

          {/* Stat Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("blogs.totalBlogs")}</CardTitle>
                <IconArticle className="size-4 text-purple-500" />
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{blogs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("blogs.published")}</CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Public</Badge>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{blogs.filter((b) => b.status === "Published").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("blogs.totalViews")}</CardTitle>
                <IconEye className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">
                  {blogs.reduce((sum, b) => sum + b.views, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder={t("blogs.searchPlaceholder")}
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
                      <SelectItem value="all">{t("blogs.filterAll")}</SelectItem>
                      <SelectItem value="published">{t("blogs.filterPublished")}</SelectItem>
                      <SelectItem value="draft">{t("blogs.filterDraft")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("blogs.tableTitle")}</TableHead>
                    <TableHead>{t("blogs.tableCategory")}</TableHead>
                    <TableHead>{t("blogs.tableDate")}</TableHead>
                    <TableHead>{t("blogs.tableViews")}</TableHead>
                    <TableHead>{t("blogs.tableStatus")}</TableHead>
                    <TableHead className="text-right">{t("blogs.tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t("common.noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBlogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-bold text-foreground">{blog.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span>{blog.readTime}</span> • <span>{blog.author}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {blog.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{blog.publishDate}</TableCell>
                        <TableCell className="tabular-nums font-semibold flex items-center gap-1 mt-2">
                          <IconEye className="size-3.5 text-muted-foreground" />
                          {blog.views.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {blog.status === "Published" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300">
                              {t("blogs.publishedBadge")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300">
                              {t("blogs.draftBadge")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenEdit(blog)}
                              title={t("common.edit")}
                            >
                              <IconPencil className="size-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(blog.id, blog.title)}
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
            <DrawerTitle>{editingBlog ? t("blogs.editTitle") : t("blogs.addTitle")}</DrawerTitle>
            <DrawerDescription>
              {t("blogs.formSubtitle")}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-title">{t("blogs.formBlogTitle")}</Label>
                <Input
                  id="blog-title"
                  placeholder={t("blogs.formTitlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-category">{t("blogs.formCategory")}</Label>
                <Input
                  id="blog-category"
                  placeholder="Web Development, Architecture..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-status">{t("blogs.formStatus")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="blog-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">{t("blogs.statusPublished")}</SelectItem>
                    <SelectItem value="Draft">{t("blogs.statusDraft")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publish-date">{t("blogs.formPublishDate")}</Label>
                <Input
                  id="publish-date"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="read-time">{t("blogs.formReadTime")}</Label>
                <Input
                  id="read-time"
                  placeholder="5 min read"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tags">{t("blogs.formTags")}</Label>
                <Input
                  id="tags"
                  placeholder="Next.js, React, Performance"
                  value={formData.tagsString}
                  onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="blog-excerpt">{t("blogs.formExcerpt")}</Label>
                <Input
                  id="blog-excerpt"
                  placeholder={t("blogs.formExcerptPlaceholder")}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>
            </div>

            <DrawerFooter className="px-0 pt-4 flex flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex items-center gap-1">
                <IconCheck className="size-4" />
                <span>{editingBlog ? t("common.update") : t("common.publish")}</span>
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </SidebarProvider>
  )
}
