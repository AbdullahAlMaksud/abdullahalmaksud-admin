import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $isParagraphNode,
  type EditorState,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import {
  $createHeadingNode,
  $isHeadingNode,
  $createQuoteNode,
  $isQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $createListNode,
  $isListNode,
  $createListItemNode,
  type ListNode,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode, type CodeNode } from "@lexical/code";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $convertToMarkdownString,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";

import type { BlogBlock, SerializedEditorContent } from "./block-types";

function generateBlockId(): string {
  return "blk_" + Math.random().toString(36).substring(2, 9);
}

/**
 * Serializes the current Lexical EditorState into a clean, structured BlogBlock array.
 */
export function lexicalToBlocks(editorState: EditorState): SerializedEditorContent {
  return editorState.read(() => {
    const root = $getRoot();
    const children = root.getChildren();
    const blocks: BlogBlock[] = [];

    let totalText = "";

    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      const text = node.getTextContent();
      totalText += (totalText ? " " : "") + text;

      if ($isHeadingNode(node)) {
        const tag = node.getTag();
        const level = (parseInt(tag.replace("h", ""), 10) || 2) as
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6;
        blocks.push({
          id: generateBlockId(),
          type: "heading",
          data: {
            level,
            text,
            markdown: `${"#".repeat(level)} ${text}`,
          },
        });
      } else if ($isQuoteNode(node)) {
        blocks.push({
          id: generateBlockId(),
          type: "quote",
          data: {
            text,
            markdown: `> ${text}`,
          },
        });
      } else if ($isCodeNode(node)) {
        const codeNode = node as CodeNode;
        const language = codeNode.getLanguage() || "typescript";
        blocks.push({
          id: generateBlockId(),
          type: "code",
          data: {
            code: text,
            language,
            markdown: `\`\`\`${language}\n${text}\n\`\`\``,
          },
        });
      } else if ($isListNode(node)) {
        const listNode = node as ListNode;
        const listType = listNode.getListType() === "number" ? "number" : "bullet";
        const items = listNode
          .getChildren()
          .map((child: LexicalNode) => child.getTextContent())
          .filter(Boolean);

        const listMarkdown = items
          .map((item, idx) => (listType === "number" ? `${idx + 1}. ${item}` : `- ${item}`))
          .join("\n");

        blocks.push({
          id: generateBlockId(),
          type: "list",
          data: {
            listType,
            items,
            markdown: listMarkdown,
          },
        });
      } else if ($isHorizontalRuleNode(node)) {
        blocks.push({
          id: generateBlockId(),
          type: "divider",
          data: {
            markdown: "---",
          },
        });
      } else if ($isParagraphNode(node)) {
        // Only include paragraphs that have content or preserve empty line if intentional
        blocks.push({
          id: generateBlockId(),
          type: "paragraph",
          data: {
            text,
            markdown: text,
          },
        });
      } else {
        // Fallback for any other node types
        blocks.push({
          id: generateBlockId(),
          type: "paragraph",
          data: {
            text,
            markdown: text,
          },
        });
      }
    }

    // Convert whole document to markdown string using Lexical markdown transformers
    let fullMarkdown = "";
    try {
      fullMarkdown = $convertToMarkdownString(TRANSFORMERS);
    } catch {
      fullMarkdown = blocks.map((b) => b.data.markdown || b.data.text || "").join("\n\n");
    }

    const words = totalText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    return {
      blocks,
      markdown: fullMarkdown,
      wordCount: words.length,
      characterCount: totalText.length,
    };
  });
}

/**
 * Hydrates a Lexical editor with data from either:
 * 1. BlogBlock[] array
 * 2. Raw Lexical State JSON
 * 3. Markdown or plain text string
 */
export function populateEditorFromBlocks(
  editor: LexicalEditor,
  rawContent: any
): void {
  if (!rawContent) {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
    return;
  }

  // Case 1: BlogBlock array
  if (Array.isArray(rawContent)) {
    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (rawContent.length === 0) {
        root.append($createParagraphNode());
        return;
      }

      for (const block of rawContent as BlogBlock[]) {
        if (!block || !block.type) continue;

        switch (block.type) {
          case "heading": {
            const level = (block.data?.level || 2) as 1 | 2 | 3 | 4 | 5 | 6;
            const headingTag: HeadingTagType = `h${level}`;
            const headingNode = $createHeadingNode(headingTag);
            headingNode.append($createTextNode(block.data?.text || ""));
            root.append(headingNode);
            break;
          }
          case "quote": {
            const quoteNode = $createQuoteNode();
            quoteNode.append($createTextNode(block.data?.text || ""));
            root.append(quoteNode);
            break;
          }
          case "code": {
            const codeNode = $createCodeNode(block.data?.language || "typescript");
            codeNode.append(
              $createTextNode(block.data?.code || block.data?.text || "")
            );
            root.append(codeNode);
            break;
          }
          case "list": {
            const listType =
              block.data?.listType === "number" ? "number" : "bullet";
            const listNode = $createListNode(listType);
            const items = block.data?.items || [];
            if (items.length > 0) {
              for (const it of items) {
                const li = $createListItemNode();
                li.append($createTextNode(it));
                listNode.append(li);
              }
            } else {
              const li = $createListItemNode();
              li.append($createTextNode(block.data?.text || ""));
              listNode.append(li);
            }
            root.append(listNode);
            break;
          }
          case "divider": {
            root.append($createHorizontalRuleNode());
            break;
          }
          case "paragraph":
          default: {
            const p = $createParagraphNode();
            p.append($createTextNode(block.data?.text || ""));
            root.append(p);
            break;
          }
        }
      }

      // Ensure at least one node exists
      if (root.getChildrenSize() === 0) {
        root.append($createParagraphNode());
      }
    });
    return;
  }

  // Case 2: Object with blocks property
  if (typeof rawContent === "object" && Array.isArray(rawContent.blocks)) {
    populateEditorFromBlocks(editor, rawContent.blocks);
    return;
  }

  // Case 3: Lexical State JSON string
  if (
    typeof rawContent === "string" &&
    rawContent.trim().startsWith("{") &&
    rawContent.includes('"root"')
  ) {
    try {
      const parsed = editor.parseEditorState(rawContent);
      editor.setEditorState(parsed);
      return;
    } catch {
      // Fallback to markdown parser below
    }
  }

  // Case 4: Markdown or plain text string
  if (typeof rawContent === "string") {
    editor.update(() => {
      try {
        $convertFromMarkdownString(rawContent, TRANSFORMERS);
      } catch {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode(rawContent));
        root.append(p);
      }
    });
  }
}
