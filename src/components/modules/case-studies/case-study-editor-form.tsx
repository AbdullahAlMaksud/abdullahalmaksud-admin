"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CaseStudy, CaseStudyResult } from "@/lib/api/types";
import { createCaseStudy, updateCaseStudy } from "@/lib/api/case-studies";
import {
  DocumentWorkspaceShell,
  MetadataSection,
} from "@/components/editor/document-workspace";
import { LexicalBlockEditor } from "@/components/editor/lexical-editor";
import type {
  BlogBlock,
  SerializedEditorContent,
} from "@/components/editor/block-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  IconBriefcase,
  IconChartBar,
  IconDeviceFloppy,
  IconFileText,
  IconLink,
  IconLoader2,
  IconPhoto,
  IconPlus,
  IconSend,
  IconTags,
  IconTarget,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

export interface CaseStudyEditorFormProps {
  caseStudy?: CaseStudy | null;
  mode?: "create" | "edit";
  variant?: "page" | "embedded";
  onCancel?: () => void;
  onSuccess?: (caseStudy: CaseStudy) => void;
}

export function CaseStudyEditorForm({
  caseStudy,
  mode,
  variant = "page",
  onCancel,
  onSuccess,
}: CaseStudyEditorFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isEditing = mode ? mode === "edit" : !!caseStudy;

  const [title, setTitle] = useState(caseStudy?.title || "");
  const [slug, setSlug] = useState(caseStudy?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(caseStudy?.excerpt || "");
  const [coverImage, setCoverImage] = useState(caseStudy?.coverImage || "");
  const [category, setCategory] = useState(caseStudy?.category || "Architecture");
  const [industry, setIndustry] = useState(
    caseStudy?.industry || "Enterprise SaaS",
  );
  const [client, setClient] = useState(caseStudy?.client || "");
  const [projectSlug, setProjectSlug] = useState(caseStudy?.projectSlug || "");
  const [duration, setDuration] = useState(caseStudy?.duration || "3 Months");
  const [readingTime, setReadingTime] = useState(
    caseStudy?.readingTime || "8 min read",
  );
  const [challenge, setChallenge] = useState(caseStudy?.challenge || "");
  const [solution, setSolution] = useState(caseStudy?.solution || "");
  const [stackString, setStackString] = useState(
    caseStudy
      ? (caseStudy.stack?.length ? caseStudy.stack : caseStudy.tags)?.join(
          ", ",
        ) || ""
      : "Next.js, TypeScript, PostgreSQL, Tailwind CSS",
  );
  const [featured, setFeatured] = useState(!!caseStudy?.featured);
  const [isPublished, setIsPublished] = useState(
    caseStudy ? !!caseStudy.isPublished : true,
  );
  const [results, setResults] = useState<CaseStudyResult[]>(
    caseStudy?.results && caseStudy.results.length > 0
      ? caseStudy.results
      : [
          {
            metric: "Latency",
            value: "85% reduction",
            description: "Sub-frame rendering pipeline",
          },
        ],
  );
  const [blocks, setBlocks] = useState<BlogBlock[]>(() =>
    Array.isArray(caseStudy?.content) ? caseStudy.content : [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slugify = (val: string) =>
    val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugManual) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(slugify(e.target.value));
  };

  const handleEditorChange = (
    newBlocks: BlogBlock[],
    serialized: SerializedEditorContent,
  ) => {
    setBlocks(newBlocks);
    if (serialized.wordCount > 0) {
      const minutes = Math.max(1, Math.ceil(serialized.wordCount / 200));
      setReadingTime(`${minutes} min read`);
    }
  };

  const handleAddResult = () => {
    setResults([...results, { metric: "", value: "", description: "" }]);
  };

  const handleRemoveResult = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleResultChange = (
    index: number,
    field: keyof CaseStudyResult,
    value: string,
  ) => {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: value };
    setResults(updated);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard/case-studies");
    }
  };

  const saveCaseStudy = async (publishState?: boolean) => {
    if (!title.trim()) {
      toast.error(t("caseStudies.errorTitle"));
      return;
    }
    if (!slug.trim()) {
      toast.error("Case study slug is required");
      return;
    }

    const nextPublished = publishState ?? isPublished;

    const stack = stackString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanedResults = results.filter(
      (r) => r.metric.trim() || r.value.trim(),
    );

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: blocks.length > 0 ? blocks : caseStudy?.content ?? [],
      contentType: "lexical" as const,
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
      isPublished: nextPublished,
    };

    try {
      setIsSubmitting(true);
      const targetId = caseStudy?.id || caseStudy?._id;
      if (isEditing && targetId) {
        const res = await updateCaseStudy(targetId, payload);
        toast.success(t("caseStudies.updateSuccess"));
        if (res.data) onSuccess?.(res.data);
      } else {
        const res = await createCaseStudy(payload);
        toast.success(t("caseStudies.addSuccess"));
        if (res.data) onSuccess?.(res.data);
      }
      if (variant === "page") {
        router.push("/dashboard/case-studies");
        router.refresh();
      } else {
        onCancel?.();
      }
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to save case study";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "page") {
    return (
      <DocumentWorkspaceShell
        backHref="/dashboard/case-studies"
        backLabel="Back to Case Studies"
        description={t("caseStudies.formSubtitle")}
        isPublished={isPublished}
        metaButtonLabel="Case Study Metadata"
        metaPanelTitle="Case Study Metadata & Settings"
        title={title}
        onTitleChange={handleTitleChange}
        titlePlaceholder="Enter a compelling case study title..."
        titleIcon={<IconBriefcase className="size-6 stroke-[1.6]" />}
        initialContent={caseStudy?.content}
        onEditorChange={handleEditorChange}
        editorPlaceholder="Type '/' for commands, or document the case study architecture, decisions, and outcomes..."
        assetModule="casestudy"
        folderKey={slug || "draft"}
        blocks={blocks}
        metadataPanel={
          <>
            <MetadataSection
              title="Slug & URL"
              icon={<IconLink className="size-3.5 text-primary" />}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-mono shrink-0">
                  /case-studies/
                </span>
                <Input
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="sub-frame-latency-visualizer"
                  className="font-mono text-xs h-8 flex-1 bg-background"
                />
              </div>
            </MetadataSection>

            <MetadataSection
              title={t("caseStudies.formExcerpt")}
              icon={<IconFileText className="size-3.5 text-primary" />}
              right={
                <span className="text-[11px] text-muted-foreground font-mono">
                  {excerpt.length} chars
                </span>
              }
            >
              <textarea
                id="cs-excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={t("caseStudies.formExcerptPlaceholder")}
                className="w-full text-xs bg-background border border-border rounded-md p-2.5 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
              />
            </MetadataSection>

            <MetadataSection
              title="Cover & Architecture Visual"
              icon={<IconPhoto className="size-3.5 text-primary" />}
            >
              <ImageUpload
                label="Cover Image"
                value={coverImage}
                onChange={setCoverImage}
                module="casestudy"
                folderKey={slug || "draft"}
              />
            </MetadataSection>

            <MetadataSection
              title="Project & Engagement"
              icon={<IconBriefcase className="size-3.5 text-primary" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="cs-category" className="text-xs text-muted-foreground">
                    {t("caseStudies.formCategory")}
                  </Label>
                  <Input
                    id="cs-category"
                    placeholder="e.g. Architecture"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cs-industry" className="text-xs text-muted-foreground">
                    {t("caseStudies.formIndustry")}
                  </Label>
                  <Input
                    id="cs-industry"
                    placeholder="e.g. Enterprise SaaS"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cs-client" className="text-xs text-muted-foreground">
                    {t("caseStudies.formClient")}
                  </Label>
                  <Input
                    id="cs-client"
                    placeholder="e.g. Al Maksud Labs"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cs-project-slug" className="text-xs text-muted-foreground">
                    {t("caseStudies.formProjectSlug")}
                  </Label>
                  <Input
                    id="cs-project-slug"
                    placeholder="e.g. telemetry"
                    value={projectSlug}
                    onChange={(e) => setProjectSlug(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cs-duration" className="text-xs text-muted-foreground">
                    {t("caseStudies.formDuration")}
                  </Label>
                  <Input
                    id="cs-duration"
                    placeholder="e.g. 3 Months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cs-reading-time" className="text-xs text-muted-foreground">
                    {t("caseStudies.formReadingTime")}
                  </Label>
                  <Input
                    id="cs-reading-time"
                    placeholder="e.g. 8 min read"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    className="h-8 text-xs font-mono bg-background"
                  />
                </div>
              </div>
            </MetadataSection>

            <MetadataSection
              title="Challenge & Solution"
              icon={<IconTarget className="size-3.5 text-primary" />}
            >
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <Label htmlFor="cs-challenge" className="text-xs text-muted-foreground">
                    {t("caseStudies.formChallenge")}
                  </Label>
                  <textarea
                    id="cs-challenge"
                    rows={3}
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder={t("caseStudies.formChallengePlaceholder")}
                    className="w-full text-xs bg-background border border-border rounded-md p-2.5 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cs-solution" className="text-xs text-muted-foreground">
                    {t("caseStudies.formSolution")}
                  </Label>
                  <textarea
                    id="cs-solution"
                    rows={3}
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder={t("caseStudies.formSolutionPlaceholder")}
                    className="w-full text-xs bg-background border border-border rounded-md p-2.5 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
                  />
                </div>
              </div>
            </MetadataSection>

            <MetadataSection
              title={t("caseStudies.formResults")}
              icon={<IconChartBar className="size-3.5 text-primary" />}
              right={
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleAddResult}
                  className="gap-1 text-primary hover:text-primary"
                >
                  <IconPlus className="size-3" />
                  <span>{t("caseStudies.addResultMetric")}</span>
                </Button>
              }
            >
              <div className="divide-y divide-border/50">
                {results.map((res, index) => (
                  <div
                    key={index}
                    className="space-y-1.5 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <Input
                        placeholder={t("caseStudies.metricLabel")}
                        value={res.metric}
                        onChange={(e) =>
                          handleResultChange(index, "metric", e.target.value)
                        }
                        className="h-7.5 text-xs flex-1 bg-background"
                      />
                      <Input
                        placeholder={t("caseStudies.metricValue")}
                        value={res.value}
                        onChange={(e) =>
                          handleResultChange(index, "value", e.target.value)
                        }
                        className="h-7.5 text-xs font-semibold flex-1 bg-background"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveResult(index)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        title="Remove metric"
                      >
                        <IconTrash className="size-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder={t("caseStudies.metricDesc")}
                      value={res.description || ""}
                      onChange={(e) =>
                        handleResultChange(index, "description", e.target.value)
                      }
                      className="h-7.5 text-[11px] bg-background"
                    />
                  </div>
                ))}
              </div>
            </MetadataSection>

            <MetadataSection
              title="Stack & Visibility"
              icon={<IconTags className="size-3.5 text-primary" />}
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cs-stack" className="text-xs text-muted-foreground">
                    {t("caseStudies.formStack")}
                  </Label>
                  <Input
                    id="cs-stack"
                    placeholder="Next.js, TypeScript, Canvas API"
                    value={stackString}
                    onChange={(e) => setStackString(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <Checkbox
                      checked={featured}
                      onCheckedChange={(checked) => setFeatured(!!checked)}
                    />
                    <span>{t("caseStudies.formFeatured")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <Checkbox
                      checked={isPublished}
                      onCheckedChange={(checked) => setIsPublished(!!checked)}
                    />
                    <span>{t("caseStudies.formPublished")}</span>
                  </label>
                </div>
              </div>
            </MetadataSection>
          </>
        }
        footerActions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs"
            >
              <Link href="/dashboard/case-studies">{t("common.cancel")}</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => saveCaseStudy(false)}
              className="h-8 gap-1.5 text-xs"
            >
              {isSubmitting ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconDeviceFloppy className="size-3.5" />
              )}
              <span>Save Draft</span>
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={() => saveCaseStudy(true)}
              className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconSend className="size-3.5" />
              )}
              <span>{isEditing ? "Update & Publish" : "Publish Case Study"}</span>
            </Button>
          </>
        }
      />
    );
  }

  return (
    <form
      id="case-study-editor-form"
      onSubmit={(e) => {
        e.preventDefault();
        void saveCaseStudy();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="cs-title" className="text-xs font-semibold">
            {t("caseStudies.formTitle")}
          </Label>
          <Input
            id="cs-title"
            placeholder={t("caseStudies.formTitlePlaceholder")}
            value={title}
            onChange={handleTitleChange}
            className="h-8.5 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cs-slug" className="text-xs font-semibold">
            {t("caseStudies.formSlug")}
          </Label>
          <Input
            id="cs-slug"
            placeholder="sub-frame-latency-visualizer"
            value={slug}
            onChange={handleSlugChange}
            className="h-8.5 text-xs"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cs-category" className="text-xs font-semibold">
            {t("caseStudies.formCategory")}
          </Label>
          <Input
            id="cs-category"
            placeholder="e.g. Architecture, Scaling"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8.5 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cs-client" className="text-xs font-semibold">
            {t("caseStudies.formClient")}
          </Label>
          <Input
            id="cs-client"
            placeholder="e.g. Al Maksud Labs"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="h-8.5 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cs-duration" className="text-xs font-semibold">
            {t("caseStudies.formDuration")}
          </Label>
          <Input
            id="cs-duration"
            placeholder="e.g. 3 Months"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="h-8.5 text-xs"
          />
        </div>
      </div>

      <ImageUpload
        label="Cover Image or Architecture Diagram"
        value={coverImage}
        onChange={setCoverImage}
        module="casestudy"
        folderKey={slug || "draft"}
      />

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          Case Study Narrative (Block Editor)
        </Label>
        <LexicalBlockEditor
          borderless={false}
          assetModule="casestudy"
          folderKey={slug || "draft"}
          initialContent={caseStudy?.content}
          onChange={handleEditorChange}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t">
        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <Checkbox
            checked={featured}
            onCheckedChange={(checked) => setFeatured(!!checked)}
          />
          <span>{t("caseStudies.formFeatured")}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <Checkbox
            checked={isPublished}
            onCheckedChange={(checked) => setIsPublished(!!checked)}
          />
          <span>{t("caseStudies.formPublished")}</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
          className="gap-1.5"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="size-3.5 animate-spin" />
              <span>{t("common.loading")}</span>
            </>
          ) : (
            <span>{isEditing ? t("common.update") : t("common.save")}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
