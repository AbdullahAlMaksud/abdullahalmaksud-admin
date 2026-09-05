"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blog } from "@/lib/api/types";
import { createBlog, updateBlog } from "@/lib/api/blogs";
import { LexicalBlockEditor } from "@/components/editor/lexical-editor";
import { BlockInspectorDialog } from "@/components/editor/block-inspector-dialog";
import type {
  BlogBlock,
  SerializedEditorContent,
} from "@/components/editor/block-types";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconLoader2,
  IconBraces,
  IconPhoto,
  IconTags,
  IconWorld,
  IconClock,
  IconSend,
  IconX,
  IconSparkles,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface BlogEditorFormProps {
  initialBlog?: Blog | null;
  mode?: "create" | "edit";
}

const DEFAULT_CATEGORIES = [
  "Engineering",
  "Web Development",
  "Architecture",
  "AI & Machine Learning",
  "System Design",
  "Design Systems",
  "Career & Insights",
  "Tutorial",
];

export function BlogEditorForm({
  initialBlog,
  mode = "create",
}: BlogEditorFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit" && !!initialBlog;

  // Main post fields
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(!!initialBlog?.slug);
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || "");
  const [coverImage, setCoverImage] = useState(
    initialBlog?.coverImage || initialBlog?.cover || ""
  );
  const [author] = useState(
    typeof initialBlog?.author === "object"
      ? initialBlog?.author?.name || "Abdullah Al Maksud"
      : initialBlog?.author || "Abdullah Al Maksud"
  );
  const [category, setCategory] = useState(
    initialBlog?.category || "Engineering"
  );
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Tags
  const [tags, setTags] = useState<string[]>(
    initialBlog?.tags && Array.isArray(initialBlog.tags)
      ? initialBlog.tags
      : ["nextjs", "webdev"]
  );
  const [tagInput, setTagInput] = useState("");

  // Publish & Featured
  const [isPublished, setIsPublished] = useState(
    !!(initialBlog?.isPublished ?? initialBlog?.published ?? false)
  );
  const [featured, setFeatured] = useState(!!initialBlog?.featured);
  const [featuredType, setFeaturedType] = useState<
    "large" | "small" | "standard" | ""
  >(initialBlog?.featuredType || "standard");
  const [readingTime, setReadingTime] = useState(
    initialBlog?.readingTime || "5 min read"
  );

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialBlog?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    initialBlog?.metaDescription || ""
  );

  // Content Blocks
  const [blocks, setBlocks] = useState<BlogBlock[]>(() => {
    if (Array.isArray(initialBlog?.content)) {
      return initialBlog.content;
    }
    return [];
  });

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Auto-slugify
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
    if (!metaTitle) {
      setMetaTitle(val);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(slugify(e.target.value));
  };

  const handleEditorChange = (
    newBlocks: BlogBlock[],
    serialized: SerializedEditorContent
  ) => {
    setBlocks(newBlocks);
    // Auto-calculate reading time: ~200 words per minute
    const minutes = Math.max(1, Math.ceil(serialized.wordCount / 200));
    setReadingTime(`${minutes} min read`);
  };

  // Tag management
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async (publishState: boolean) => {
    if (!title.trim()) {
      toast.error("Please enter an article title.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Please provide a valid slug for the article URL.");
      return;
    }
    if (blocks.length === 0) {
      toast.error("Please write some content in the editor before saving.");
      return;
    }

    try {
      setIsSubmitting(true);

      const finalCategory = isCustomCategory
        ? customCategory.trim() || "Engineering"
        : category;

      // Storing block-by-block data directly into `content`
      const payload: Partial<Blog> = {
        title: title.trim(),
        slug: slug.trim(),
        content: blocks, // Array of structured blocks (BlogBlock[])
        contentType: "lexical",
        excerpt: excerpt.trim(),
        cover: coverImage.trim(),
        coverImage: coverImage.trim(),
        author: {
          name: author,
          avatar: "/images/avatar.jpg",
          bio: "Developer, designer, writer.",
        },
        tags,
        category: finalCategory,
        readingTime,
        featured,
        featuredType: featured ? featuredType : "",
        isPublished: publishState,
        published: publishState,
        publishedAt: publishState
          ? initialBlog?.publishedAt || new Date().toISOString().split("T")[0]
          : "",
        metaTitle: metaTitle.trim() || title.trim(),
        metaDescription: metaDescription.trim() || excerpt.trim(),
      };

      if (isEditing) {
        const blogId = initialBlog.id || initialBlog._id;
        if (!blogId) throw new Error("Blog ID is missing for update.");
        await updateBlog(blogId, payload);
        toast.success(
          publishState
            ? "Article published successfully!"
            : "Draft saved successfully!"
        );
      } else {
        await createBlog(payload as any);
        toast.success(
          publishState
            ? "Article created and published!"
            : "Draft created successfully!"
        );
      }

      // Return to blogs table
      router.push("/dashboard/blogs");
      router.refresh();
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Failed to save article";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Sticky Top Action Header */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 py-3 px-4 -mx-4 sm:mx-0 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border/80 rounded-xl">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/blogs">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <IconArrowLeft className="size-4" />
              <span>All Articles</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <Badge
            variant={isPublished ? "default" : "outline"}
            className={`text-xs font-medium ${
              isPublished
                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-500 border-amber-500/30"
            }`}
          >
            {isPublished ? "● Live / Published" : "Draft Mode"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Block Inspector Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsInspectorOpen(true)}
            className="h-8 gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            <IconBraces className="size-4 text-primary" />
            <span className="hidden sm:inline">Inspect Blocks ({blocks.length})</span>
          </Button>

          {/* Save Draft */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="h-8 gap-1.5 text-xs"
          >
            {isSubmitting ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <IconDeviceFloppy className="size-3.5" />
            )}
            <span>Save Draft</span>
          </Button>

          {/* Publish / Update */}
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <IconSend className="size-3.5" />
            )}
            <span>{isEditing ? "Update & Publish" : "Publish Article"}</span>
          </Button>
        </div>
      </div>

      {/* Editor Body: Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Title & Lexical Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Slug Header Card */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                Article Title
              </Label>
              <Input
                id="title"
                placeholder="Enter a captivating article title..."
                value={title}
                onChange={handleTitleChange}
                className="text-lg sm:text-xl font-bold h-12 border-border/80 focus-visible:ring-primary/20"
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 text-xs">
              <span className="text-muted-foreground font-mono">Slug: /blog/</span>
              <Input
                value={slug}
                onChange={handleSlugChange}
                placeholder="article-slug"
                className="font-mono text-xs h-8 flex-1 border-dashed"
              />
            </div>
          </div>

          {/* Lexical Block Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <IconSparkles className="size-3.5 text-primary" />
                <span>Rich Block Content</span>
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                Lexical Block Engine
              </span>
            </div>

            <LexicalBlockEditor
              initialContent={initialBlog?.content}
              onChange={handleEditorChange}
              onOpenBlockInspector={() => setIsInspectorOpen(true)}
            />
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="excerpt" className="text-xs font-medium text-foreground">
                Article Excerpt / Summary
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {excerpt.length} chars
              </span>
            </div>
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Provide a concise 1-2 sentence overview of the article for cards and SEO previews..."
              className="w-full text-xs sm:text-sm bg-muted/30 border border-border rounded-lg p-3 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Right Column: Metadata & Settings Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Cover Image */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <IconPhoto className="size-4 text-primary" />
                <span>Cover Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={coverImage}
                onChange={setCoverImage}
                label="Cover Image"
                placeholder="Upload or paste image URL"
              />
            </CardContent>
          </Card>

          {/* Card: Taxonomy & Category */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <IconTags className="size-4 text-primary" />
                <span>Category & Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Category
                </Label>
                {!isCustomCategory ? (
                  <Select
                    value={category}
                    onValueChange={(val) => {
                      if (val === "custom") {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(val);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-xs">
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className="text-xs text-primary font-medium">
                        + Add Custom Category...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="e.g. Cloud Infrastructure"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="h-9 text-xs"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCustomCategory(false)}
                      className="h-9 px-2 text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Tags Manager */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Tags ({tags.length})
                </Label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 border border-border rounded-lg min-h-[42px] items-center">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive transition-colors ml-0.5"
                      >
                        <IconX className="size-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex-1 min-w-[100px] flex items-center">
                    <input
                      type="text"
                      placeholder="Add tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="w-full bg-transparent border-none text-xs outline-hidden p-1 text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Press Enter or comma to add a tag.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card: Reading Time & Featured */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <IconClock className="size-4 text-primary" />
                <span>Display & Visibility</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Reading Time */}
              <div className="space-y-1.5">
                <Label htmlFor="readingTime" className="text-xs font-medium text-muted-foreground">
                  Estimated Reading Time
                </Label>
                <Input
                  id="readingTime"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  className="h-8 text-xs font-mono"
                />
              </div>

              {/* Featured toggle */}
              <div className="space-y-3 pt-2 border-t border-border/80">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={featured}
                    onCheckedChange={(checked) => setFeatured(!!checked)}
                  />
                  <Label
                    htmlFor="featured"
                    className="text-xs font-medium cursor-pointer"
                  >
                    Feature this article on homepage
                  </Label>
                </div>

                {featured && (
                  <div className="pl-6 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Featured Placement
                    </Label>
                    <Select
                      value={featuredType}
                      onValueChange={(val: any) => setFeaturedType(val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Placement type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard" className="text-xs">
                          Standard Featured
                        </SelectItem>
                        <SelectItem value="large" className="text-xs">
                          Large Hero Spotlight
                        </SelectItem>
                        <SelectItem value="small" className="text-xs">
                          Small Featured Side
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card: SEO Settings */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <IconWorld className="size-4 text-primary" />
                <span>SEO & Social</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="metaTitle" className="text-xs text-muted-foreground">
                  Meta Title
                </Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "SEO Title..."}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="metaDesc" className="text-xs text-muted-foreground">
                  Meta Description
                </Label>
                <textarea
                  id="metaDesc"
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={excerpt || "Search snippet..."}
                  className="w-full text-xs bg-muted/30 border border-border rounded-lg p-2 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Block Inspector Modal */}
      <BlockInspectorDialog
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        blocks={blocks}
      />
    </div>
  );
}
