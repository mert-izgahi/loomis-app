"use client";
import {
  PieChartDataType,
} from "@/components/charts/pie-chart/default";
import ReportsFilters from "@/components/filters/reports-filters";
import Container from "@/components/layouts/container";
import { MetricCard } from "@/components/shared/metric-card";
import { Pagination } from "@/components/shared/pagination";
import { BaseDataTable } from "@/components/tables/base-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartConfig } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAllReports, useGetReports } from "@/hooks/use-reports";
import { cn, formatDate } from "@/lib/utils";
import {
  ReportType,
} from "@/models/report.model";
import { PaginationType, ReportWithIsExistsAndCategoryAndGroup } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Eye,
  EyeOff,
  Pencil,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

function ReportsPage() {
  const searchParams = useSearchParams();
  const { data: reportsData, isLoading } = useGetReports({
    query: searchParams.toString(),
  });

  const { data: allReportsData, isLoading: allReportsLoading } =
    useGetAllReports();

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
  // Calculate metric counts
  const metricData = useMemo(() => {
    if (!allReportsData || allReportsData.length === 0) {
      return {
        internalCount: 0,
        externalCount: 0,
        publishedCount: 0,
        draftCount: 0,
        pendingCount: 0,
      };
    }

    const counts = {
      internalCount: 0,
      externalCount: 0,
      publishedCount: 0,
      draftCount: 0,
      pendingCount: 0,
    };

    allReportsData.forEach((report, index) => {
      // Count by type
      if (report.type === ReportType.Internal) {

        console.log(counts.internalCount, report.name);

        counts.internalCount++;
      } else if (report.type === ReportType.External) {
        counts.externalCount++;
      }

      // Count by status
      if (report.status === "Published") {
        counts.publishedCount++;
      } else if (report.status === "Draft") {
        counts.draftCount++;
      } else if (report.status === "Pending") {
        counts.pendingCount++;
      }
    });

    return counts;
  }, [allReportsData]);
  // Pie Chart Setup
  const typeChartConfig: ChartConfig = {
    Internal: {
      label: "Internal",
      color: "var(--chart-1)",
    },
    External: {
      label: "External",
      color: "var(--chart-2)",
    },
  };
  const typeChartData = useMemo(() => {
    if (!allReportsData || allReportsData.length === 0) {
      return [];
    }
    console.log(allReportsData);

    const groupedByType = allReportsData.reduce((acc, report) => {
      const status = report.type;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(groupedByType).map((status) => ({
      key: status,
      value: groupedByType[status],
      fill: typeChartConfig[status].color,
    })) as PieChartDataType[];
  }, [reports]);

  // Bar Chart Setup
  const statusChartConfig: ChartConfig = {
    Pending: {
      label: "Beklemede",
      color: "var(--chart-1)",
    },
    Draft: {
      label: "Taslak",
      color: "var(--chart-2)",
    },
    Published: {
      label: "Yayınlandı",
      color: "var(--chart-3)",
    },
  };

  const statusChartData = useMemo(() => {
    if (!allReportsData || allReportsData.length === 0) {
      return [];
    }
    const groupedByStatus = allReportsData.reduce((acc, report) => {
      const status = report.status;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(groupedByStatus).map((status) => ({
      key: status,
      value: groupedByStatus[status],
      fill: statusChartConfig[status].color,
    })) as PieChartDataType[];
  }, [allReportsData]);

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
            <TooltipContent className="max-w-xl">{info.row.original.description}</TooltipContent>
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
        accessorKey: "type",
        header: "Türü",
        cell: (info) => (
          <Badge
            variant="outline"
            className={cn("text-xs text-white border-0", {
              "bg-green-600": info.row.original.type === ReportType.Internal,
              "bg-blue-600": info.row.original.type === ReportType.External,
            })}
          >
            {info.row.original.type === "Internal" ? "Internal" : "External"}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Durum",
        cell: (info) => (
          <Badge
            className={cn(
              "text-xs",
              info.row.original.status === "Draft" && "bg-chart-3",
              info.row.original.status === "Published" && "bg-chart-2",
              info.row.original.status === "Pending" && "bg-chart-1"
            )}
          >
            {info.row.original.status === "Draft"
              ? "Taslak"
              : info.row.original.status === "Published"
                ? "Yayınlandı"
                : info.row.original.status === "Pending"
                  ? "Beklemede"
                  : "Bilinmiyor"}
          </Badge>
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
      {
        accessorKey: "updatedAt",
        header: "Günceleme Tarihi",
        cell: (info) => (
          <p className="text-sm">
            {formatDate(info.row.original.updatedAt.toString())}
          </p>
        ),
      },
      {
        accessorKey: "updatedBy",
        header: "Güncelleyenler",
        cell: (info) => {
          const fullName = info.row.original.updatedBy ? `${info.row.original.updatedBy?.firstName} ${info.row.original.updatedBy?.lastName.toString()}` : "N/A"
          return <p className="text-sm">
            {fullName}
          </p>
        },
      },
      {
        accessorKey: "",
        header: "Aksiyonlar",
        cell: (info) => (
          <div className="flex flex-row gap-2">
            <Button asChild size={"icon"} variant={"outline"}>
              <Link href={`/admin/reports/${info.row.original.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size={"icon"} variant={"outline"}>
              <Link href={`/reports/${info.row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
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
            Raporlar oluşturun, kategorileri yönetin, favori raporlarınızı
            belirleyin ve sık kullandığınız raporları kolayca takip edin
          </p>
        </div>

        <div className="flex flex-row ms-auto">
          <Button asChild>
            <Link href="/admin/reports/new">
              <Plus className="mr-2 h-4 w-4" />
              Rapor Ekle
            </Link>
          </Button>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {typeChartData.map((item) => (
          <MetricCard
            key={item.key}
            title={item.key === "Internal" ? "Internal" : "External"}
            count={item.value}
            className="w-full "
            icon={
              item.key === "Internal" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )
            }
          />
        ))}

        {statusChartData.map((item) => (
          <MetricCard
            key={item.key}
            title={
              item.key === "Pending"
                ? "Beklemede"
                : item.key === "Published"
                  ? "Yayınlandı"
                  : "Taslak"
            }
            count={item.value}
            className="w-full "
            icon={
              item.key === "Draft" ? (
                <EyeOff className="h-4 w-4" />
              ) : item.key === "Published" ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )
            }
          />
        ))}
      </div> */}
      {/* Fixed Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Internal Reports Count */}
        <MetricCard
          title="Internal Raporlar"
          count={metricData.internalCount}
          className="w-full"
          icon={<ArrowDown className="h-5 w-5" />}
        />

        {/* External Reports Count */}
        <MetricCard
          title="External Raporlar"
          count={metricData.externalCount}
          className="w-full"
          icon={<ArrowUp className="h-5 w-5" />}
        />

        {/* Published Reports Count */}
        <MetricCard
          title="Yayınlanan"
          count={metricData.publishedCount}
          className="w-full"
          icon={<Eye className="h-5 w-5" />}
        />

        {/* Draft Reports Count */}
        <MetricCard
          title="Taslak"
          count={metricData.draftCount}
          className="w-full"
          icon={<EyeOff className="h-5 w-5" />}
        />

        {/* Pending Reports Count */}
        <MetricCard
          title="Beklemede"
          count={metricData.pendingCount}
          className="w-full"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Separator />
        <ReportsFilters
          baseUrl="admin/reports"
          isLoading={isLoading || allReportsLoading}
          withCategory
          withSort
          withStatus
          withType
        />
      </div>
      {
        isLoading && <Skeleton className="w-full h-20" />
      }
      {reports.length === 0 && !isLoading ? (
        <div className="flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">Kayıt bulunamadı</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <BaseDataTable columns={columns} data={reports} loading={isLoading || allReportsLoading} />
          <Pagination pagination={pagination! as PaginationType} />
        </div>
      )}
    </Container>
  );
}

export default ReportsPage;
