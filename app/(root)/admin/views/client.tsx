"use client";

import Container from "@/components/layouts/container";
import SearchForm from "@/components/filters/search-form";
import { BaseDataTable } from "@/components/tables/base-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaginationType, ViewWithUserAndReport } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import FilterField from "@/components/filters/filter-field";
import { sortOptions } from "@/lib/lookup";
import { formatDate, getUserAgentAsJson } from "@/lib/utils";
import { useGetViews } from "@/hooks/use-views";


function ViewsPage() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetViews({ query: searchParams.toString() });
  const [views, setViews] = useState<ViewWithUserAndReport[]>([]);

  const [pagination, setPagination] = useState<PaginationType>({
    pageIndex: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const columns = useMemo<ColumnDef<ViewWithUserAndReport>[]>(() => {
    return [
      {
        accessorKey: "user.firstName",
        header: "Adı",
        cell: (info) => <p>{info.row.original.user.firstName}</p>,
      },
      {
        accessorKey: "user.lastName",
        header: "Soyadı",
        cell: (info) => <p>{info.row.original.user.lastName}</p>,
      },

      {
        accessorKey: "user.email",
        header: "Email",
        cell: (info) => (
          <p className="text-sm truncate">{info.row.original.user.email}</p>
        ),
      },
      {
        accessorKey: "report.name",
        header: "Rapor Adı",
        cell: (info) => (
          <p className="text-sm truncate">{info.row.original.report.name}</p>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Adresi",
        cell: (info) => (
          <p className="text-sm truncate">{info.row.original.ipAddress}</p>
        ),
      },
      {
        accessorKey: "Browser",
        header: "Tarayıcı",
        cell: (info) => {
          const agents = getUserAgentAsJson(info.row.original.userAgent);
          return <p className="text-sm truncate">{agents.browser}</p>;
        },
      },
      {
        accessorKey: "System",
        header: "Sistem",
        cell: (info) => {
          const agents = getUserAgentAsJson(info.row.original.userAgent);
          return <p className="text-sm truncate">{agents.os}</p>;
        },
      },

      {
        accessorKey: "createdAt",
        header: "Oluşturulma Tarihi",
        cell: (info) => (
          <p className="text-sm">{formatDate(info.getValue() as string)}</p>
        ),
      },
    ];
  }, []);

  useEffect(() => {
    if (data) {
      setViews(data.result.records);
      setPagination(data.result.pagination as PaginationType);
    }
  }, [data]);
  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-row items-start justify-betweenp-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Görüntülenme Listesi</h1>
          <p className="text-muted-foreground text-xs">
            Izleme listesi aşağındaki listede bulunmaktadır
          </p>
        </div>
      </div>

      <Separator />
      <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <SearchForm
            baseUrl="admin/views"
            isSearching={isLoading}
          />
        </div>
        <div className="w-full flex flex-col md:flex-row items-center flex-1 sm:justify-end gap-2">
          <FilterField
            baseUrl="admin/views"
            name="sort"
            options={sortOptions}
          />
          <Button asChild variant={"secondary"} className="w-full md:w-auto">
            <Link href={`/admin/views`}>Temizle</Link>
          </Button>
        </div>
      </div>

      {views.length === 0 ? (
        <div className="flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">Kayıt bulunamadı</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <BaseDataTable
            columns={columns}
            data={views!}
            withPagination
            pagination={pagination as PaginationType}
          />
        </div>
      )}
    </Container>
  );
}

export default ViewsPage;
