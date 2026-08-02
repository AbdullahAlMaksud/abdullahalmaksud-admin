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
import { Checkbox } from "@/components/ui/checkbox"
import { initialProjects, ProjectItem } from "@/lib/admin-data"
import { IconBriefcase, IconPlus, IconSearch, IconPencil, IconTrash, IconCheck, IconExternalLink, IconBrandGithub, IconStar, IconFilter } from "@tabler/icons-react"
import { toast } from "sonner"

export default function ProjectsPage() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Form State
  const [isOpen, setIsOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "Web Application",
    techStackString: "Next.js, React, TypeScript, Tailwind CSS",
    liveUrl: "",
    githubUrl: "",
    status: "Completed" as ProjectItem["status"],
    featured: true,
    completionDate: "2026-01-01",
    description: "",
  })

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus =
      statusFilter === "all" || project.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleOpenAdd = () => {
    setEditingProject(null)
    setFormData({
      title: "",
      category: "Web Application",
      techStackString: "Next.js, TypeScript, Tailwind CSS",
      liveUrl: "https://",
      githubUrl: "https://github.com/abdullahalmaksud/",
      status: "Completed",
      featured: false,
      completionDate: new Date().toISOString().split("T")[0],
      description: "",
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      category: project.category,
      techStackString: project.techStack.join(", "),
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      status: project.status,
      featured: project.featured,
      completionDate: project.completionDate,
      description: project.description || "",
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string, title: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    toast.success(t("projects.deleteSuccess"))
  }

  const handleToggleFeatured = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    )
    toast.success(t("projects.featureToggleSuccess"))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error(t("projects.errorTitle"))
      return
    }

    const techStack = formData.techStackString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                title: formData.title,
                category: formData.category,
                techStack,
                liveUrl: formData.liveUrl,
                githubUrl: formData.githubUrl,
                status: formData.status,
                featured: formData.featured,
                completionDate: formData.completionDate,
                description: formData.description,
              }
            : p
        )
      )
      toast.success(t("projects.updateSuccess"))
    } else {
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        techStack,
        liveUrl: formData.liveUrl,
        githubUrl: formData.githubUrl,
        status: formData.status,
        featured: formData.featured,
        completionDate: formData.completionDate,
        description: formData.description,
      }
      setProjects((prev) => [newProj, ...prev])
      toast.success(t("projects.addSuccess"))
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
              <h2 className="text-2xl font-bold tracking-tight">{t("projects.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("projects.subtitle")}
              </p>
            </div>

            <Button onClick={handleOpenAdd} className="flex items-center gap-2">
              <IconPlus className="size-4" />
              <span>{t("projects.addNew")}</span>
            </Button>
          </div>

          {/* Stat summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("projects.totalProjects")}</CardTitle>
                <IconBriefcase className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{projects.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("projects.completed")}</CardTitle>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Done</Badge>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{projects.filter((p) => p.status === "Completed").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("projects.inProgress")}</CardTitle>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">Active</Badge>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <div className="text-2xl font-bold">{projects.filter((p) => p.status === "In Progress").length}</div>
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
                    placeholder={t("projects.searchPlaceholder")}
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
                      <SelectItem value="all">{t("projects.filterAll")}</SelectItem>
                      <SelectItem value="completed">{t("projects.filterCompleted")}</SelectItem>
                      <SelectItem value="in progress">{t("projects.filterInProgress")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("projects.tableTitle")}</TableHead>
                    <TableHead>{t("projects.tableCategory")}</TableHead>
                    <TableHead>{t("projects.tableTechStack")}</TableHead>
                    <TableHead>{t("projects.tableStatus")}</TableHead>
                    <TableHead>{t("projects.tableLinks")}</TableHead>
                    <TableHead className="text-right">{t("projects.tableActions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t("common.noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((proj) => (
                      <TableRow key={proj.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleFeatured(proj.id)}
                              title={proj.featured ? "Featured" : "Mark as Featured"}
                            >
                              <IconStar
                                className={`size-4 ${
                                  proj.featured ? "text-amber-500 fill-amber-500" : "text-gray-300"
                                }`}
                              />
                            </button>
                            <div>
                              <div className="font-bold text-foreground">{proj.title}</div>
                              <div className="text-xs text-muted-foreground">{proj.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {proj.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {proj.status === "Completed" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-300">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-300">
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-0.5 text-xs font-medium"
                              >
                                {t("projects.liveLink")} <IconExternalLink className="size-3" />
                              </a>
                            )}
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs"
                              >
                                {t("projects.githubLink")} <IconBrandGithub className="size-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleOpenEdit(proj)}
                              title={t("common.edit")}
                            >
                              <IconPencil className="size-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(proj.id, proj.title)}
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
            <DrawerTitle>{editingProject ? t("projects.editTitle") : t("projects.addTitle")}</DrawerTitle>
            <DrawerDescription>
              {t("projects.formSubtitle")}
            </DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="proj-title">{t("projects.formProjectTitle")}</Label>
                <Input
                  id="proj-title"
                  placeholder={t("projects.formTitlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-category">{t("projects.formCategory")}</Label>
                <Input
                  id="proj-category"
                  placeholder="Web Application, AI, SaaS..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-status">{t("projects.formStatus")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger id="proj-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">{t("projects.statusCompleted")}</SelectItem>
                    <SelectItem value="In Progress">{t("projects.statusInProgress")}</SelectItem>
                    <SelectItem value="Planned">{t("projects.statusPlanned")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tech-stack">{t("projects.formTechStack")}</Label>
                <Input
                  id="tech-stack"
                  placeholder="Next.js, React, TypeScript, Node.js"
                  value={formData.techStackString}
                  onChange={(e) => setFormData({ ...formData, techStackString: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="live-url">{t("projects.formLiveUrl")}</Label>
                <Input
                  id="live-url"
                  placeholder="https://example.com"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github-url">{t("projects.formGithubUrl")}</Label>
                <Input
                  id="github-url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="proj-desc">{t("projects.formDescription")}</Label>
                <Input
                  id="proj-desc"
                  placeholder={t("projects.formDescPlaceholder")}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 sm:col-span-2 pt-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                />
                <label
                  htmlFor="featured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t("projects.formFeatured")}
                </label>
              </div>
            </div>

            <DrawerFooter className="px-0 pt-4 flex flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="flex items-center gap-1">
                <IconCheck className="size-4" />
                <span>{editingProject ? t("common.update") : t("common.save")}</span>
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </SidebarProvider>
  )
}
