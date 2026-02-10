"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColumnFilterConfig {
  columnId: string;
  type: "text" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface ClientDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  onFilteredDataChange?: (filteredData: TData[]) => void;
  columnFilters?: ColumnFilterConfig[]; // NEW: Column filter configuration
  showGlobalSearch?: boolean; // NEW: Option to hide global search
}

export function ClientDataTable<TData, TValue>({
  columns,
  data,
  searchKey = "name",
  searchPlaceholder = "Search...",
  pageSize = 10,
  onFilteredDataChange,
  columnFilters: columnFilterConfigs = [],
  showGlobalSearch = true,
}: ClientDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  // Get filtered data and notify parent component
  const filteredData = useMemo(() => {
    return table.getFilteredRowModel().rows.map((row) => row.original);
  }, [table.getFilteredRowModel().rows]);

  // Call the callback whenever filtered data changes
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [filteredData, onFilteredDataChange]);

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const totalRows = table.getFilteredRowModel().rows.length;
    const totalPages = Math.ceil(totalRows / pageSize);

    return {
      currentPage: pageIndex + 1,
      totalPages,
      totalRows,
      from: totalRows === 0 ? 0 : pageIndex * pageSize + 1,
      to: Math.min((pageIndex + 1) * pageSize, totalRows),
    };
  }, [table.getState().pagination, table.getFilteredRowModel().rows.length]);

  // Get unique values for select filters
  const getUniqueColumnValues = (columnId: string) => {
    const column = table.getColumn(columnId);
    const facetedValues = column?.getFacetedUniqueValues?.();
    if (facetedValues && facetedValues.size > 0) {
      return Array.from(facetedValues.keys()).map((value) => String(value)).sort();
    }

    const values = new Set<string>();
    data.forEach((row: any) => {
      const value = row[columnId];
      if (value !== null && value !== undefined && value !== "") {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  const hasActiveFilters = globalFilter || columnFilters.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        {/* Global Search */}
        {showGlobalSearch && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
            {hasActiveFilters && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9 px-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Filtreleri Temizle
                </Button>
                <span className="text-sm text-muted-foreground">
                  {paginationInfo.totalRows} sonuç bulundu
                </span>
              </>
            )}
          </div>
        )}

        {/* Column Filters */}
        {columnFilterConfigs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {columnFilterConfigs.map((filterConfig) => {
              const column = table.getColumn(filterConfig.columnId);
              if (!column) return null;

              if (filterConfig.type === "text") {
                return (
                  <Input
                    key={filterConfig.columnId}
                    placeholder={filterConfig.placeholder || `Filtrele...`}
                    value={(column.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      column.setFilterValue(event.target.value)
                    }
                    className="h-9 w-[180px]"
                  />
                );
              }

              if (filterConfig.type === "select") {
                const options =
                  filterConfig.options ||
                  getUniqueColumnValues(filterConfig.columnId).map((v) => ({
                    label: v,
                    value: v,
                  }));

                return (
                  <Select
                    key={filterConfig.columnId}
                    value={(column.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) =>
                      column.setFilterValue(value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="h-9 w-[180px]">
                      <SelectValue
                        placeholder={filterConfig.placeholder || "Seçiniz..."}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-sm shadow-none border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-xs">
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted() as string] ?? "⇅"}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sonuç bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {paginationInfo.from}-{paginationInfo.to} /{" "}
            {paginationInfo.totalRows}
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Sayfa {paginationInfo.currentPage} / {paginationInfo.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
