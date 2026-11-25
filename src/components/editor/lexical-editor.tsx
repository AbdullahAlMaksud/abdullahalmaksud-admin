"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { TRANSFORMERS } from "@lexical/markdown";
import type { EditorState } from "lexical";

import { editorTheme } from "./editor-theme";
import { EditorToolbar } from "./editor-toolbar";
import { FloatingToolbar } from "./floating-toolbar";
import { KeyboardShortcutsPlugin } from "./keyboard-shortcuts-plugin";
import { BlockGutterPlugin } from "./block-gutter-plugin";
import { SlashCommandPlugin } from "./slash-command-plugin";
import { InsertImageDialog } from "./insert-image-dialog";
import {
  insertImageBlock,
  type ImageInsertRequest,
} from "./block-palette";
import { ImageNode } from "./image-node";
import { TableNode } from "./table-node";
import {
  lexicalToBlocks,
  populateEditorFromBlocks,
} from "./block-serializer";
import type { BlogBlock, SerializedEditorContent } from "./block-types";
import { IconBraces, IconWriting } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export interface LexicalBlockEditorProps {
  initialContent?: unknown;
  onChange?: (blocks: BlogBlock[], serialized: SerializedEditorContent) => void;
  placeholder?: string;
  className?: string;
  onOpenBlockInspector?: () => void;
  borderless?: boolean;
  assetModule?: string;
  folderKey?: string;
  showToolbar?: boolean;
}

/**
 * Hydrates initial content when the editor mounts.
 */
function InitializerPlugin({ initialContent }: { initialContent?: unknown }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && initialContent) {
      initializedRef.current = true;
      populateEditorFromBlocks(editor, initialContent);
    }
  }, [editor, initialContent]);

  return null;
}

/**
 * Coordinates image uploads / gallery selection inside the active LexicalComposer context.
 */
function EditorImageModalPlugin({
  request,
  onClose,
  assetModule,
  folderKey,
}: {
  request: ImageInsertRequest | null;
  onClose: () => void;
  assetModule: string;
  folderKey: string;
}) {
  const [editor] = useLexicalComposerContext();

  return (
    <InsertImageDialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      assetModule={assetModule}
      folderKey={folderKey}
      onConfirm={({ src, caption, altText }) => {
        insertImageBlock({
          editor,
          src,
          caption,
          altText,
          request: request ?? undefined,
        });
      }}
    />
  );
}

/**
 * Notion-style modular block editor supporting left-gutter '+' insertion & drag-and-drop
 * reordering, '/' slash commands, floating inline selection toolbar, keyboard shortcuts,
 * and inline image + caption blocks.
 */
export function LexicalBlockEditor({
  initialContent,
  onChange,
  placeholder = "Type '/' for commands, or start writing... (Ctrl+B, Ctrl+I, Ctrl+U)",
  className = "",
  onOpenBlockInspector,
  borderless = false,
  assetModule = "blog",
  folderKey = "misc",
  showToolbar = true,
}: LexicalBlockEditorProps) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [imageModalRequest, setImageModalRequest] =
    useState<ImageInsertRequest | null>(null);
  const [stats, setStats] = useState({
    blockCount: 0,
    wordCount: 0,
    charCount: 0,
  });

  const onFloatingRef = (elem: HTMLDivElement | null) => {
    if (elem !== null) {
      setFloatingAnchorElem(elem);
    }
  };

  const editorConfig: InitialConfigType = {
    namespace: "AdminLexicalBlockEditor",
    theme: editorTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      HorizontalRuleNode,
      ImageNode,
      TableNode,
    ],
    onError(error: Error) {
      console.error("[LexicalEditor Error]:", error);
    },
  };

  const handleEditorChange = (editorState: EditorState) => {
    const serialized = lexicalToBlocks(editorState);
    setStats({
      blockCount: serialized.blocks.length,
      wordCount: serialized.wordCount,
      charCount: serialized.characterCount,
    });
    if (onChange) {
      onChange(serialized.blocks, serialized);
    }
  };

  return (
    <div
      className={
        borderless
          ? `flex flex-1 flex-col w-full bg-transparent ${className}`
          : `flex flex-col border border-border rounded-xl bg-card shadow-xs overflow-hidden transition-colors ${className}`
      }
    >
      <LexicalComposer initialConfig={editorConfig}>
        {showToolbar && (
          <EditorToolbar
            borderless={borderless}
            onRequestImage={() => setImageModalRequest({ mode: "cursor" })}
          />
        )}

        {/* Content Editable Canvas with Left Gutter Margin for + / Drag Handle */}
        <div
          ref={onFloatingRef}
          className={
            borderless
              ? "relative flex-1 min-h-[480px] py-5 pl-11 sm:pl-14 text-foreground focus-within:outline-hidden"
              : "relative min-h-[360px] py-4 pl-11 sm:pl-14 pr-5 text-foreground focus-within:outline-hidden"
          }
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={
                  borderless
                    ? "min-h-[450px] outline-hidden text-sm sm:text-base leading-relaxed selection:bg-primary/20"
                    : "min-h-[330px] outline-hidden text-sm sm:text-base leading-relaxed selection:bg-primary/20"
                }
                aria-placeholder={placeholder}
                placeholder={
                  <div
                    className={
                      borderless
                        ? "pointer-events-none absolute left-11 sm:left-14 top-5 select-none text-muted-foreground/45 text-sm sm:text-base"
                        : "pointer-events-none absolute left-11 sm:left-14 top-4 select-none text-muted-foreground/50 text-sm sm:text-base"
                    }
                  >
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <HorizontalRulePlugin />
          <KeyboardShortcutsPlugin />
          <FloatingToolbar />
          <SlashCommandPlugin
            onRequestImage={(req) => setImageModalRequest(req)}
          />
          {floatingAnchorElem && (
            <BlockGutterPlugin
              anchorElem={floatingAnchorElem}
              onRequestImage={(req) => setImageModalRequest(req)}
            />
          )}
          <EditorImageModalPlugin
            request={imageModalRequest}
            onClose={() => setImageModalRequest(null)}
            assetModule={assetModule}
            folderKey={folderKey}
          />
          <InitializerPlugin initialContent={initialContent} />
          <OnChangePlugin onChange={handleEditorChange} />
        </div>

        {/* Status Bar */}
        <div
          className={
            borderless
              ? "flex flex-wrap items-center justify-between gap-3 pt-3 pl-11 sm:pl-14 border-t border-neutral-200/70 text-xs text-muted-foreground"
              : "flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground"
          }
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <IconWriting className="size-3.5 text-primary" />
              <span>
                {stats.blockCount} {stats.blockCount === 1 ? "Block" : "Blocks"}
              </span>
            </span>
            <span>{stats.wordCount} words</span>
            <span className="hidden sm:inline">{stats.charCount} characters</span>
            <span className="hidden md:inline text-muted-foreground/60 font-mono text-[11px]">
              Type &apos;/&apos; for blocks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBlockInspector && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenBlockInspector}
                className="h-7 px-2.5 text-xs gap-1.5 font-mono text-muted-foreground hover:text-foreground"
              >
                <IconBraces className="size-3.5 text-primary" />
                <span>Inspect Blocks</span>
              </Button>
            )}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
