"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import {
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconGripVertical,
  IconPlus,
  IconRepeat,
  IconTrash,
} from "@tabler/icons-react";
import {
  NOTION_BLOCK_ITEMS,
  applyBlockSelection,
  deleteBlockByKey,
  duplicateBlockByKey,
  moveBlockByKey,
  type ImageInsertRequest,
  type NotionBlockKind,
} from "./block-palette";
import { $isImageNode } from "./image-node";
import { $isTableNode } from "./table-node";
import { $isHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";

type GutterMenuMode = "add" | "actions";

interface GutterPopoverState {
  mode: GutterMenuMode;
  targetNodeKey: string;
  top: number;
  left: number;
  isConvertible: boolean;
}

interface BlockGutterPluginProps {
  anchorElem: HTMLElement | null;
  onRequestImage: (req: ImageInsertRequest) => void;
}

/**
 * Notion-style left-gutter block handle (+ to insert block, 6-dot handle to drag-reorder or open block actions).
 */
export function BlockGutterPlugin({
  anchorElem,
  onRequestImage,
}: BlockGutterPluginProps) {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const activeBlockElemRef = useRef<HTMLElement | null>(null);
  const lastValidBlockElemRef = useRef<HTMLElement | null>(null);

  const [popover, setPopover] = useState<GutterPopoverState | null>(null);
  const [showTurnInto, setShowTurnInto] = useState(false);

  const isOnMenu = useCallback((element: HTMLElement): boolean => {
    return Boolean(
      element.closest("[data-block-gutter-menu]") ||
        element.closest("[data-block-gutter-popover]"),
    );
  }, []);

  const handleElementChanged = useCallback((elem: HTMLElement | null) => {
    activeBlockElemRef.current = elem;
    if (elem) {
      lastValidBlockElemRef.current = elem;
    }
  }, []);

  useEffect(() => {
    if (!popover) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        popoverRef.current &&
        target &&
        !popoverRef.current.contains(target) &&
        !target.closest("[data-block-gutter-menu]")
      ) {
        setPopover(null);
        setShowTurnInto(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPopover(null);
        setShowTurnInto(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [popover]);

  const openGutterPopover = (
    e: React.MouseEvent<HTMLButtonElement>,
    mode: GutterMenuMode,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const hoveredElem =
      activeBlockElemRef.current ?? lastValidBlockElemRef.current;

    let resolvedKey = "";
    let convertible = true;

    editor.getEditorState().read(() => {
      let top = hoveredElem
        ? $getNearestNodeFromDOMNode(hoveredElem)?.getTopLevelElement() ?? null
        : null;

      if (!top) {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          top = selection.anchor.getNode().getTopLevelElement();
        }
      }

      if (!top) {
        const firstChild = $getRoot().getFirstChild();
        top = firstChild ? firstChild.getTopLevelElement() : null;
      }

      if (top) {
        resolvedKey = top.getKey();
        convertible =
          !$isImageNode(top) &&
          !$isTableNode(top) &&
          !$isHorizontalRuleNode(top);
      }
    });

    if (!resolvedKey) return;

    const btnRect = e.currentTarget.getBoundingClientRect();
    const menuWidth = mode === "add" ? 260 : 204;
    const menuHeight = mode === "add" ? 380 : 220;

    const left = Math.min(
      Math.max(12, btnRect.left),
      window.innerWidth - menuWidth - 12,
    );
    const fitsBelow = btnRect.bottom + menuHeight + 12 < window.innerHeight;
    const top = fitsBelow
      ? btnRect.bottom + 6
      : Math.max(12, btnRect.top - menuHeight - 6);

    setShowTurnInto(false);
    setPopover((prev) =>
      prev && prev.mode === mode && prev.targetNodeKey === resolvedKey
        ? null
        : {
            mode,
            targetNodeKey: resolvedKey,
            top,
            left,
            isConvertible: convertible,
          },
    );
  };

  const handleInsertFromGutter = (kind: NotionBlockKind) => {
    const key = popover?.targetNodeKey;
    setPopover(null);
    setShowTurnInto(false);
    if (!key) return;

    applyBlockSelection({
      editor,
      kind,
      mode: "insertAfter",
      targetNodeKey: key,
      onRequestImage,
    });
  };

  const handleTurnInto = (kind: NotionBlockKind) => {
    const key = popover?.targetNodeKey;
    setPopover(null);
    setShowTurnInto(false);
    if (!key) return;

    applyBlockSelection({
      editor,
      kind,
      mode: "replace",
      targetNodeKey: key,
      onRequestImage,
    });
  };

  if (!anchorElem) {
    return null;
  }

  return (
    <>
      <DraggableBlockPlugin_EXPERIMENTAL
        anchorElem={anchorElem}
        menuRef={menuRef}
        targetLineRef={targetLineRef}
        isOnMenu={isOnMenu}
        onElementChanged={handleElementChanged}
        menuComponent={
          <div
            ref={menuRef}
            data-block-gutter-menu
            style={{ display: "none" }}
            className="absolute left-0 top-0 z-20 items-center gap-0.5 rounded-md px-0.5 py-0.5 transition-opacity"
          >
            <button
              type="button"
              draggable={false}
              onClick={(e) => openGutterPopover(e, "add")}
              className="flex size-5 items-center justify-center rounded text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
              title="Click to insert block"
              aria-label="Insert block"
            >
              <IconPlus className="size-3.5 pointer-events-none" />
            </button>
            <button
              type="button"
              onClick={(e) => openGutterPopover(e, "actions")}
              className="flex size-5 cursor-grab active:cursor-grabbing items-center justify-center rounded text-muted-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
              title="Drag to reorder · Click for block menu"
              aria-label="Drag or manage block"
            >
              <IconGripVertical className="size-3.5 pointer-events-none" />
            </button>
          </div>
        }
        targetLineComponent={
          <div
            ref={targetLineRef}
            className="pointer-events-none absolute left-0 top-0 z-20 h-1 rounded-full bg-primary opacity-0 transition-opacity"
          />
        }
      />

      {popover &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            data-block-gutter-popover
            style={{ top: `${popover.top}px`, left: `${popover.left}px` }}
            className="fixed z-[100] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {popover.mode === "add" ? (
              <div className="w-[248px] max-h-[360px] overflow-y-auto space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Add Block
                </div>
                {NOTION_BLOCK_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleInsertFromGutter(item.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground/80">
                        <Icon className="size-3.5 pointer-events-none" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium leading-tight">
                          {item.title}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                      {item.shortcut && (
                        <kbd className="shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="w-[196px] space-y-0.5 text-xs">
                {showTurnInto ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTurnInto(false)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-accent"
                    >
                      <span>← Turn Into</span>
                    </button>
                    <div className="max-h-56 overflow-y-auto space-y-0.5 pt-0.5 border-t border-border/60">
                      {NOTION_BLOCK_ITEMS.filter((b) => b.convertible).map(
                        (item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleTurnInto(item.id)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent transition-colors"
                            >
                              <Icon className="size-3.5 text-muted-foreground pointer-events-none" />
                              <span>{item.title}</span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {popover.isConvertible && (
                      <button
                        type="button"
                        onClick={() => setShowTurnInto(true)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <IconRepeat className="size-3.5 text-muted-foreground pointer-events-none" />
                          <span>Turn into</span>
                        </span>
                        <span className="text-muted-foreground">›</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        moveBlockByKey(editor, popover.targetNodeKey, "up");
                        setPopover(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                    >
                      <IconArrowUp className="size-3.5 text-muted-foreground pointer-events-none" />
                      <span>Move up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        moveBlockByKey(editor, popover.targetNodeKey, "down");
                        setPopover(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                    >
                      <IconArrowDown className="size-3.5 text-muted-foreground pointer-events-none" />
                      <span>Move down</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        duplicateBlockByKey(editor, popover.targetNodeKey);
                        setPopover(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors"
                    >
                      <IconCopy className="size-3.5 text-muted-foreground pointer-events-none" />
                      <span>Duplicate</span>
                    </button>
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      onClick={() => {
                        const targetExists = editor.getEditorState().read(() =>
                          Boolean($getNodeByKey(popover.targetNodeKey)),
                        );
                        if (targetExists) {
                          deleteBlockByKey(editor, popover.targetNodeKey);
                        }
                        setPopover(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <IconTrash className="size-3.5 pointer-events-none" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
