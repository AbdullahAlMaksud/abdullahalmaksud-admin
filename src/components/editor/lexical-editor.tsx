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
import {
  lexicalToBlocks,
  populateEditorFromBlocks,
} from "./block-serializer";
import type { BlogBlock, SerializedEditorContent } from "./block-types";
import { IconBraces, IconWriting } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface LexicalBlockEditorProps {
  initialContent?: any;
  onChange?: (blocks: BlogBlock[], serialized: SerializedEditorContent) => void;
  placeholder?: string;
  className?: string;
  onOpenBlockInspector?: () => void;
}

/**
 * Hydrates initial content when the editor mounts or changes.
 */
function InitializerPlugin({
  initialContent,
}: {
  initialContent?: any;
}) {
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

export function LexicalBlockEditor({
  initialContent,
  onChange,
  placeholder = "Start writing your article... (Type '#' for heading, '>' for quote, '-' for list)",
  className = "",
  onOpenBlockInspector,
}: LexicalBlockEditorProps) {
  const [stats, setStats] = useState({
    blockCount: 0,
    wordCount: 0,
    charCount: 0,
  });

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
    ],
    onError(error: Error) {
      console.error("[Lexical Editor Error]:", error);
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
      className={`flex flex-col border border-border rounded-xl bg-card shadow-xs overflow-hidden transition-colors ${className}`}
    >
      <LexicalComposer initialConfig={editorConfig}>
        {/* Rich Interactive Sticky Toolbar */}
        <EditorToolbar />

        {/* Content Editable Area */}
        <div className="relative min-h-[380px] px-6 py-4 text-foreground focus-within:outline-hidden">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[360px] outline-hidden text-sm sm:text-base leading-relaxed selection:bg-primary/20"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="pointer-events-none absolute left-6 top-4 select-none text-muted-foreground/50 text-sm sm:text-base">
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
          <InitializerPlugin initialContent={initialContent} />
          <OnChangePlugin onChange={handleEditorChange} />
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <IconWriting className="size-3.5 text-primary" />
              <span>{stats.blockCount} {stats.blockCount === 1 ? "Block" : "Blocks"}</span>
            </span>
            <span>{stats.wordCount} words</span>
            <span className="hidden sm:inline">{stats.charCount} characters</span>
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
