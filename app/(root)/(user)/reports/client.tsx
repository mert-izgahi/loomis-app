"use client";

import ReportsFilters from "@/components/filters/reports-filters";
import Container from "@/components/layouts/container";
import { Pagination } from "@/components/shared/pagination";
import { BaseDataTable } from "@/components/tables/base-table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetProfileReports } from "@/hooks/use-profile";
import { formatDate } from "@/lib/utils";
import { PaginationType, ReportWithIsExistsAndCategoryAndGroup } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

function ReportsPage() {
  const searchParams = useSearchParams();
  const { data: reportsData, isLoading } = useGetProfileReports({
    query: searchParams.toString(),
  });

  const reports = useMemo(() => {
    if (reportsData) {
      return reportsData.result.records;
    }
    return [];
  }, [reportsData]);

  const pagination = useMemo(() => {
    if (reportsData) {
      return reportsData.result.pagination;
    }
    return {
      page: 1,
      limit: 10,
      totalPages: 1,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }, [reportsData]);

  const columns = useMemo<ColumnDef<ReportWithIsExistsAndCategoryAndGroup>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Adı",
        cell: (info) => (
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={`/reports/${info.row.original.id}`}
                className="text-sm hover:underline"
              >
                <span className="truncate max-w-[200px]">{info.row.original.name}</span>
              </Link>
            </TooltipTrigger>

            <TooltipContent className="max-w-xl">
              {info.row.original.name}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "description",
        header: "Açıklama",
        cell: (info) => (
          <Tooltip>
            <TooltipTrigger>
              <p className="text-sm truncate max-w-[200px]">
                {info.row.original.description}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-xl">
              {info.row.original.description}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        accessorKey: "category",
        header: "Kategori",
        cell: (info) => (
          <p className="text-sm">{info.row.original.category!.name}</p>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Oluşturulma Tarihi",
        cell: (info) => (
          <p className="text-sm">
            {formatDate(info.row.original.createdAt.toString())}
          </p>
        ),
      },
    ];
  }, []);
  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-row items-start justify-betweenp-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground text-xs">
            Raporlar aşağındaki listede bulunmaktadır.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Separator />
        <ReportsFilters
          baseUrl="reports"
          isLoading={isLoading}
          withCategory
          withSort
        />
      </div>
      {
        isLoading ? <Skeleton className="w-full h-20" /> : <>
          {reports.length === 0 ? (
            <div className="flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center">
              <p className="text-muted-foreground text-sm">Kayıt bulunamadı</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <BaseDataTable columns={columns} data={reports} loading={isLoading} />
              <Pagination pagination={pagination! as PaginationType} />
            </div>
          )}
        </>
      }

    </Container>
  );
}

export default ReportsPage;
