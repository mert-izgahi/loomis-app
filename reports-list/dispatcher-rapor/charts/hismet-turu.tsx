import MultiBarChart from '@/components/charts/bar-chart/multi-bar-chart';
import { ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useFilter } from '../filters/dispatcher-filter-context';

interface HizmetTuruDataType {
    HizmetTuru: string;
    AcikKapaliFlag: string;
    IsemriSayisi: number;
    Oran: number;
}

// Add this interface for the full data with SubeAdi
interface FullDataType extends HizmetTuruDataType {
    SubeAdi?: string;
    Arac?: string;
}

function HizmetTuruChart() {
    const { selectedSube, selectedArac, selectedHizmetTuru } = useFilter();
    
    // Fetch sube-arac data to get the mapping
    const { data: subeAracData } = useQuery({
        queryKey: ["dispatcher-rapor-sube-arac"],
        queryFn: async () => {
            const response = await apiClient.get('/api/dispatcher-rapor/sube-arac');
            return response.data;
        }
    });

    const { data: hizmetTuruData, isLoading: hizmetTuruLoading } = useQuery({
        queryKey: ["dispatcher-rapor-hizmet-turu"],
        queryFn: async () => {
            const response = await apiClient.get('/api/dispatcher-rapor/hizmet-turu');
            return response.data;
        }
    });

    const filteredAndAggregatedData = useMemo(() => {
        if (!hizmetTuruData || !subeAracData) return [];

        // Create a mapping from HizmetTuru to matching SubeAdi/Arac combinations
        const hizmetToSubeArac = new Map<string, Set<string>>();
        
        subeAracData.forEach((item: any) => {
            // Apply sube and arac filters
            if (selectedSube && item.SubeAdi !== selectedSube) return;
            if (selectedArac && item.Arac !== selectedArac) return;
            
            const key = `${item.SubeAdi}|${item.Arac}`;
            if (!hizmetToSubeArac.has('all')) {
                hizmetToSubeArac.set('all', new Set());
            }
            hizmetToSubeArac.get('all')!.add(key);
        });

        // If filters are active but no matches, return empty
        if ((selectedSube || selectedArac) && hizmetToSubeArac.get('all')?.size === 0) {
            return [];
        }

        // Filter hizmet turu data
        let filtered = hizmetTuruData.filter((item: HizmetTuruDataType) => {
            if (selectedHizmetTuru && item.HizmetTuru !== selectedHizmetTuru) {
                return false;
            }
            return item.AcikKapaliFlag && item.AcikKapaliFlag.trim() !== "";
        });

        // Group by HizmetTuru and AcikKapaliFlag, then recalculate percentages
        const grouped = new Map<string, Map<string, number>>();
        
        filtered.forEach((item: HizmetTuruDataType) => {
            const hizmetKey = item.HizmetTuru;
            const flagKey = item.AcikKapaliFlag.trim();
            
            if (!grouped.has(hizmetKey)) {
                grouped.set(hizmetKey, new Map());
            }
            const flagMap = grouped.get(hizmetKey)!;
            flagMap.set(flagKey, (flagMap.get(flagKey) || 0) + item.IsemriSayisi);
        });

        // Convert back to array format with recalculated percentages
        const result: any[] = [];
        grouped.forEach((flagMap, hizmetTuru) => {
            const total = Array.from(flagMap.values()).reduce((sum, val) => sum + val, 0);
            flagMap.forEach((count, flag) => {
                result.push({
                    HizmetTuru: hizmetTuru,
                    AcikKapaliFlag: flag,
                    IsemriSayisi: count,
                    Oran: total > 0 ? (count / total) * 100 : 0,
                });
            });
        });

        return result;
    }, [hizmetTuruData, subeAracData, selectedSube, selectedArac, selectedHizmetTuru]);

    const multiBarChartConfig = {
        Açık: {
            label: "Açık",
            color: "var(--chart-1)",
        },
        Kapalı: {
            label: "Kapalı",
            color: "var(--chart-2)",
        },
        Bilinmiyor: {
            label: "Bilinmiyor",
            color: "var(--chart-4)",
        },
        Other: {
            label: "Other",
            color: "var(--chart-5)",
        },
    } satisfies ChartConfig;

    if (hizmetTuruLoading) {
        return (
            <div className='flex flex-col gap-2'>
                <Skeleton className='h-8 w-1/4' />
                <Skeleton className='h-80 w-full' />
            </div>
        );
    }

    const hasFilters = selectedSube || selectedArac || selectedHizmetTuru;
    const title = hasFilters 
        ? "Hizmet Türüne Göre Oranlar (Filtrelenmiş)" 
        : "Hizmet Türüne Göre Oranlar";

    return (
        <MultiBarChart
            data={filteredAndAggregatedData}
            primaryCategoryKey="HizmetTuru"
            secondaryCategoryKey="AcikKapaliFlag"
            valueKey="Oran"
            config={multiBarChartConfig}
            title={title}
            description="Açık/Kapalı/Bilinmiyor durumlarına göre yüzdelik dağılım"
            unit="%"
            yAxisFormatter={(value) => `${value}%`}
            stack={true}
            showLabelList={true}
            showTrend={false}
            hideLabel={true}
            labelListPosition="right"
            labelFormatter={(value) => `${Number(value).toFixed(1)}%`}
            tooltipFormatter={(value, name, props) => [
                `${Number(value).toFixed(1)}%`,
                name
            ]}
            height={500}
            footerText="Açık: Açık isemri sayısı, Kapalı: Kapalı isemri sayısı, Bilinmiyor: Bilinmiyor isemri sayısı"
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        />
    );
}

export default HizmetTuruChart;