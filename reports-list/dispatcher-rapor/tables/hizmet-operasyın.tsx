import { ClientDataTable } from "@/components/tables/client-table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";
import { useFilter } from "../filters/dispatcher-filter-context";

interface RawHizmetOperasyonItem {
  HizmetTuru: string;
  OperasyonTuru: string;
  ToplamIsemriSayisi: number;
  AcikIsemriSayisi: number;
  KapaliIsemriSayisi: number;
  BilinmeyenIsemriSayisi: number;
  AcikOran: number;
  KapaliOran: number;
  BilinmeyenOran: number;
}

function HizmetOperasyonTable() {
  const { selectedSube, selectedArac, selectedHizmetTuru } = useFilter();
  
  const { data: hizmetOperasyonData, isLoading: hizmetOperasyonLoading } =
    useQuery({
      queryKey: ["dispatcher-rapor-hizmet-operasyon"],
      queryFn: async () => {
        const response = await apiClient.get(
          "/api/dispatcher-rapor/hizmet-operasyon"
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

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!hizmetOperasyonData) return [];
    
    let filtered = hizmetOperasyonData;

    // Apply hizmet turu filter
    if (selectedHizmetTuru) {
      filtered = filtered.filter((item: RawHizmetOperasyonItem) => 
        item.HizmetTuru === selectedHizmetTuru
      );
    }

    // Note: For sube/arac filtering, ideally the raw data would include these fields
    // Since it doesn't, we can't directly filter by sube/arac here
    // You would need to modify the API to include SubeAdi and Arac in the response

    return filtered;
  }, [hizmetOperasyonData, selectedHizmetTuru]);

  const hizmetOperasyonColumns = useMemo<ColumnDef<RawHizmetOperasyonItem>[]>(
    () => [
      {
        header: "Hizmet Türü",
        accessorKey: "HizmetTuru",
        enableSorting: true,
      },
      {
        header: "Operasyon Türü",
        accessorKey: "OperasyonTuru",
        enableSorting: true,
      },
      {
        header: "Toplam İş Emri",
        accessorKey: "ToplamIsemriSayisi",
        enableSorting: true,
      },
      {
        header: "Açık İş Emri",
        accessorKey: "AcikIsemriSayisi",
        enableSorting: true,
      },
      {
        header: "Kapalı İş Emri",
        accessorKey: "KapaliIsemriSayisi",
        enableSorting: true,
      },
      {
        header: "Bilinmeyen İş Emri",
        accessorKey: "BilinmeyenIsemriSayisi",
        enableSorting: true,
      },
      {
        header: "Açık Oran (%)",
        accessorKey: "AcikOran",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return `${value.toFixed(2)}%`;
        },
      },
      {
        header: "Kapalı Oran (%)",
        accessorKey: "KapaliOran",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return `${value.toFixed(2)}%`;
        },
      },
      {
        header: "Bilinmeyen Oran (%)",
        accessorKey: "BilinmeyenOran",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return `${value.toFixed(2)}%`;
        },
      },
    ],
    []
  );

  if (hizmetOperasyonLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {(selectedSube || selectedArac || selectedHizmetTuru) && (
        <div className="text-sm text-muted-foreground">
          {selectedHizmetTuru && `Hizmet Türü: ${selectedHizmetTuru} için filtrelenmiş veriler`}
          {(selectedSube || selectedArac) && !selectedHizmetTuru && 
            `Not: Şube/Araç filtreleri bu tablo için uygulanmamıştır (veri yapısı desteği gerekir)`}
        </div>
      )}
      <ClientDataTable
        columns={hizmetOperasyonColumns}
        data={filteredData as RawHizmetOperasyonItem[]}
        searchPlaceholder="Tabloda ara..."
        showGlobalSearch={true}
        pageSize={20}
        columnFilters={[
          {
            columnId: "HizmetTuru",
            type: "select",
            placeholder: "Hizmet Türü Seç",
          },
          {
            columnId: "OperasyonTuru",
            type: "select",
            placeholder: "Operasyon Türü Seç",
          },
        ]}
      />
    </div>
  );
}

export default HizmetOperasyonTable;