"use client";

import type { ComponentType } from "react";
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import {
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconPhotoPlus,
  IconPilcrow,
  IconQuote,
  IconSeparator,
  IconTable,
  IconTerminal2,
} from "@tabler/icons-react";
import { $createImageNode, $isImageNode } from "./image-node";
import { $createTableNode, $isTableNode } from "./table-node";

export type NotionBlockKind =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "number"
  | "quote"
  | "code"
  | "table"
  | "image"
  | "divider";

export interface NotionBlockItem {
  id: NotionBlockKind;
  title: string;
  description: string;
  keywords: string[];
  shortcut?: string;
  convertible?: boolean;
  icon: ComponentType<{ className?: string }>;
}

export const NOTION_BLOCK_ITEMS: NotionBlockItem[] = [
  {
    id: "paragraph",
    title: "Text",
    description: "Plain paragraph block",
    keywords: ["text", "paragraph", "p", "normal"],
    convertible: true,
    icon: IconPilcrow,
  },
  {
    id: "h1",
    title: "Heading 1",
    description: "Big section heading",
    keywords: ["h1", "heading1", "title", "large"],
    shortcut: "#",
    convertible: true,
    icon: IconH1,
  },
  {
    id: "h2",
    title: "Heading 2",
    description: "Medium section heading",
    keywords: ["h2", "heading2", "subtitle"],
    shortcut: "##",
    convertible: true,
    icon: IconH2,
  },
  {
    id: "h3",
    title: "Heading 3",
    description: "Small subsection heading",
    keywords: ["h3", "heading3", "subheading"],
    shortcut: "###",
    convertible: true,
    icon: IconH3,
  },
  {
    id: "bullet",
    title: "Bulleted List",
    description: "Create a simple bulleted list",
    keywords: ["bullet", "list", "ul", "unordered"],
    shortcut: "-",
    convertible: true,
    icon: IconList,
  },
  {
    id: "number",
    title: "Numbered List",
    description: "Create a list with numbering",
    keywords: ["numbered", "list", "ol", "ordered"],
    shortcut: "1.",
    convertible: true,
    icon: IconListNumbers,
  },
  {
    id: "quote",
    title: "Quote",
    description: "Capture a highlight or blockquote",
    keywords: ["quote", "blockquote", "callout"],
    shortcut: ">",
    convertible: true,
    icon: IconQuote,
  },
  {
    id: "code",
    title: "Code Block",
    description: "Code snippet with syntax highlighting",
    keywords: ["code", "snippet", "pre", "ts"],
    shortcut: "```",
    convertible: true,
    icon: IconTerminal2,
  },
  {
    id: "table",
    title: "Table",
    description: "Structured table with editable rows & columns",
    keywords: ["table", "grid", "rows", "columns", "spreadsheet"],
    convertible: false,
    icon: IconTable,
  },
  {
    id: "image",
    title: "Image & Caption",
    description: "Upload or pick image with a caption",
    keywords: ["image", "img", "photo", "picture", "media", "caption"],
    convertible: false,
    icon: IconPhotoPlus,
  },
  {
    id: "divider",
    title: "Divider",
    description: "Visually divide sections with a rule",
    keywords: ["divider", "hr", "line", "separator"],
    shortcut: "---",
    convertible: false,
    icon: IconSeparator,
  },
];

export interface ImageInsertRequest {
  mode: "cursor" | "insertAfter" | "replace";
  targetNodeKey?: string | null;
}

function createNodeForKind(
  kind: Exclude<NotionBlockKind, "image">,
  initialText = "",
): LexicalNode {
  switch (kind) {
    case "h1": {
      const n = $createHeadingNode("h1");
      if (initialText) n.append($createTextNode(initialText));
      return n;
    }
    case "h2": {
      const n = $createHeadingNode("h2");
      if (initialText) n.append($createTextNode(initialText));
      return n;
    }
    case "h3": {
      const n = $createHeadingNode("h3");
      if (initialText) n.append($createTextNode(initialText));
      return n;
    }
    case "bullet": {
      const list = $createListNode("bullet");
      const li = $createListItemNode();
      if (initialText) li.append($createTextNode(initialText));
      list.append(li);
      return list;
    }
    case "number": {
      const list = $createListNode("number");
      const li = $createListItemNode();
      if (initialText) li.append($createTextNode(initialText));
      list.append(li);
      return list;
    }
    case "quote": {
      const q = $createQuoteNode();
      if (initialText) q.append($createTextNode(initialText));
      return q;
    }
    case "code": {
      const code = $createCodeNode("typescript");
      if (initialText) code.append($createTextNode(initialText));
      return code;
    }
    case "table":
      return $createTableNode();
    case "divider":
      return $createHorizontalRuleNode();
    case "paragraph":
    default: {
      const p = $createParagraphNode();
      if (initialText) p.append($createTextNode(initialText));
      return p;
    }
  }
}

function focusInsertedNode(node: LexicalNode): void {
  if ($isListNode(node)) {
    const firstItem = node.getFirstChild();
    if ($isElementNode(firstItem)) {
      firstItem.selectEnd();
      return;
    }
  }
  if ($isElementNode(node)) {
    node.selectEnd();
    return;
  }
  const next = node.getNextSibling();
  if ($isElementNode(next)) {
    next.selectStart();
  }
}

/**
 * Inserts a new block after `targetNodeKey`, or converts/replaces `targetNodeKey`
 * in place depending on `mode`.
 */
export function applyBlockSelection({
  editor,
  kind,
  mode,
  targetNodeKey,
  onRequestImage,
}: {
  editor: LexicalEditor;
  kind: NotionBlockKind;
  mode: "insertAfter" | "replace";
  targetNodeKey?: string | null;
  onRequestImage: (req: ImageInsertRequest) => void;
}): void {
  if (kind === "image") {
    onRequestImage({ mode, targetNodeKey });
    return;
  }

  editor.update(() => {
    const root = $getRoot();
    const targetNode = targetNodeKey ? $getNodeByKey(targetNodeKey) : null;
    const topTarget = targetNode ? targetNode.getTopLevelElement() : null;

    if (mode === "replace" && topTarget) {
      const preservedText =
        $isParagraphNode(topTarget) ||
        $isHeadingNode(topTarget) ||
        $isQuoteNode(topTarget) ||
        $isCodeNode(topTarget) ||
        $isListNode(topTarget)
          ? topTarget.getTextContent()
          : "";

      const replacement = createNodeForKind(
        kind,
        kind === "divider" ? "" : preservedText,
      );
      topTarget.replace(replacement);

      if (kind === "divider" && !replacement.getNextSibling()) {
        const trailing = $createParagraphNode();
        replacement.insertAfter(trailing);
        trailing.select();
      } else {
        focusInsertedNode(replacement);
      }
      return;
    }

    const newNode = createNodeForKind(kind);

    if (
      topTarget &&
      $isParagraphNode(topTarget) &&
      topTarget.getTextContent().trim() === "" &&
      kind !== "paragraph"
    ) {
      topTarget.replace(newNode);
    } else if (topTarget) {
      topTarget.insertAfter(newNode);
    } else {
      root.append(newNode);
    }

  if (kind === "divider" && !newNode.getNextSibling()) {
      const trailing = $createParagraphNode();
      newNode.insertAfter(trailing);
      trailing.select();
    } else if (kind === "table" && !newNode.getNextSibling()) {
      const trailing = $createParagraphNode();
      newNode.insertAfter(trailing);
    } else {
      focusInsertedNode(newNode);
    }
  });
}

/**
 * Inserts a new interactive Table block at the current editor selection.
 */
export function insertTableAtCursor(editor: LexicalEditor): void {
  editor.update(() => {
    const tableNode = $createTableNode();
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const topTarget = selection.anchor.getNode().getTopLevelElement();
      if (topTarget) {
        if (
          $isParagraphNode(topTarget) &&
          topTarget.getTextContent().trim() === ""
        ) {
          topTarget.replace(tableNode);
        } else {
          topTarget.insertAfter(tableNode);
        }
      } else {
        $getRoot().append(tableNode);
      }
    } else {
      $getRoot().append(tableNode);
    }

    if (!tableNode.getNextSibling()) {
      const trailing = $createParagraphNode();
      tableNode.insertAfter(trailing);
    }
  });
}

/**
 * Unified helper to insert an ImageNode (with caption and alt text) at cursor or relative to a block.
 */
export function insertImageBlock({
  editor,
  src,
  caption = "",
  altText = "",
  request,
}: {
  editor: LexicalEditor;
  src: string;
  caption?: string;
  altText?: string;
  request?: ImageInsertRequest;
}): void {
  const trimmedSrc = src.trim();
  if (!trimmedSrc) return;

  editor.update(() => {
    const imageNode = $createImageNode({
      src: trimmedSrc,
      caption: caption.trim(),
      altText: altText.trim(),
    });

    const targetNode = request?.targetNodeKey
      ? $getNodeByKey(request.targetNodeKey)?.getTopLevelElement()
      : null;

    if (targetNode) {
      if (
        request?.mode === "replace" ||
        ($isParagraphNode(targetNode) &&
          targetNode.getTextContent().trim() === "")
      ) {
        targetNode.replace(imageNode);
      } else {
        targetNode.insertAfter(imageNode);
      }
    } else {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorTopNode = selection.anchor.getNode().getTopLevelElement();
        if (anchorTopNode) {
          if (
            $isParagraphNode(anchorTopNode) &&
            anchorTopNode.getTextContent().trim() === ""
          ) {
            anchorTopNode.replace(imageNode);
          } else {
            anchorTopNode.insertAfter(imageNode);
          }
        } else {
          $getRoot().append(imageNode);
        }
      } else {
        $getRoot().append(imageNode);
      }
    }

    const nextSibling = imageNode.getNextSibling();
    if (!nextSibling) {
      const paragraph = $createParagraphNode();
      imageNode.insertAfter(paragraph);
      paragraph.select();
    } else if ($isElementNode(nextSibling)) {
      nextSibling.selectStart();
    }
  });
}

/**
 * Duplicates a top-level block right below itself.
 */
export function duplicateBlockByKey(editor: LexicalEditor, nodeKey: string): void {
  editor.update(() => {
    const node = $getNodeByKey(nodeKey);
    const top = node?.getTopLevelElement();
    if (!top) return;

    let clone: LexicalNode;
    if ($isImageNode(top)) {
      clone = $createImageNode({
        src: top.getSrc(),
        altText: top.getAltText(),
        caption: top.getCaption(),
      });
    } else if ($isTableNode(top)) {
      clone = $createTableNode({
        headers: [...top.getHeaders()],
        rows: top.getRows().map((r) => [...r]),
      });
    } else if ($isHorizontalRuleNode(top)) {
      clone = $createHorizontalRuleNode();
    } else if ($isHeadingNode(top)) {
      clone = createNodeForKind(top.getTag() as "h1" | "h2" | "h3", top.getTextContent());
    } else if ($isQuoteNode(top)) {
      clone = createNodeForKind("quote", top.getTextContent());
    } else if ($isCodeNode(top)) {
      const code = $createCodeNode(top.getLanguage() || "typescript");
      const text = top.getTextContent();
      if (text) code.append($createTextNode(text));
      clone = code;
    } else if ($isListNode(top)) {
      const list = $createListNode(top.getListType() === "number" ? "number" : "bullet");
      top.getChildren().forEach((child) => {
        const li = $createListItemNode();
        const t = child.getTextContent();
        if (t) li.append($createTextNode(t));
        list.append(li);
      });
      clone = list;
    } else {
      clone = createNodeForKind("paragraph", top.getTextContent());
    }

    top.insertAfter(clone);
    focusInsertedNode(clone);
  });
}

/**
 * Moves a top-level block one slot up or down.
 */
export function moveBlockByKey(
  editor: LexicalEditor,
  nodeKey: string,
  direction: "up" | "down",
): void {
  editor.update(() => {
    const top = $getNodeByKey(nodeKey)?.getTopLevelElement();
    if (!top) return;

    if (direction === "up") {
      const prev = top.getPreviousSibling();
      if (prev) {
        prev.insertBefore(top);
      }
    } else {
      const next = top.getNextSibling();
      if (next) {
        next.insertAfter(top);
      }
    }
  });
}

/**
 * Removes a top-level block safely, preserving an empty paragraph if root becomes empty.
 */
export function deleteBlockByKey(editor: LexicalEditor, nodeKey: string): void {
  editor.update(() => {
    const root = $getRoot();
    const top = $getNodeByKey(nodeKey)?.getTopLevelElement();
    if (!top) return;

    const nextFocus = top.getNextSibling() || top.getPreviousSibling();
    top.remove();

    if (root.getChildrenSize() === 0) {
      const p = $createParagraphNode();
      root.append(p);
      p.select();
    } else if ($isElementNode(nextFocus)) {
      nextFocus.selectEnd();
    }
  });
}
