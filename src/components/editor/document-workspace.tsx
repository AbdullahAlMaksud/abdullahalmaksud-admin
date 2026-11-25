"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageSubHeader,
  StickyActionFooter,
} from "@/components/dashboard-01/components/sticky-action-bar";
import { LexicalBlockEditor } from "./lexical-editor";
import { BlockInspectorDialog } from "./block-inspector-dialog";
import type { BlogBlock, SerializedEditorContent } from "./block-types";
import {
  IconBraces,
  IconFileText,
  IconLayoutSidebarRight,
  IconX,
} from "@tabler/icons-react";

export interface MetadataSectionProps {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Plain borderless section block for right-hand document metadata drawers.
 */
export function MetadataSection({
  title,
  icon,
  right,
  children,
}: MetadataSectionProps) {
  return (
    <section className="py-4 space-y-2.5 first:pt-1 last:pb-1">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-foreground/85">
          {icon}
          <span>{title}</span>
        </h3>
        {right}
      </div>
      <div>{children}</div>
    </section>
  );
}

export interface DocumentWorkspaceShellProps {
  backHref: string;
  backLabel: string;
  description: string;
  isPublished: boolean;
  publishedBadgeText?: string;
  draftBadgeText?: string;
  metaButtonLabel: string;
  metaPanelTitle: string;
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  titlePlaceholder: string;
  titleIcon?: React.ReactNode;
  initialContent?: unknown;
  onEditorChange: (blocks: BlogBlock[], serialized: SerializedEditorContent) => void;
  editorPlaceholder?: string;
  assetModule: string;
  folderKey: string;
  blocks: BlogBlock[];
  metadataPanel: React.ReactNode;
  footerActions: React.ReactNode;
  defaultMetaOpen?: boolean;
}

/**
 * Shared Notion-style modular writing workspace shell (full-screen borderless block canvas,
 * toggleable right-side metadata drawer, sticky footer actions, and block inspector).
 */
export function DocumentWorkspaceShell({
  backHref,
  backLabel,
  description,
  isPublished,
  publishedBadgeText = "● Live / Published",
  draftBadgeText = "Draft Mode",
  metaButtonLabel,
  metaPanelTitle,
  title,
  onTitleChange,
  titlePlaceholder,
  titleIcon,
  initialContent,
  onEditorChange,
  editorPlaceholder,
  assetModule,
  folderKey,
  blocks,
  metadataPanel,
  footerActions,
  defaultMetaOpen = false,
}: DocumentWorkspaceShellProps) {
  const [isMetaOpen, setIsMetaOpen] = useState(defaultMetaOpen);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  return (
    <div className="flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        backHref={backHref}
        backLabel={backLabel}
        description={description}
        right={
          <>
            <Badge
              variant={isPublished ? "default" : "outline"}
              className={`text-xs font-medium ${
                isPublished
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}
            >
              {isPublished ? publishedBadgeText : draftBadgeText}
            </Badge>
            <Button
              type="button"
              variant={isMetaOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsMetaOpen((prev) => !prev)}
              aria-expanded={isMetaOpen}
              className="h-8 gap-1.5 px-2.5 text-xs font-medium"
            >
              <IconLayoutSidebarRight className="size-3.5" />
              <span>{metaButtonLabel}</span>
            </Button>
          </>
        }
      />

      {/* Main Writing Canvas + Toggleable Metadata Side Panel */}
      <div className="flex flex-1 min-w-0 flex-col lg:flex-row">
        <div className="flex flex-1 min-w-0 flex-col px-4 sm:px-6 lg:px-10 py-6 gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex w-8 sm:w-11 shrink-0 items-center justify-start pl-1 text-muted-foreground/60"
            >
              {titleIcon ?? <IconFileText className="size-6 stroke-[1.6]" />}
            </span>
            <input
              id="document-title"
              type="text"
              placeholder={titlePlaceholder}
              value={title}
              onChange={onTitleChange}
              className="min-w-0 flex-1 bg-transparent border-0 p-0 text-2xl sm:text-3xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/45 focus:outline-none"
            />
          </div>

          <LexicalBlockEditor
            borderless
            assetModule={assetModule}
            folderKey={folderKey}
            initialContent={initialContent}
            onChange={onEditorChange}
            placeholder={editorPlaceholder}
          />
        </div>

        {isMetaOpen && (
          <aside className="w-full lg:w-[360px] xl:w-[390px] shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200/80 bg-neutral-50/40 dark:bg-muted/10 px-4 py-4 lg:px-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {metaPanelTitle}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsMetaOpen(false)}
                aria-label={`Close ${metaButtonLabel}`}
              >
                <IconX className="size-3.5" />
              </Button>
            </div>

            <div className="divide-y divide-neutral-200/80 dark:divide-border/70">
              {metadataPanel}
            </div>
          </aside>
        )}
      </div>

      <StickyActionFooter
        left={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsInspectorOpen(true)}
            className="h-8 gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            <IconBraces className="size-4 text-primary" />
            <span>Inspect Blocks ({blocks.length})</span>
          </Button>
        }
        right={footerActions}
      />

      <BlockInspectorDialog
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        blocks={blocks}
      />
    </div>
  );
}
