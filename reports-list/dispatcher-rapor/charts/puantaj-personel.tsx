import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { ChartConfig } from "@/components/ui/chart";
import DefaultHorizontalBarChart from "@/components/charts/bar-chart/horizontal-bar-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilter } from "../filters/dispatcher-filter-context";

function PuantajPersonelChart() {
  const { selectedSube, selectedArac, selectedHizmetTuru } = useFilter();

  const { data: puantajPersonelData, isLoading } = useQuery({
    queryKey: ["dispatcher-rapor-puantaj-personel"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/api/dispatcher-rapor/puantaj-personel"
      );
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

  // Filter data based on selected sube
  const filteredData = useMemo(() => {
    if (!puantajPersonelData) return [];

    // If no sube filter, return all data
    if (!selectedSube) {
      return puantajPersonelData;
    }

    // Filter to show only the selected sube's data
    // Note: PuantajSorumlulukMerkezi should match SubeAdi
    return puantajPersonelData.filter((item: any) => {
      // Exact match or contains match
      return item.PuantajSorumlulukMerkezi === selectedSube ||
        item.PuantajSorumlulukMerkezi?.includes(selectedSube) ||
        selectedSube?.includes(item.PuantajSorumlulukMerkezi);
    });
  }, [puantajPersonelData, selectedSube]);

  const chartConfig: ChartConfig = {
    PuantajSorumlulukMerkezi: {
      label: "Puantaj Sorumluluk Merkezi",
      color: "var(--chart-2)",
    },
    PersonelSayisi: {
      label: "Personel Sayısı",
      color: "var(--chart-1)",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">
          {selectedSube
            ? `${selectedSube} için personel verisi bulunamadı`
            : "Veri bulunamadı"}
        </p>
      </div>
    );
  }

  const sortedData = [...filteredData].sort(
    (a, b) => b.PersonelSayisi - a.PersonelSayisi
  );

  const hasFilters = selectedSube || selectedArac || selectedHizmetTuru;
  const title = hasFilters
    ? "Puantaj Personel Sayısı (Filtrelenmiş)"
    : "Puantaj Personel Sayısı (Bugün)";

  return (
    <DefaultHorizontalBarChart
      data={sortedData}
      config={chartConfig}
      nameKey="PuantajSorumlulukMerkezi"
      valueKey="PersonelSayisi"
      title={title}
      description="Puantaj sorumluluk merkezine göre personel sayısı"
      footerText={`${selectedSube ? selectedSube + ' ' : ''}Merkezlerdeki toplam personel sayısı gösteriliyor`}
      trendText="Personel dağılımı görüntüleniyor"
      showTrend={false}
      showLabelList={true}
      barSize={35}
      unit="personel"
      color="var(--chart-5)"
      labelFormatter={(value) => value.toString()}
      tooltipFormatter={(value, payload) => [
        `${value} personel`,
        payload.PuantajSorumlulukMerkezi as string,
      ]}
      truncateName={(name, isMobile, isLargeScreen) => {
        const maxLength = isLargeScreen ? 20 : isMobile ? 10 : 14;
        return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
      }}
      yAxisWidth={140}
      height={800}
      barRadius={[0, 6, 6, 0]}
      minChartHeight={400}
      maxChartHeight={800}
    />
  );
}

export default PuantajPersonelChart;