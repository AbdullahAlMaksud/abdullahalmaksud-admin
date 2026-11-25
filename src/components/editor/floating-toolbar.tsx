"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type BaseSelection,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { CodeNode } from "@lexical/code";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  IconBold,
  IconCheck,
  IconClearFormatting,
  IconCode,
  IconH2,
  IconItalic,
  IconLink,
  IconQuote,
  IconStrikethrough,
  IconUnderline,
  IconX,
} from "@tabler/icons-react";

interface ToolbarPosition {
  top: number;
  left: number;
  placement: "above" | "below";
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^(?:https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Floating inline popup toolbar that appears directly near selected text in Lexical.
 */
export function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<BaseSelection | null>(null);
  const isEditingLinkRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    placement: "above",
  });

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isHeading2, setIsHeading2] = useState(false);
  const [isQuote, setIsQuote] = useState(false);

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    isEditingLinkRef.current = isEditingLink;
  }, [isEditingLink]);

  const updateFloatingToolbar = useCallback(() => {
    if (isEditingLinkRef.current) return;

    editor.getEditorState().read(() => {
      if (editor.isComposing()) return;

      const selection = $getSelection();
      const rootElement = editor.getRootElement();
      const nativeSelection = window.getSelection();

      if (
        !$isRangeSelection(selection) ||
        selection.isCollapsed() ||
        !rootElement ||
        !nativeSelection ||
        nativeSelection.isCollapsed ||
        nativeSelection.rangeCount === 0 ||
        !rootElement.contains(nativeSelection.anchorNode)
      ) {
        setIsVisible(false);
        return;
      }

      const selectedText = selection.getTextContent().trim();
      if (!selectedText) {
        setIsVisible(false);
        return;
      }

      const anchorNode = selection.anchor.getNode();
      const codeParent = $getNearestNodeOfType(anchorNode, CodeNode);
      if (codeParent) {
        setIsVisible(false);
        return;
      }

      // Sync formatting states
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const parent = anchorNode.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(anchorNode));

      const topElement = anchorNode.getTopLevelElement();
      setIsHeading2($isHeadingNode(topElement) && topElement.getTag() === "h2");
      setIsQuote($isQuoteNode(topElement));

      const domRange = nativeSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setIsVisible(false);
        return;
      }

      savedSelectionRef.current = selection.clone();

      const toolbarHeight = toolbarRef.current?.offsetHeight || 40;
      const toolbarHalfWidth = (toolbarRef.current?.offsetWidth || 320) / 2;
      const centerX = rect.left + rect.width / 2;
      const clampedX = Math.max(
        toolbarHalfWidth + 12,
        Math.min(window.innerWidth - toolbarHalfWidth - 12, centerX),
      );

      const spaceAbove = rect.top;
      const placement: "above" | "below" =
        spaceAbove > toolbarHeight + 68 ? "above" : "below";
      const top =
        placement === "above"
          ? rect.top - toolbarHeight - 10
          : rect.bottom + 10;

      setPosition({ top, left: clampedX, placement });
      setIsVisible(true);
    });
  }, [editor]);

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isEditingLinkRef.current) return;
      updateFloatingToolbar();
    };

    const handleMouseUp = () => {
      requestAnimationFrame(() => updateFloatingToolbar());
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (
        isEditingLinkRef.current &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setIsEditingLink(false);
        setLinkUrl("");
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateFloatingToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateFloatingToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      unregister();
    };
  }, [editor, updateFloatingToolbar]);

  const handleOpenLinkEditor = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        savedSelectionRef.current = selection.clone();
      }
    });

    setLinkUrl("");
    setIsEditingLink(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  };

  const handleApplyLink = (e?: React.FormEvent) => {
    e?.preventDefault();
    const formatted = normalizeUrl(linkUrl);
    if (formatted) {
      editor.update(() => {
        if (savedSelectionRef.current) {
          $setSelection(savedSelectionRef.current.clone());
        }
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, formatted);
      });
    }
    setIsEditingLink(false);
    setLinkUrl("");
  };

  const handleCancelLink = () => {
    setIsEditingLink(false);
    setLinkUrl("");
    editor.focus();
  };

  const toggleHeading2 = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const topElement = anchorNode.getTopLevelElement();
        if ($isHeadingNode(topElement) && topElement.getTag() === "h2") {
          return;
        }
        $setBlocksType(selection, () => $createHeadingNode("h2"));
      }
    });
  };

  const toggleQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const handleClearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle("");
          }
        });
      }
    });
  };

  if (typeof document === "undefined" || (!isVisible && !isEditingLink)) {
    return null;
  }

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      className="z-50 flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 px-1.5 py-1 text-zinc-100 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
      role="toolbar"
      aria-label="Inline formatting toolbar"
    >
      {isEditingLink ? (
        <form onSubmit={handleApplyLink} className="flex items-center gap-1 px-1">
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancelLink();
              }
            }}
            placeholder="https://example.com"
            className="h-7 w-48 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-white placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex size-7 items-center justify-center rounded bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
            title="Apply Link"
          >
            <IconCheck className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelLink}
            className="flex size-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Cancel"
          >
            <IconX className="size-3.5" />
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isBold
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Bold (Ctrl+B)"
          >
            <IconBold className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isItalic
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Italic (Ctrl+I)"
          >
            <IconItalic className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isUnderline
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Underline (Ctrl+U)"
          >
            <IconUnderline className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
            }
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isStrikethrough
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Strikethrough"
          >
            <IconStrikethrough className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isCode
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Inline Code"
          >
            <IconCode className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenLinkEditor}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isLink
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title={isLink ? "Remove Link" : "Add Link"}
          >
            <IconLink className="size-3.5" />
          </button>

          <span aria-hidden="true" className="mx-1 h-4 w-px bg-zinc-700" />

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleHeading2}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isHeading2
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Heading 2"
          >
            <IconH2 className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleQuote}
            className={`flex size-7 items-center justify-center rounded transition-colors ${
              isQuote
                ? "bg-white text-zinc-950"
                : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
            }`}
            title="Blockquote"
          >
            <IconQuote className="size-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClearFormatting}
            className="flex size-7 items-center justify-center rounded text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Clear Formatting"
          >
            <IconClearFormatting className="size-3.5" />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
