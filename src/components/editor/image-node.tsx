"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DecoratorNode,
  $applyNodeReplacement,
  $getNodeByKey,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { resolveAssetUrl } from "@/lib/asset-url";

export interface ImagePayload {
  src: string;
  altText?: string;
  caption?: string;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    caption: string;
  },
  SerializedLexicalNode
>;

function convertImageElement(domNode: Node): DOMConversionOutput | null {
  if (domNode instanceof HTMLImageElement) {
    const src = domNode.getAttribute("src") || "";
    const altText = domNode.getAttribute("alt") || "";
    if (!src) return null;
    return { node: $createImageNode({ src, altText }) };
  }
  return null;
}

interface ImageBlockComponentProps {
  nodeKey: NodeKey;
  src: string;
  altText: string;
  caption: string;
}

function ImageBlockComponent({
  nodeKey,
  src,
  altText,
  caption,
}: ImageBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [captionValue, setCaptionValue] = useState(caption);
  const [altValue, setAltValue] = useState(altText);
  const [imgError, setImgError] = useState(false);
  const [showAltInput, setShowAltInput] = useState(false);

  useEffect(() => {
    setCaptionValue(caption);
  }, [caption]);

  useEffect(() => {
    setAltValue(altText);
  }, [altText]);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("input, button")) {
            return false;
          }
          if (target?.closest(`[data-lexical-image-key="${nodeKey}"]`)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextCaption = e.target.value;
    setCaptionValue(nextCaption);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setCaption(nextCaption);
      }
    });
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextAlt = e.target.value;
    setAltValue(nextAlt);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setAltText(nextAlt);
      }
    });
  };

  const handleRemoveNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.remove();
      }
    });
  };

  const resolvedUrl = resolveAssetUrl(src);

  return (
    <figure
      data-lexical-image-key={nodeKey}
      contentEditable={false}
      className={`group relative my-4 rounded-xl border bg-muted/20 overflow-hidden transition-all select-none ${
        isSelected
          ? "border-primary ring-2 ring-primary/25"
          : "border-border/80 hover:border-border"
      }`}
    >
      {/* Floating actions */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowAltInput((prev) => !prev);
          }}
          className="h-7 rounded-md border border-border bg-background/95 px-2 text-[11px] font-medium text-muted-foreground shadow-xs hover:text-foreground transition-colors"
          title="Edit image alt text"
        >
          {showAltInput ? "Hide Alt" : "Alt"}
        </button>
        <button
          type="button"
          onClick={handleRemoveNode}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 bg-background/95 text-destructive shadow-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="Remove image block"
          aria-label="Remove image block"
        >
          <IconTrash className="size-3.5" />
        </button>
      </div>

      {/* Image surface */}
      <div className="flex min-h-[140px] w-full items-center justify-center bg-black/[0.02] dark:bg-white/[0.02]">
        {resolvedUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedUrl}
            alt={altValue || captionValue || "Embedded article image"}
            className="max-h-[460px] w-full object-contain"
            onError={() => setImgError(true)}
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 py-10 px-4 text-muted-foreground text-center">
            <IconPhoto className="size-8 opacity-40" />
            <p className="text-xs font-medium">Image preview unavailable</p>
            <p className="text-[11px] font-mono opacity-75 break-all">{src}</p>
          </div>
        )}
      </div>

      {/* Caption & metadata footer */}
      <figcaption
        onClick={(e) => e.stopPropagation()}
        className="border-t border-border/60 bg-background/80 px-3 py-2 space-y-1.5"
      >
        <input
          type="text"
          value={captionValue}
          onChange={handleCaptionChange}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Add an image caption (optional)..."
          aria-label="Image caption"
          className="w-full bg-transparent text-center text-xs italic text-foreground/85 placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {showAltInput && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground shrink-0">
              Alt:
            </span>
            <input
              type="text"
              value={altValue}
              onChange={handleAltChange}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Describe image for accessibility..."
              aria-label="Image alt text"
              className="w-full bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/70">
          <span className="truncate" title={src}>
            {src}
          </span>
          <span className="shrink-0 ml-2 uppercase">Image Block</span>
        </div>
      </figcaption>
    </figure>
  );
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;
  __caption: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__caption, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, caption } = serializedNode;
    return $createImageNode({
      src,
      altText,
      caption,
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(src: string, altText = "", caption = "", key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__caption = caption;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.getSrc(),
      altText: this.getAltText(),
      caption: this.getCaption(),
    };
  }

  exportDOM(): DOMExportOutput {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.setAttribute("src", resolveAssetUrl(this.__src));
    img.setAttribute("alt", this.__altText || this.__caption || "");
    figure.appendChild(img);
    if (this.__caption) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = this.__caption;
      figure.appendChild(figcaption);
    }
    return { element: figure };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "lexical-image-block";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getCaption(): string {
    return this.__caption;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  decorate(_editor: LexicalEditor): React.JSX.Element {
    return (
      <ImageBlockComponent
        nodeKey={this.__key}
        src={this.__src}
        altText={this.__altText}
        caption={this.__caption}
      />
    );
  }
}

export function $createImageNode({
  src,
  altText = "",
  caption = "",
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, caption, key));
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
