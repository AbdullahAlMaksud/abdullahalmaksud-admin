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
import {
  IconColumnInsertRight,
  IconRowInsertBottom,
  IconTable,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

export interface TablePayload {
  headers?: string[];
  rows?: string[][];
  key?: NodeKey;
}

export type SerializedTableNode = Spread<
  {
    headers: string[];
    rows: string[][];
  },
  SerializedLexicalNode
>;

function normalizeTableData(
  headers?: string[],
  rows?: string[][],
): { headers: string[]; rows: string[][] } {
  const safeHeaders =
    headers && headers.length > 0
      ? headers.map((h) => String(h ?? ""))
      : ["Column 1", "Column 2", "Column 3"];

  const colCount = safeHeaders.length;
  const safeRows =
    rows && rows.length > 0
      ? rows.map((row) =>
          Array.from({ length: colCount }, (_, idx) => String(row?.[idx] ?? "")),
        )
      : [
          Array.from({ length: colCount }, () => ""),
          Array.from({ length: colCount }, () => ""),
        ];

  return { headers: safeHeaders, rows: safeRows };
}

function escapeMarkdownCell(cell: string): string {
  return cell.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

export function serializeTableToMarkdown(
  headers: string[],
  rows: string[][],
): string {
  if (headers.length === 0) return "";
  const headerLine = `| ${headers.map((h) => escapeMarkdownCell(h) || " ").join(" | ")} |`;
  const dividerLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyLines = rows.map(
    (row) =>
      `| ${headers
        .map((_, idx) => escapeMarkdownCell(row[idx] || "") || " ")
        .join(" | ")} |`,
  );
  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

function convertTableElement(domNode: Node): DOMConversionOutput | null {
  if (!(domNode instanceof HTMLTableElement)) return null;
  const headerCells = Array.from(domNode.querySelectorAll("thead th")).map(
    (th) => th.textContent?.trim() || "",
  );
  const bodyRows = Array.from(domNode.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td, th")).map(
      (cell) => cell.textContent?.trim() || "",
    ),
  );
  const resolvedHeaders =
    headerCells.length > 0
      ? headerCells
      : bodyRows.length > 0
        ? bodyRows[0]
        : ["Column 1", "Column 2"];
  const resolvedRows =
    headerCells.length > 0 ? bodyRows : bodyRows.slice(1);
  return {
    node: $createTableNode({
      headers: resolvedHeaders,
      rows: resolvedRows,
    }),
  };
}

interface TableBlockComponentProps {
  nodeKey: NodeKey;
  headers: string[];
  rows: string[][];
}

function TableBlockComponent({
  nodeKey,
  headers,
  rows,
}: TableBlockComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [localHeaders, setLocalHeaders] = useState<string[]>(headers);
  const [localRows, setLocalRows] = useState<string[][]>(rows);

  useEffect(() => {
    setLocalHeaders(headers);
  }, [headers]);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isTableNode(node)) {
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
          if (target?.closest(`[data-lexical-table-key="${nodeKey}"]`)) {
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

  const commitTable = (nextHeaders: string[], nextRows: string[][]) => {
    setLocalHeaders(nextHeaders);
    setLocalRows(nextRows);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isTableNode(node)) {
        node.setHeaders(nextHeaders);
        node.setRows(nextRows);
      }
    });
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    const next = localHeaders.map((h, idx) => (idx === colIndex ? value : h));
    commitTable(next, localRows);
  };

  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    value: string,
  ) => {
    const next = localRows.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
        : row,
    );
    commitTable(localHeaders, next);
  };

  const handleAddColumn = () => {
    const nextHeaders = [...localHeaders, `Column ${localHeaders.length + 1}`];
    const nextRows = localRows.map((row) => [...row, ""]);
    commitTable(nextHeaders, nextRows);
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (localHeaders.length <= 1) return;
    const nextHeaders = localHeaders.filter((_, idx) => idx !== colIndex);
    const nextRows = localRows.map((row) =>
      row.filter((_, idx) => idx !== colIndex),
    );
    commitTable(nextHeaders, nextRows);
  };

  const handleAddRow = () => {
    const emptyRow = Array.from({ length: localHeaders.length }, () => "");
    commitTable(localHeaders, [...localRows, emptyRow]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (localRows.length <= 1) return;
    const nextRows = localRows.filter((_, idx) => idx !== rowIndex);
    commitTable(localHeaders, nextRows);
  };

  const handleDeleteTable = (e: React.MouseEvent) => {
    e.stopPropagation();
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isTableNode(node)) {
        node.remove();
      }
    });
  };

  return (
    <div
      data-lexical-table-key={nodeKey}
      contentEditable={false}
      onClick={(e) => e.stopPropagation()}
      className={`group my-4 rounded-xl border bg-card overflow-hidden transition-all select-none ${
        isSelected
          ? "border-primary ring-2 ring-primary/25"
          : "border-border/80 hover:border-border"
      }`}
    >
      {/* Table toolbar bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/35 px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <IconTable className="size-3.5 text-primary" />
          <span>Table</span>
          <span className="font-mono text-[10px] opacity-75">
            ({localRows.length} × {localHeaders.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex h-6 items-center gap-1 rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-accent transition-colors"
            title="Add Row"
          >
            <IconRowInsertBottom className="size-3" />
            <span>+ Row</span>
          </button>
          <button
            type="button"
            onClick={handleAddColumn}
            className="inline-flex h-6 items-center gap-1 rounded border border-border bg-background px-2 text-[11px] font-medium text-foreground hover:bg-accent transition-colors"
            title="Add Column"
          >
            <IconColumnInsertRight className="size-3" />
            <span>+ Col</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteTable}
            className="inline-flex size-6 items-center justify-center rounded border border-destructive/30 bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="Delete Table"
            aria-label="Delete table"
          >
            <IconTrash className="size-3" />
          </button>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-muted/25 border-b border-border">
              {localHeaders.map((header, colIdx) => (
                <th
                  key={`th-${colIdx}`}
                  className="group/col relative min-w-[130px] border-r last:border-r-0 border-border/70 p-0 text-left font-semibold"
                >
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder={`Header ${colIdx + 1}`}
                      className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:outline-none"
                    />
                    {localHeaders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(colIdx)}
                        className="mr-1.5 hidden group-hover/col:flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        title="Remove column"
                        aria-label={`Remove column ${colIdx + 1}`}
                      >
                        <IconX className="size-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 bg-muted/25 p-0" aria-label="Row actions" />
            </tr>
          </thead>
          <tbody>
            {localRows.map((row, rowIdx) => (
              <tr
                key={`tr-${rowIdx}`}
                className="group/row border-b last:border-b-0 border-border/60 hover:bg-muted/15"
              >
                {localHeaders.map((_, colIdx) => (
                  <td
                    key={`td-${rowIdx}-${colIdx}`}
                    className="border-r last:border-r-0 border-border/60 p-0"
                  >
                    <input
                      type="text"
                      value={row[colIdx] ?? ""}
                      onChange={(e) =>
                        handleCellChange(rowIdx, colIdx, e.target.value)
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="..."
                      className="w-full bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:outline-none"
                    />
                  </td>
                ))}
                <td className="w-8 p-0 text-center">
                  {localRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIdx)}
                      className="mx-auto hidden group-hover/row:flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      title="Remove row"
                      aria-label={`Remove row ${rowIdx + 1}`}
                    >
                      <IconX className="size-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export class TableNode extends DecoratorNode<React.JSX.Element> {
  __headers: string[];
  __rows: string[][];

  static getType(): string {
    return "table";
  }

  static clone(node: TableNode): TableNode {
    return new TableNode(
      [...node.__headers],
      node.__rows.map((r) => [...r]),
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedTableNode): TableNode {
    return $createTableNode({
      headers: serializedNode.headers,
      rows: serializedNode.rows,
    });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      table: () => ({
        conversion: convertTableElement,
        priority: 0,
      }),
    };
  }

  constructor(headers?: string[], rows?: string[][], key?: NodeKey) {
    super(key);
    const normalized = normalizeTableData(headers, rows);
    this.__headers = normalized.headers;
    this.__rows = normalized.rows;
  }

  exportJSON(): SerializedTableNode {
    return {
      ...super.exportJSON(),
      headers: this.getHeaders(),
      rows: this.getRows(),
    };
  }

  exportDOM(): DOMExportOutput {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (const h of this.__headers) {
      const th = document.createElement("th");
      th.textContent = h;
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (const row of this.__rows) {
      const tr = document.createElement("tr");
      for (const cell of row) {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return { element: table };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.className = "lexical-table-block";
    return dom;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): false {
    return false;
  }

  getHeaders(): string[] {
    return this.__headers;
  }

  getRows(): string[][] {
    return this.__rows;
  }

  setHeaders(headers: string[]): void {
    const writable = this.getWritable();
    const normalized = normalizeTableData(headers, writable.__rows);
    writable.__headers = normalized.headers;
    writable.__rows = normalized.rows;
  }

  setRows(rows: string[][]): void {
    const writable = this.getWritable();
    const normalized = normalizeTableData(writable.__headers, rows);
    writable.__headers = normalized.headers;
    writable.__rows = normalized.rows;
  }

  toMarkdown(): string {
    return serializeTableToMarkdown(this.__headers, this.__rows);
  }

  getTextContent(): string {
    return [
      ...this.__headers,
      ...this.__rows.flat(),
    ]
      .filter(Boolean)
      .join(" ");
  }

  decorate(_editor: LexicalEditor): React.JSX.Element {
    return (
      <TableBlockComponent
        nodeKey={this.__key}
        headers={this.__headers}
        rows={this.__rows}
      />
    );
  }
}

export function $createTableNode({
  headers,
  rows,
  key,
}: TablePayload = {}): TableNode {
  return $applyNodeReplacement(new TableNode(headers, rows, key));
}

export function $isTableNode(
  node: LexicalNode | null | undefined,
): node is TableNode {
  return node instanceof TableNode;
}
