"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  $createParagraphNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $getNearestNodeOfType } from "@lexical/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconCode,
  IconLink,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconList,
  IconListNumbers,
  IconQuote,
  IconTerminal2,
  IconSeparator,
  IconH1,
  IconH2,
  IconH3,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronDown,
  IconClearFormatting,
} from "@tabler/icons-react";

const blockTypeToBlockName = {
  paragraph: "Normal",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  bullet: "Bullet List",
  number: "Numbered List",
  quote: "Quote",
  code: "Code Block",
} as const;

type BlockTypeKey = keyof typeof blockTypeToBlockName;

export function EditorToolbar() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<BlockTypeKey>("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update format flags
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      // Update link flag
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Detect block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $getNearestNodeOfType(anchorNode, ListNode) ||
            anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        const tag = element.getTag();
        setBlockType(tag as BlockTypeKey);
      } else if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        const listType = parentList ? parentList.getListType() : element.getListType();
        setBlockType(listType === "number" ? "number" : "bullet");
      } else if ($isQuoteNode(element)) {
        setBlockType("quote");
      } else if ($isCodeNode(element)) {
        setBlockType("code");
      } else {
        setBlockType("paragraph");
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  useEffect(() => {
    const unregisterUndo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (payload) => {
        setCanUndo(payload);
        return false;
      },
      1
    );
    const unregisterRedo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      1
    );

    return () => {
      unregisterUndo();
      unregisterRedo();
    };
  }, [editor]);

  // Block format handlers
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingTag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingTag));
      }
    });
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode("typescript"));
      }
    });
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt("Enter URL (e.g. https://example.com):");
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const insertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  };

  const clearFormatting = () => {
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

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 bg-card border-b border-border/80 sticky top-0 z-20 backdrop-blur-xs rounded-t-xl">
      {/* Undo / Redo */}
      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className="size-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <IconArrowBackUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canRedo}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className="size-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <IconArrowForwardUp className="size-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Block Type Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium text-foreground bg-muted/50 hover:bg-muted"
          >
            <span>{blockTypeToBlockName[blockType] || "Paragraph"}</span>
            <IconChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem onClick={formatParagraph} className="gap-2 text-xs">
            <span className="font-medium">Normal Text</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h1")} className="gap-2 text-xs">
            <IconH1 className="size-4 text-primary" />
            <span>Heading 1</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h2")} className="gap-2 text-xs">
            <IconH2 className="size-4 text-primary" />
            <span>Heading 2</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatHeading("h3")} className="gap-2 text-xs">
            <IconH3 className="size-4 text-primary" />
            <span>Heading 3</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={formatBulletList} className="gap-2 text-xs">
            <IconList className="size-4 text-emerald-500" />
            <span>Bullet List</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={formatNumberedList} className="gap-2 text-xs">
            <IconListNumbers className="size-4 text-blue-500" />
            <span>Numbered List</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={formatQuote} className="gap-2 text-xs">
            <IconQuote className="size-4 text-amber-500" />
            <span>Quote</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={formatCodeBlock} className="gap-2 text-xs">
            <IconTerminal2 className="size-4 text-purple-500" />
            <span>Code Block</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Inline Formats */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          className={`size-8 p-0 ${
            isBold
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Bold (Ctrl+B)"
        >
          <IconBold className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          className={`size-8 p-0 ${
            isItalic
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Italic (Ctrl+I)"
        >
          <IconItalic className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
          className={`size-8 p-0 ${
            isUnderline
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Underline (Ctrl+U)"
        >
          <IconUnderline className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
          className={`size-8 p-0 ${
            isStrikethrough
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Strikethrough"
        >
          <IconStrikethrough className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          className={`size-8 p-0 ${
            isCode
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Inline Code"
        >
          <IconCode className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className={`size-8 p-0 ${
            isLink
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title={isLink ? "Remove Link" : "Insert Link"}
        >
          <IconLink className="size-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Align Left"
        >
          <IconAlignLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Align Center"
        >
          <IconAlignCenter className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Align Right"
        >
          <IconAlignRight className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Align Justify"
        >
          <IconAlignJustified className="size-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5 mx-0.5" />

      {/* Insert Divider / Clear */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertHorizontalRule}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Insert Horizontal Line"
        >
          <IconSeparator className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFormatting}
          className="size-8 p-0 text-muted-foreground hover:text-foreground"
          title="Clear Formatting"
        >
          <IconClearFormatting className="size-4" />
        </Button>
      </div>
    </div>
  );
}
