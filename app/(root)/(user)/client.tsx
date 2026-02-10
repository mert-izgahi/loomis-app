"use client"

import ReportCard from "@/components/cards/report-card";
import Container from "@/components/layouts/container"
import { AnimatedCard } from "@/components/shared/animated";
import { MetricCard } from "@/components/shared/metric-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfileMetrics } from "@/hooks/use-profile"
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { ReportWithIsExistsAndCategoryAndGroup } from "@/types";
import { Star, FileChartColumn, Package } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";



export function HomePage() {
  const { data, isLoading } = useGetProfileMetrics()
  const { isAdmin } = useSession();
  const lastReport = useMemo(() => {
    return data?.newReports && data.newReports.length > 0 ? data.newReports[0] : null;
  }, [data]);
  const router = useRouter();
  useEffect(() => {
    if (isAdmin) {
      router.push("/admin")
    }
  }, [isAdmin])
  return (
    <Container className="flex flex-col gap-8">
      {
        isLoading && <Skeleton className="w-full h-20" />
      }
      {
        data && <div className={cn("grid grid-cols-1 gap-4", {
          "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 ": isAdmin,
          "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3": !isAdmin
        })}>
          <AnimatedCard>
            <MetricCard href="/favorites" title="Favori Raporlar" count={data?.favoriteReportsCount || 0}
              icon={<Star size={20} stroke="#1a1818" />} />
          </AnimatedCard>
          <AnimatedCard>
            <MetricCard href="reports" title="Raporlar" count={data?.reportsCount || 0}
              icon={<FileChartColumn size={20} stroke="#1a1818" />} />
          </AnimatedCard>
          {
            lastReport && <AnimatedCard>
              <MetricCard
                href={`/reports/${lastReport?.id}`}
                title="Son eklenen rapor"
                icon={<Package size={20} stroke="#1a1818" />}
              />
            </AnimatedCard>
          }
        </div>
      }

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Yeni Eklenen Raporlar</h1>
        <p className="text-muted-foreground text-xs">
          Yeni eklenen raporlar aşağıdaki listede bulunmaktadır.
        </p>
      </div>
      <Separator />
      {
        isLoading && <Skeleton className="w-full h-20" />
      }
      {
        data && <div className="flex flex-col gap-4">
          {data?.newReports && data.newReports.length === 0 && (
            <div className="p-4 bg-muted rounded shadow-xs flex flex-col items-center h-64 justify-center">
              <p className="text-sm text-muted-foreground">Yeni eklenen rapor bulunmamaktadır</p>
            </div>
          )}

          {data?.newReports && data.newReports.map((report) => (
            <AnimatedCard key={report.id}>
              <ReportCard report={report as ReportWithIsExistsAndCategoryAndGroup} />
            </AnimatedCard>
          ))}
        </div>
      }
      {/* {ReportComponent && <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Son Eklenen Rapor</h1>
          <p className="text-muted-foreground text-xs">Son eklenen rapor aşağındaki önizleme alanında bulunmaktadır</p>
        </div>
        <ReportComponent />
      </div>} */}
    </Container>
  )
}