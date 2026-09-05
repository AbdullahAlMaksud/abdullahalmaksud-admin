export type BlockType =
  | "paragraph"
  | "heading"
  | "quote"
  | "code"
  | "list"
  | "divider"
  | "image";

export interface BlogBlock {
  id: string;
  type: BlockType;
  data: {
    text?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    listType?: "bullet" | "number";
    items?: string[];
    code?: string;
    language?: string;
    url?: string;
    caption?: string;
    alt?: string;
    markdown?: string;
  };
}

export interface SerializedEditorContent {
  blocks: BlogBlock[];
  markdown: string;
  wordCount: number;
  characterCount: number;
}
