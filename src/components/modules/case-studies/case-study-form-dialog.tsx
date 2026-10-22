"use client"

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { CaseStudy, CaseStudyResult } from "@/lib/api/types"
import { createCaseStudy, updateCaseStudy } from "@/lib/api/case-studies"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "@/components/ui/image-upload"
import { IconPlus, IconTrash, IconLoader2, IconSparkles } from "@tabler/icons-react"
import { toast } from "sonner"

interface CaseStudyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseStudy?: CaseStudy | null
  onSuccess: (caseStudy: CaseStudy) => void
}

function CaseStudyFormInner({
  caseStudy,
  onClose,
  onSuccess,
}: {
  caseStudy?: CaseStudy | null
  onClose: () => void
  onSuccess: (caseStudy: CaseStudy) => void
}) {
  const { t } = useTranslation()
  const isEditing = !!caseStudy

  const [title, setTitle] = useState(caseStudy?.title || "")
  const [slug, setSlug] = useState(caseStudy?.slug || "")
  const [excerpt, setExcerpt] = useState(caseStudy?.excerpt || "")
  const [coverImage, setCoverImage] = useState(caseStudy?.coverImage || "")
  const [category, setCategory] = useState(caseStudy?.category || "Architecture")
  const [industry, setIndustry] = useState(caseStudy?.industry || "Enterprise SaaS")
  const [client, setClient] = useState(caseStudy?.client || "")
  const [projectSlug, setProjectSlug] = useState(caseStudy?.projectSlug || "")
  const [duration, setDuration] = useState(caseStudy?.duration || "3 Months")
  const [readingTime, setReadingTime] = useState(caseStudy?.readingTime || "8 min read")
  const [challenge, setChallenge] = useState(caseStudy?.challenge || "")
  const [solution, setSolution] = useState(caseStudy?.solution || "")
  const [stackString, setStackString] = useState(
    caseStudy ? caseStudy.stack?.join(", ") || "" : "Next.js, TypeScript, PostgreSQL, Tailwind CSS"
  )
  const [featured, setFeatured] = useState(!!caseStudy?.featured)
  const [isPublished, setIsPublished] = useState(caseStudy ? !!caseStudy.isPublished : true)
  const [results, setResults] = useState<CaseStudyResult[]>(
    caseStudy?.results && caseStudy.results.length > 0
      ? caseStudy.results
      : [
          {
            metric: "Latency",
            value: "85% reduction",
            description: "Sub-frame rendering pipeline",
          },
        ]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (
      !isEditing &&
      (!slug ||
        slug ===
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""))
    ) {
      setSlug(
        newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      )
    }
  }

  const handleAddResult = () => {
    setResults([...results, { metric: "", value: "", description: "" }])
  }

  const handleRemoveResult = (index: number) => {
    setResults(results.filter((_, i) => i !== index))
  }

  const handleResultChange = (
    index: number,
    field: keyof CaseStudyResult,
    value: string
  ) => {
    const updated = [...results]
    updated[index] = { ...updated[index], [field]: value }
    setResults(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error(t("caseStudies.errorTitle"))
      return
    }
    if (!slug.trim()) {
      toast.error("Case study slug is required")
      return
    }

    const stack = stackString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const cleanedResults = results.filter(
      (r) => r.metric.trim() || r.value.trim()
    )

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      category: category.trim(),
      industry: industry.trim(),
      client: client.trim(),
      projectSlug: projectSlug.trim(),
      duration: duration.trim(),
      readingTime: readingTime.trim(),
      challenge: challenge.trim(),
      solution: solution.trim(),
      stack,
      tags: stack,
      results: cleanedResults,
      featured,
      isPublished,
    }

    try {
      setIsSubmitting(true)
      if (isEditing) {
        const targetId = caseStudy.id || caseStudy._id
        if (!targetId) throw new Error("Missing ID for update")
        const res = await updateCaseStudy(targetId, payload)
        toast.success(t("caseStudies.updateSuccess"))
        if (res.data) onSuccess(res.data)
      } else {
        const res = await createCaseStudy(payload)
        toast.success(t("caseStudies.addSuccess"))
        if (res.data) onSuccess(res.data)
      }
      onClose()
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to save case study"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          <IconSparkles className="size-5 text-primary" />
          <span>{isEditing ? t("caseStudies.editTitle") : t("caseStudies.addTitle")}</span>
        </DialogTitle>
        <DialogDescription>
          {t("caseStudies.formSubtitle")}
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 max-h-[70vh]">
        {/* Core Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cs-title">{t("caseStudies.formTitle")}</Label>
            <Input
              id="cs-title"
              placeholder={t("caseStudies.formTitlePlaceholder")}
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-slug">{t("caseStudies.formSlug")}</Label>
            <Input
              id="cs-slug"
              placeholder="sub-frame-latency-visualizer"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-category">{t("caseStudies.formCategory")}</Label>
            <Input
              id="cs-category"
              placeholder="e.g. Architecture, Scaling"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-industry">{t("caseStudies.formIndustry")}</Label>
            <Input
              id="cs-industry"
              placeholder="e.g. Enterprise SaaS, Aerospace"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-client">{t("caseStudies.formClient")}</Label>
            <Input
              id="cs-client"
              placeholder="e.g. Al Maksud Labs"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-project-slug">{t("caseStudies.formProjectSlug")}</Label>
            <Input
              id="cs-project-slug"
              placeholder="e.g. aeronautical-telemetry"
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-duration">{t("caseStudies.formDuration")}</Label>
            <Input
              id="cs-duration"
              placeholder="e.g. 3 Months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cs-reading-time">{t("caseStudies.formReadingTime")}</Label>
            <Input
              id="cs-reading-time"
              placeholder="e.g. 8 min read"
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
            />
          </div>
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-1.5">
          <ImageUpload
            label="Cover Image or Architecture Diagram"
            value={coverImage}
            onChange={setCoverImage}
            placeholder="https://... or upload to Blob"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <Label htmlFor="cs-excerpt">{t("caseStudies.formExcerpt")}</Label>
          <textarea
            id="cs-excerpt"
            rows={2}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("caseStudies.formExcerptPlaceholder")}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        {/* Technical Challenge */}
        <div className="space-y-1.5">
          <Label htmlFor="cs-challenge">{t("caseStudies.formChallenge")}</Label>
          <textarea
            id="cs-challenge"
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("caseStudies.formChallengePlaceholder")}
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
          />
        </div>

        {/* Engineering Solution */}
        <div className="space-y-1.5">
          <Label htmlFor="cs-solution">{t("caseStudies.formSolution")}</Label>
          <textarea
            id="cs-solution"
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("caseStudies.formSolutionPlaceholder")}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
          />
        </div>

        {/* Tech Stack */}
        <div className="space-y-1.5">
          <Label htmlFor="cs-stack">{t("caseStudies.formStack")}</Label>
          <Input
            id="cs-stack"
            placeholder="Next.js, TypeScript, Canvas API, Web Workers"
            value={stackString}
            onChange={(e) => setStackString(e.target.value)}
          />
        </div>

        {/* Quantifiable Results & Impact Metrics */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-sm">
              {t("caseStudies.formResults")}
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddResult}
              className="h-8 gap-1 text-xs"
            >
              <IconPlus className="size-3.5" />
              <span>{t("caseStudies.addResultMetric")}</span>
            </Button>
          </div>

          <div className="space-y-2.5">
            {results.map((res, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-md border bg-muted/30 items-center"
              >
                <div className="sm:col-span-3">
                  <Input
                    placeholder={t("caseStudies.metricLabel")}
                    value={res.metric}
                    onChange={(e) =>
                      handleResultChange(index, "metric", e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <Input
                    placeholder={t("caseStudies.metricValue")}
                    value={res.value}
                    onChange={(e) =>
                      handleResultChange(index, "value", e.target.value)
                    }
                    className="h-8 text-xs font-semibold"
                  />
                </div>
                <div className="sm:col-span-4">
                  <Input
                    placeholder={t("caseStudies.metricDesc")}
                    value={res.description || ""}
                    onChange={(e) =>
                      handleResultChange(index, "description", e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveResult(index)}
                    className="size-7 text-muted-foreground hover:text-destructive"
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Checkboxes */}
        <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={featured}
              onCheckedChange={(checked) => setFeatured(!!checked)}
            />
            <span>{t("caseStudies.formFeatured")}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={isPublished}
              onCheckedChange={(checked) => setIsPublished(!!checked)}
            />
            <span>{t("caseStudies.formPublished")}</span>
          </label>
        </div>
      </div>

      <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-1.5">
          {isSubmitting ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              <span>{t("common.loading")}</span>
            </>
          ) : (
            <span>{isEditing ? t("common.update") : t("common.save")}</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function CaseStudyFormDialog({
  open,
  onOpenChange,
  caseStudy,
  onSuccess,
}: CaseStudyFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
        {open && (
          <CaseStudyFormInner
            caseStudy={caseStudy}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
