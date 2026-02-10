"use client";

import Container from "@/components/layouts/container";
import LoadingState from "@/components/shared/loading-state";
import { useGetTrendingReports } from "@/hooks/use-reports";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import React from "react";

function TrendingReportsPage() {
  const { data: items, isLoading } = useGetTrendingReports();

  if (isLoading) return <LoadingState />;

  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-row items-start justify-betweenp-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Sık Kullanılan Raporlar</h1>
          <p className="text-muted-foreground text-xs">
            Sık kullanılan raporlar aşağındaki listede bulunmaktadır
          </p>
        </div>
      </div>
      {items?.length === 0 ? (
        <div className="flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">Kayıt bulunamadı</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {items?.map((item) => {
            return (
              <Link
                href={`/reports/${item.reportId}`}
                className="p-3 border border-border rounded hover:bg-muted flex flex-col gap-3"
                key={item.reportId}
              >
                <div className="flex flex-row justify-between">
                  <h3 className="text-md font-bold">{item.report?.name}</h3>
                  <p className="text-xs">{formatDate(item.report?.createdAt.toString())}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{item.report?.description}</p>
                  <p className="text-sm">Görüntülenme Sayısı : {item.viewCount}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}

export default TrendingReportsPage;
