"use client";

import { DefaultPieChart } from "@/components/charts/pie-chart/default";
import { ChartConfig } from "@/components/ui/chart";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilter } from "../filters/dispatcher-filter-context";

type AracDurumData = {
  AracDurumu: string;
  IsemriSayisi: number;
  Oran: number;
};

function AracDurumuChart() {
  const { selectedSube, selectedArac, selectedHizmetTuru } = useFilter();
  
  const { data: aracDurumuData, isLoading } = useQuery({
    queryKey: ["dispatcher-rapor-arac-durumu"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/arac-durumu");
      return response.data;
    },
  });

  const { data: subeAracData } = useQuery({
    queryKey: ["dispatcher-rapor-sube-arac"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/sube-arac");
      return response.data;
    },
  });

  const { data: hizmetOperasyonData } = useQuery({
    queryKey: ["dispatcher-rapor-hizmet-operasyon"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/hizmet-operasyon");
      return response.data;
    },
  });

  const filteredData = useMemo(() => {
    if (!aracDurumuData || !subeAracData) return aracDurumuData;

    // If no filters active, return original data
    if (!selectedSube && !selectedArac && !selectedHizmetTuru) {
      return aracDurumuData;
    }

    // Get filtered sube-arac combinations
    let filteredSubeArac = subeAracData;
    
    if (selectedSube) {
      filteredSubeArac = filteredSubeArac.filter((item: any) => 
        item.SubeAdi === selectedSube
      );
    }
    
    if (selectedArac) {
      filteredSubeArac = filteredSubeArac.filter((item: any) => 
        item.Arac === selectedArac
      );
    }

    // Calculate totals from filtered data
    const atanmis = filteredSubeArac.reduce((sum: number, item: any) => 
      sum + item.ToplamIsemriSayisi, 0
    );

    // For "Araca Atanmamış" we need to estimate based on the filter
    // This is a simplified approach - ideally you'd have this in the raw data
    const totalOriginal = aracDurumuData.reduce((sum: number, item: AracDurumData) => 
      sum + item.IsemriSayisi, 0
    );
    
    const atanmamis = Math.max(0, totalOriginal - atanmis);
    const total = atanmis + atanmamis;

    return [
      {
        AracDurumu: "Araca Atanmış",
        IsemriSayisi: atanmis,
        Oran: total > 0 ? atanmis / total : 0,
      },
      {
        AracDurumu: "Araca Atanmamış",
        IsemriSayisi: atanmamis,
        Oran: total > 0 ? atanmamis / total : 0,
      },
    ];
  }, [aracDurumuData, subeAracData, selectedSube, selectedArac, selectedHizmetTuru]);

  const chartConfig: ChartConfig = {
    "Araca Atanmış": {
      label: "Araca Atanmış",
      color: "var(--chart-1)",
    },
    "Araca Atanmamış": {
      label: "Araca Atanmamış",
      color: "var(--chart-2)",
    },
  };

  const data = filteredData?.map((item: AracDurumData) => {
    return {
      key: item.AracDurumu,
      value: item.IsemriSayisi,
      percent: item.Oran * 100,
      fill: chartConfig[item.AracDurumu].color,
    };
  });

  const labelFormatter = (value: number, entry: any) => {
    const percent = entry?.percent ? entry.percent.toFixed(1) : '0.0';
    return `${value} - (${percent}%)`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-6  rounded-lg bg-card">
        <div className="flex flex-col gap-2 mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative">
            <Skeleton className="w-64 h-64 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </div>
    );
  }

  const hasFilters = selectedSube || selectedArac || selectedHizmetTuru;
  const title = hasFilters 
    ? "Araç Durumu Dağılımı (Filtrelenmiş)" 
    : "Araç Durumu Dağılımı";

  return (
    <DefaultPieChart
      data={data || []}
      config={chartConfig}
      dataKey="value"
      nameKey="key"
      title={title}
      description="Araç durumu dağılımı raporlarını gösterir."
      showLabel
      showLegend
      formatter={labelFormatter}
      className="w-full h-full"
      footerText={`Toplam rapor sayısı: ${data?.reduce((sum, item) => sum + item.value, 0) || 0}`}
      innerRadius={80}
      withFilters
      strokeWidth={1}
    />
  );
}

export default AracDurumuChart;