"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blog } from "@/lib/api/types";
import { createBlog, updateBlog } from "@/lib/api/blogs";
import {
  DocumentWorkspaceShell,
  MetadataSection,
} from "@/components/editor/document-workspace";
import type {
  BlogBlock,
  SerializedEditorContent,
} from "@/components/editor/block-types";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconDeviceFloppy,
  IconLoader2,
  IconPhoto,
  IconTags,
  IconWorld,
  IconClock,
  IconSend,
  IconX,
  IconLink,
  IconFileText,
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
  const [isPublished] = useState(
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
    <DocumentWorkspaceShell
      backHref="/dashboard/blogs"
      backLabel="Back to Articles"
      description={
        isEditing
          ? "Update article content blocks, SEO metadata, categories, tags, and publishing status."
          : "Write and publish rich technical articles using the Notion-style block editor."
      }
      isPublished={isPublished}
      metaButtonLabel="Blog Metadata"
      metaPanelTitle="Blog Metadata & Settings"
      title={title}
      onTitleChange={handleTitleChange}
      titlePlaceholder="Enter a captivating article title..."
      initialContent={initialBlog?.content}
      onEditorChange={handleEditorChange}
      assetModule="blog"
      folderKey={slug || "draft"}
      blocks={blocks}
      metadataPanel={
        <>
          <MetadataSection
            title="Slug & URL"
            icon={<IconLink className="size-3.5 text-primary" />}
          >
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-mono shrink-0">/blog/</span>
              <Input
                value={slug}
                onChange={handleSlugChange}
                placeholder="article-slug"
                className="font-mono text-xs h-8 flex-1 bg-background"
              />
            </div>
          </MetadataSection>

          <MetadataSection
            title="Excerpt / Summary"
            icon={<IconFileText className="size-3.5 text-primary" />}
            right={
              <span className="text-[11px] text-muted-foreground font-mono">
                {excerpt.length} chars
              </span>
            }
          >
            <textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Provide a concise 1-2 sentence overview of the article for cards and SEO previews..."
              className="w-full text-xs bg-background border border-border rounded-md p-2.5 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
            />
          </MetadataSection>

          <MetadataSection
            title="Cover Image"
            icon={<IconPhoto className="size-3.5 text-primary" />}
          >
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              label="Cover Image"
              placeholder="Upload or paste image URL"
              module="blog"
              folderKey={slug || "draft"}
            />
          </MetadataSection>

          <MetadataSection
            title="Category & Tags"
            icon={<IconTags className="size-3.5 text-primary" />}
          >
            <div className="space-y-3.5">
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
                    <SelectTrigger className="h-8 text-xs w-full bg-background">
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
                      className="h-8 text-xs bg-background"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCustomCategory(false)}
                      className="h-8 px-2 text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Tags ({tags.length})
                </Label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-background border border-border rounded-md min-h-[38px] items-center">
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
                      className="w-full bg-transparent border-none text-xs outline-hidden p-0.5 text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Press Enter or comma to add a tag.
                </p>
              </div>
            </div>
          </MetadataSection>

          <MetadataSection
            title="Display & Visibility"
            icon={<IconClock className="size-3.5 text-primary" />}
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="readingTime" className="text-xs font-medium text-muted-foreground">
                  Estimated Reading Time
                </Label>
                <Input
                  id="readingTime"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  className="h-8 text-xs font-mono bg-background"
                />
              </div>

              <div className="space-y-2.5 pt-1">
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
                      onValueChange={(val: "large" | "small" | "standard") =>
                        setFeaturedType(val)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs bg-background">
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
            </div>
          </MetadataSection>

          <MetadataSection
            title="SEO & Social"
            icon={<IconWorld className="size-3.5 text-primary" />}
          >
            <div className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <Label htmlFor="metaTitle" className="text-xs text-muted-foreground">
                  Meta Title
                </Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "SEO Title..."}
                  className="h-8 text-xs bg-background"
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
                  className="w-full text-xs bg-background border border-border rounded-md p-2 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary/20 leading-relaxed resize-y"
                />
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
            <Link href="/dashboard/blogs">Cancel</Link>
          </Button>
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
        </>
      }
    />
  );
}
