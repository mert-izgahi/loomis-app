"use client";

import React, { useMemo } from "react";
import { AnimatedCardsContainer } from "@/components/shared/animated";
import HizmetTuruChart from "./charts/hismet-turu";
import KayitDurumuChart from "./charts/kayit-durumu";
import AracDurumuChart from "./charts/arac-durumu";
import PuantajPersonelChart from "./charts/puantaj-personel";
import HizmetOperasyonTable from "./tables/hizmet-operasyın";
import SubeAracTable from "./tables/sube-arac";
import { Separator } from "@/components/ui/separator";
import { FilterProvider } from "./filters/dispatcher-filter-context";
import { FilterControls } from "./filters/filter-controls";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useGetProfile } from "@/hooks/use-profile";
import { Role } from "@/lib/enums";
import { Skeleton } from "@/components/ui/skeleton";

export default function Report() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();

  const { data: subeAracData } = useQuery<any[]>({
    queryKey: ["dispatcher-rapor-sube-arac"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/sube-arac");
      return response.data;
    },
  });

  const { data: subeEslestirmeData } = useQuery<any[]>({
    queryKey: ["dispatcher-rapor-sube-eslestirme"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/sube-eslestirme");
      return response.data;
    },
  });

  const { data: hizmetOperasyonData } = useQuery<any[]>({
    queryKey: ["dispatcher-rapor-hizmet-operasyon"],
    queryFn: async () => {
      const response = await apiClient.get("/api/dispatcher-rapor/hizmet-operasyon");
      return response.data;
    },
  });

  if (profileLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const role = profile?.role;
  const isAdmin = role === Role.Admin;

  const allowedSubes = useMemo<string[]>(() => {
    if (subeEslestirmeData?.length) {
      const unique = [
        ...new Set(
          subeEslestirmeData
            .map((item) => (item?.SerotoninSube ? String(item.SerotoninSube) : ""))
            .filter(Boolean)
        ),
      ];
      return unique.sort();
    }

    if (!subeAracData) return [] as string[];
    const unique = [
      ...new Set(
        subeAracData
          .map((item) => (item?.SubeAdi ? String(item.SubeAdi) : ""))
          .filter(Boolean)
      ),
    ];
    return unique.sort();
  }, [subeAracData, subeEslestirmeData]);

  const defaultUserSube = allowedSubes.length ? allowedSubes[0] : null;
  const userSube = !isAdmin ? defaultUserSube : null;

  // Determine if filters should be locked
  const isFilterLocked = !isAdmin && !!userSube;

  return (
    <FilterProvider userSube={userSube} isLocked={isFilterLocked}>
      <div className="flex flex-col gap-12">
        {/* Filter Controls - Show for all users but locked for non-admins */}
        {subeAracData && hizmetOperasyonData && (
          <FilterControls
            subeAracData={subeAracData}
            hizmetOperasyonData={hizmetOperasyonData}
          />
        )}

        <AnimatedCardsContainer className="grid grid-cols-1 xl:grid-cols-2 print:grid print:grid-cols-2 gap-4">
          <HizmetTuruChart />
          <AracDurumuChart />
        </AnimatedCardsContainer>

        <div className="grid grid-cols-1 xl:grid-cols-2 print:grid print:grid-cols-2 gap-4">
          <KayitDurumuChart />
          <PuantajPersonelChart />
        </div>

        <div className="flex flex-col gap-6">
          <HizmetOperasyonTable />
          <Separator />
          <SubeAracTable />
        </div>
      </div>
    </FilterProvider>
  );
}