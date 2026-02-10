import { ClientDataTable } from "@/components/tables/client-table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";

interface RawSubeAracItem {
  SubeAdi: string;
  Arac: string;
  ToplamIsemriSayisi: number;
  AcikIsemriSayisi: number;
  KapaliIsemriSayisi: number;
  BilinmeyenIsemriSayisi: number;
  AcikOran: number;
  KapaliOran: number;
  BilinmeyenOran: number;
}

function SubeAracTable() {
  const { data: subeAracData, isLoading: subeAracLoading } = useQuery({
    queryKey: ["dispatcher-rapor-sube-arac"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/sube-arac");
      const data = await response.data;
      return data;
    },
  });

  const subeAracColumns = useMemo<ColumnDef<RawSubeAracItem>[]>(
    () => [
      {
        header: "Şube Adı",
        accessorKey: "SubeAdi",
        enableSorting: true,
      },
      {
        header: "Araç",
        accessorKey: "Arac",
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

  if (subeAracLoading) {
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
    <ClientDataTable
      columns={subeAracColumns}
      data={subeAracData as RawSubeAracItem[]}
      searchPlaceholder="Şube veya araç ara..."
      showGlobalSearch={true}
      pageSize={20}
      columnFilters={[
        {
          columnId: "SubeAdi",
          type: "select",
          placeholder: "Şube Seç",
        },
        {
          columnId: "Arac",
          type: "select",
          placeholder: "Araç Seç",
        },
      ]}
    />
  );
}

export default SubeAracTable;