"use client";

import React, { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import {
  NOTION_BLOCK_ITEMS,
  applyBlockSelection,
  type ImageInsertRequest,
  type NotionBlockItem,
} from "./block-palette";

class SlashCommandOption extends MenuOption {
  item: NotionBlockItem;

  constructor(item: NotionBlockItem) {
    super(item.id);
    this.item = item;
  }
}

interface SlashCommandPluginProps {
  onRequestImage: (req: ImageInsertRequest) => void;
}

/**
 * Notion-style "/" slash-command palette for inserting or converting blocks anywhere while typing.
 */
export function SlashCommandPlugin({ onRequestImage }: SlashCommandPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForSlashTrigger = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const q = (queryString || "").trim().toLowerCase();
    return NOTION_BLOCK_ITEMS.filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.includes(q))
      );
    }).map((item) => new SlashCommandOption(item));
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: SlashCommandOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      let targetKey: string | null = null;
      let shouldReplace = true;

      editor.update(() => {
        if (nodeToRemove) {
          const topElem = nodeToRemove.getTopLevelElement();
          if (topElem) {
            targetKey = topElem.getKey();
          }
          nodeToRemove.remove();
          if (topElem && topElem.getTextContent().trim() !== "") {
            shouldReplace = false;
          }
        }
      });

      closeMenu();

      applyBlockSelection({
        editor,
        kind: selectedOption.item.id,
        mode: shouldReplace ? "replace" : "insertAfter",
        targetNodeKey: targetKey,
        onRequestImage,
      });
    },
    [editor, onRequestImage],
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashCommandOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForSlashTrigger}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (!anchorElementRef.current || options.length === 0) {
          return null;
        }

        return createPortal(
          <div className="z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Basic Blocks
            </div>
            <div className="space-y-0.5">
              {options.map((option, index) => {
                const Icon = option.item.icon;
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={option.key}
                    type="button"
                    ref={(el) => {
                      option.setRefElement(el);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/60"
                    }`}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground/80">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium leading-tight">
                        {option.item.title}
                      </span>
                      <span className="block truncate text-[10px] text-muted-foreground">
                        {option.item.description}
                      </span>
                    </span>
                    {option.item.shortcut && (
                      <kbd className="shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {option.item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          anchorElementRef.current,
        );
      }}
    />
  );
}
