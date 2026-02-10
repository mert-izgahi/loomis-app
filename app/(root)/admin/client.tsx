"use client";

import ReportCard from "@/components/cards/report-card";
import DefaultBarChart from "@/components/charts/bar-chart/default";
import { DefaultPieChart, PieChartDataType } from "@/components/charts/pie-chart/default";
import FilterField from "@/components/filters/filter-field";
import Container from "@/components/layouts/container";
import {
  AnimatedCard,
} from "@/components/shared/animated";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { ChartConfig } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfileMetrics } from "@/hooks/use-profile";
import { useGetAllReports } from "@/hooks/use-reports";
import { useGetAllUsers } from "@/hooks/use-users";
import { useGetAllViews } from "@/hooks/use-views";
import { ReportType } from "@/lib/enums";
import { months } from "@/lib/lookup";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { ReportWithIsExistsAndCategoryAndGroup } from "@/types";
import { Star, FileChartColumn, Layers, Users, User, Package } from 'lucide-react'
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";



export function HomePage() {
  const { data, isLoading } = useGetProfileMetrics();
  const { isAdmin } = useSession();

  const lastReport = useMemo(() => {
    return data?.newReports && data.newReports.length > 0
      ? data.newReports[0]
      : null;
  }, [data])

  const searchParams = useSearchParams();

  // Extract query params
  const reportId = searchParams.get("reportId");
  const selectedYear = searchParams.get("selectedYear");

  // Data fetching
  const { data: allReportsData, isLoading: allReportsLoading } =
    useGetAllReports();
  const { data: allUsers, isLoading: allUsersLoading } = useGetAllUsers();
  const { data: allViews, isLoading: allViewsLoading } = useGetAllViews();

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
  // Find selected report for display
  const selectedReport = useMemo<ReportWithIsExistsAndCategoryAndGroup | null>(() => {
    if (!reportId || !allReportsData) return null;
    return allReportsData.find((report) => report.id.toString() === reportId) || null;
  }, [reportId, allReportsData]);

  // Filter views based on query params
  const filteredViews = useMemo(() => {
    if (!allViews) return [];

    let filtered = allViews;

    if (reportId) {
      filtered = filtered.filter(
        (view) => view.reportId.toString() === reportId
      );
    }

    if (selectedYear) {
      const year = parseInt(selectedYear);
      filtered = filtered.filter(
        (view) => new Date(view.createdAt).getFullYear() === year
      );
    }

    return filtered;
  }, [allViews, reportId, selectedYear]);

  // Chart Configs
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

  const roleChartConfig: ChartConfig = {
    Admin: {
      label: "Admin",
      color: "var(--chart-1)",
    },
    User: {
      label: "Kullanıcı",
      color: "var(--chart-2)",
    },
  };

  const activeChartConfig: ChartConfig = {
    true: {
      label: "Aktif",
      color: "var(--chart-3)",
    },
    false: {
      label: "Pasif",
      color: "var(--chart-5)",
    },
  };

  const viewChartConfig: ChartConfig = {
    views: {
      label: "Görüntüleme",
      color: "var(--chart-5)",
    },
  };

  // Chart Data Calculations
  const typeChartData = useMemo(() => {
    if (!allReportsData?.length) return [];

    const groupedByType = allReportsData.reduce((acc, report) => {
      const type = report.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByType).map(([key, value]) => ({
      key,
      value,
      fill: typeChartConfig[key]?.color || "var(--chart-1)",
    })) as PieChartDataType[];
  }, [allReportsData]);

  const statusChartData = useMemo(() => {
    if (!allReportsData?.length) return [];

    const groupedByStatus = allReportsData.reduce((acc, report) => {
      const status = report.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByStatus).map(([key, value]) => ({
      key,
      value,
      fill: statusChartConfig[key]?.color || "var(--chart-1)",
    })) as PieChartDataType[];
  }, [allReportsData]);

  const roleChartData = useMemo(() => {
    if (!allUsers?.length) return [];

    const groupedByRole = allUsers.reduce((acc, user) => {
      const role = user.role || "User";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByRole).map(([key, value]) => ({
      key,
      value,
      fill: roleChartConfig[key]?.color || "var(--chart-1)",
    }));
  }, [allUsers]);

  const activeChartData = useMemo(() => {
    if (!allUsers?.length) return [];

    const groupedByActive = allUsers.reduce((acc, user) => {
      const key = String(user.isActive);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByActive).map(([key, value]) => ({
      key,
      value,
      fill: activeChartConfig[key]?.color || "var(--chart-1)",
    }));
  }, [allUsers]);

  const viewsChartData = useMemo(() => {
    if (!filteredViews.length) return [];

    const groupedByMonth = filteredViews.reduce((acc, view) => {
      const monthIndex = new Date(view.createdAt).getMonth();
      const month = months[monthIndex];
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return months.map((month) => ({
      month,
      views: groupedByMonth[month] || 0,
    }));
  }, [filteredViews]);

  // Generate year options
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => ({
      label: String(currentYear - i),
      value: String(currentYear - i),
    }));
  }, []);


  return (
    <Container className="flex flex-col gap-8">
      {
        isLoading && <Skeleton className="w-full h-20" />
      }
      <div
        className={cn("grid grid-cols-1 gap-4", {
          "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ": isAdmin,
          "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5": !isAdmin,
        })}
      >

        {
          !isAdmin && data && <>
            <AnimatedCard>
              <MetricCard
                href="/favorites"
                title="Favori Raporlar"
                count={data?.favoriteReportsCount || 0}
                icon={<Star size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>

            <AnimatedCard>
              <MetricCard
                href={"/reports"}
                title="Raporlar"
                count={data?.reportsCount || 0}
                icon={<FileChartColumn size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
          </>
        }

        {isAdmin && data && (
          <>
            <AnimatedCard>
              <MetricCard
                href={"/admin/reports"}
                title="Raporlar"
                count={metricData?.externalCount + metricData?.internalCount || 0}
                icon={<FileChartColumn size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
            <AnimatedCard>
              <MetricCard
                href="/admin/categories"
                title="Kategoriler"
                count={data?.categoriesCount || 0}
                icon={<Layers size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
            <AnimatedCard>
              <MetricCard
                href="/admin/groups"
                title="Gruplar"
                count={data?.groupsCount || 0}
                icon={<Users size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
            <AnimatedCard>
              <MetricCard
                href="/admin/users"
                title="Kullanıcılar"
                count={data?.usersCount || 0}
                icon={<User size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
            <AnimatedCard>
              <MetricCard
                href={`/reports/${lastReport?.id}`}
                title="Son eklenen rapor"
                icon={<Package size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Yeni Eklenen Raporlar</h1>
        <p className="text-muted-foreground text-xs">
          Yeni eklenen raporlar aşağıdaki listede bulunmaktadır.
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-4">
        {data?.newReports && data.newReports.length === 0 && (
          <div className="p-4 bg-muted rounded shadow-xs flex flex-col items-center h-64 justify-center">
            <p className="text-sm text-muted-foreground">
              Yeni eklenen rapor bulunmamaktadır
            </p>
          </div>
        )}

        {
          isLoading && <Skeleton className="w-full h-20" />
        }
        {data?.newReports &&
          data.newReports.map((report) => (
            <div key={report.id}>
              <ReportCard report={report as ReportWithIsExistsAndCategoryAndGroup} />
            </div>
          ))}
      </div>
      <Separator />
      {/* Reports Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Raporlar Bilgileri</h1>
          <p className="text-xs text-muted-foreground">
            Raporlar bilgileri ve grafikler aşağındaki listede bulunmaktadır
          </p>
        </div>

        {allReportsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard>
              <DefaultPieChart
                data={typeChartData}
                config={typeChartConfig}
                dataKey="value"
                nameKey="key"
                title="Rapor Türülerinin Dağılımı"
                description="Rapor türülerinin dağılımını görüntüleyen grafik"
                showLabel
                showLegend
                showFooter
                className="w-full h-full"
                trendText="Rapor sayısı"
                footerText={`Toplam rapor sayısı: ${allReportsData?.length || 0
                  }`}
              />
            </AnimatedCard>
            <AnimatedCard>
              <DefaultPieChart
                data={statusChartData}
                config={statusChartConfig}
                dataKey="value"
                nameKey="key"
                title="Rapor Durumlarının Dağılımı"
                description="Rapor durumlarının dağılımını görüntüleyen grafik"
                showLabel
                showLegend
                className="w-full h-full"
                withFilters
                showFooter
                activeIndex={2}
                trendText="Rapor sayısı"
                footerText={`Toplam rapor sayısı: ${allReportsData?.length || 0
                  }`}
              />
            </AnimatedCard>
          </div>
        )}
      </div>

      <Separator />

      {/* Users Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Kullanıcı Bilgileri</h1>
          <p className="text-xs text-muted-foreground">
            Kullanıcı bilgileri ve grafikler aşağındaki listede bulunmaktadır
          </p>
        </div>

        {allUsersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard>
              <DefaultPieChart
                data={roleChartData}
                config={roleChartConfig}
                dataKey="value"
                nameKey="key"
                title="Kullanıcı Rol Dağılımı"
                description="Kullanıcıların rol dağılımı"
                showLabel
                showLegend
                innerRadius={0}
                strokeWidth={2}
                className="w-full h-full"
                showFooter
                trendText="Rol kullanım raporu"
                withFilters
                footerText={`Toplam kullanıcı: ${allUsers?.length || 0}`}
              />
            </AnimatedCard>
            <AnimatedCard>
              <DefaultPieChart
                data={activeChartData}
                config={activeChartConfig}
                dataKey="value"
                nameKey="key"
                title="Kullanıcı Aktiflik Dağılımı"
                description="Kullanıcıların aktiflik dağılımı"
                showLabel
                showLegend
                innerRadius={0}
                strokeWidth={2}
                className="w-full h-full"
                showFooter
                trendText="Aktiflik kullanım raporu"
                withFilters
                footerText={`Toplam kullanıcı: ${allUsers?.length || 0}`}
              />
            </AnimatedCard>
          </div>
        )}
      </div>

      <Separator />
      {/* Views Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Görüntüleme Bilgileri</h1>
          <p className="text-xs text-muted-foreground">
            Görüntüleme bilgileri ve grafikler aşağındaki listede bulunmaktadır
          </p>
        </div>



        <div>
          {allViewsLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="flex flex-col">
              <DefaultBarChart
                data={viewsChartData}
                config={viewChartConfig}
                filters={
                  <div className="flex flex-row items-center justify-end gap-2">
                    <FilterField
                      baseUrl="admin"
                      options={allReportsData?.map((report) => ({
                        label: report.name as string,
                        value: report.id as string,
                      })) || []}
                      name="reportId"
                      placeholder="Rapor Seçiniz"
                    />
                    <FilterField
                      baseUrl="admin"
                      options={yearOptions}
                      name="selectedYear"
                      placeholder="Yıl Seçiniz"
                    />

                    {(selectedReport || selectedYear) && (
                      <Button asChild variant={"secondary"}>
                        <Link href={`/admin`}>Temizle</Link>
                      </Button>
                    )}
                  </div>
                }
                xAxisKey="month"
                barKeys={["views"]}
                title="Aylık Görüntüleme"
                description={
                  viewsChartData.length > 0
                    ? "Görüntüleme verileri aylık olarak gösteriliyor."
                    : "İlgili Yıl'a veya Ay'a ait veri bulunamadı."
                }
                footerText={`Toplam görüntüleme: ${filteredViews.length}`}
                trendText={"Aylık Görüntüleme"}
              />
            </div>
          )}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            {allViewsLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <MetricCard
                title={metricLabel}
                count={filteredViews.length}
                icon={<Eye className="w-6 h-6" />}
                className="w-full h-full flex items-center justify-center"
              />
            )}
          </div>
          <div className="md:col-span-2">
            {allViewsLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <>
                {browserChartData.length > 0 ? (
                  <DefaultPieChart
                    data={browserChartData}
                    config={browserChartConfig}
                    dataKey="value"
                    nameKey="key"
                    title="Tarayıcı Dağılımı"
                    description="Kullanıcıların kullandığı tarayıcıların dağılımı"
                    showLabel
                    showLegend
                    className="w-full h-full"
                    showFooter
                    trendText="Tarayıcı kullanım raporu"
                    withFilters
                    footerText={`Toplam görüntüleme: ${filteredViews.length}`}
                  />
                ) : (
                  <div className="flex flex-col gap-4 w-full h-full border border-border rounded p-6 items-center justify-center">
                    <Activity className="w-12 h-12" />
                    <p className="text-sm">
                      İlgili Yıl'a veya Ay'a ait veri bulunamadı.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div> */}
      </div>
      {/* {ReportComponent && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Son Eklenen Rapor</h1>
            <p className="text-muted-foreground text-xs">
              Son eklenen rapor aşağındaki önizleme alanında bulunmaktadır
            </p>
          </div>
          <ReportComponent />
        </div>
      )} */}
    </Container>
  );
}
