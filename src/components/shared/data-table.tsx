"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
// Pinned to @tanstack/react-table v8: v9 makes every type generic over its
// feature set, which buys this table nothing.
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * Thin wrapper over a TanStack table instance: sorting affordances, loading
 * skeletons, an empty slot, and enter/exit motion on rows so adding or removing
 * a record reads as a change rather than a repaint.
 */
export function DataTable<TData>({
  table,
  isLoading,
  emptyState,
  onRowClick,
  compact = false,
}: {
  table: TanStackTable<TData>;
  isLoading: boolean;
  emptyState: ReactNode;
  onRowClick?: (row: TData) => void;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="h-11 bg-surface-muted/70 text-small font-medium text-ink-600"
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-brand-700"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  {Array.from({ length: columnCount }, (_, cell) => (
                    <TableCell key={cell} className="py-4">
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    layout={reduceMotion ? false : "position"}
                    initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    data-slot="table-row"
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      "border-b border-border transition-colors hover:bg-mint-50/60",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(compact ? "py-2.5" : "py-4")}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
