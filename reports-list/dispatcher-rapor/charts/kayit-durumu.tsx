import DivergingBarChart from '@/components/charts/bar-chart/diverging-bar-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useFilter } from '../filters/dispatcher-filter-context';

interface RawKayıtDurumuItem {
    KayitDurum: string | null;
    AcikKapaliFlag: string;
    IsemriSayısı: number;
    HizmetTuru?: string;
}

type DivergingItem = {
    name: string;
    left: number;  // negative side
    right: number; // positive side
};

const transformDivergingData = (data: RawKayıtDurumuItem[]): DivergingItem[] => {
    const grouped: { [key: string]: { Açık: number; KapalıBilinmiyor: number } } = {};

    data.forEach((item) => {
        const key = item.KayitDurum || "Bilinmiyor";
        if (!grouped[key]) grouped[key] = { Açık: 0, KapalıBilinmiyor: 0 };

        if (item.AcikKapaliFlag === "Açık") {
            grouped[key].Açık += item.IsemriSayısı;
        } else {
            grouped[key].KapalıBilinmiyor += item.IsemriSayısı;
        }
    });

    return Object.entries(grouped).map(([name, counts]) => ({
        name,
        left: -counts.KapalıBilinmiyor,
        right: counts.Açık,
    }));
};

function KayitDurumuChart() {
    const { selectedSube, selectedArac, selectedHizmetTuru } = useFilter();
    
    const { data: kayıtDurumuData, isLoading: kayıtDurumuLoading } = useQuery({
        queryKey: ["dispatcher-rapor-kayıt-durumu"],
        queryFn: async () => {
            const response = await apiClient.get('/api/dispatcher-rapor/kayit-durumu');
            return response.data;
        },
    });

    const { data: subeAracData } = useQuery({
        queryKey: ["dispatcher-rapor-sube-arac"],
        queryFn: async () => {
            const response = await apiClient.get('/api/dispatcher-rapor/sube-arac');
            return response.data;
        }
    });

    const filteredData = useMemo(() => {
        if (!kayıtDurumuData || !subeAracData) return [];

        // If no filters, return all data
        if (!selectedSube && !selectedArac && !selectedHizmetTuru) {
            return kayıtDurumuData;
        }

        // For sube/arac filtering, we need to simulate the relationship
        // In a real scenario, you'd need this data from the API
        // For now, we'll apply hizmet turu filter only
        let filtered = kayıtDurumuData;

        if (selectedHizmetTuru) {
            filtered = filtered.filter((item: RawKayıtDurumuItem) => 
                item.HizmetTuru === selectedHizmetTuru
            );
        }

        // Note: For proper sube/arac filtering, you'd need the raw data that includes
        // SubeAdi and Arac fields. This would require an API change.
        
        return filtered;
    }, [kayıtDurumuData, subeAracData, selectedSube, selectedArac, selectedHizmetTuru]);

    const divergingData = useMemo(() => {
        if (filteredData) {
            return transformDivergingData(filteredData);
        }
        return [];
    }, [filteredData]);

    if (kayıtDurumuLoading) {
        return (
            <div className='flex flex-col gap-2'>
                <Skeleton className='h-8 w-1/4' />
                <Skeleton className='h-80 w-full' />
            </div>
        );
    }

    const hasFilters = selectedSube || selectedArac || selectedHizmetTuru;
    const title = hasFilters 
        ? "Kayıt Durumu Dağılımı (Filtrelenmiş)" 
        : "Kayıt Durumu Dağılımı";

    return (
        <DivergingBarChart
            data={divergingData}
            nameKey="name"
            leftBarKey="left"
            rightBarKey="right"
            config={{
                left: { label: "Kapalı / Bilinmiyor", color: "var(--chart-2)" },
                right: { label: "Açık", color: "var(--chart-1)" },
            }}
            barSize={35}
            title={title}
            description="Negatif tarafta Kapalı/Bilinmiyor, pozitif tarafta Açık"
            xAxisFormatter={(v) => Math.abs(v).toString()}
            showReferenceLine={true}
            height={200}
            showTrend={false}
            footerText="Açık: Açık isemri sayısı, Kapalı: Kapalı isemri sayısı, Bilinmiyor: Bilinmiyor isemri sayısı"
            margin={{ top: 10, right: 10, left: 40, bottom: 10 }}
        />
    );
}

export default KayitDurumuChart;