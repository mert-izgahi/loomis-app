"use client";

import React, { useMemo } from 'react';
import { useFilter } from './dispatcher-filter-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FilterControlsProps {
  subeAracData: any[];
  hizmetOperasyonData: any[];
}

export function FilterControls({ subeAracData, hizmetOperasyonData }: FilterControlsProps) {
  const {
    selectedSube,
    setSelectedSube,
    selectedArac,
    setSelectedArac,
    selectedHizmetTuru,
    setSelectedHizmetTuru,
    clearFilters,
    isSubeLocked,
    lockedSube,
  } = useFilter();

  // Extract unique values for filters
  const uniqueSubeler = useMemo(() => {
    if (!subeAracData) return [];
    const subes = [...new Set(subeAracData.map((item) => item.SubeAdi))];
    return subes.sort();
  }, [subeAracData]);

  const uniqueAraclar = useMemo(() => {
    if (!subeAracData) return [];
    let filtered = subeAracData;
    if (selectedSube) {
      filtered = filtered.filter((item) => item.SubeAdi === selectedSube);
    }
    const araclar = [...new Set(filtered.map((item) => item.Arac))];
    return araclar.sort();
  }, [subeAracData, selectedSube]);

  const uniqueHizmetTurleri = useMemo(() => {
    if (!hizmetOperasyonData) return [];
    const hizmetler = [...new Set(hizmetOperasyonData.map((item) => item.HizmetTuru))];
    return hizmetler.sort();
  }, [hizmetOperasyonData]);

  const hasActiveFilters = selectedSube || selectedArac || selectedHizmetTuru;
  const hasClearableFilters = selectedArac || selectedHizmetTuru || (!isSubeLocked && selectedSube);

  return (
    <Card className="p-4 mb-6 rounded-xs shadow-none">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Filtreler</h3>
            {isSubeLocked && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Şube Kısıtlı
              </Badge>
            )}
          </div>
          {hasClearableFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Filtreleri Temizle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Şube Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Şube Adı
              {isSubeLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
            </label>
            {isSubeLocked ? (
              <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm">
                <span>{lockedSube}</span>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedSube || ""}
                onValueChange={(value) => {
                  setSelectedSube(value || null);
                  // Clear arac when sube changes
                  if (selectedArac) {
                    setSelectedArac(null);
                  }
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder="Tüm Şubeler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Şubeler</SelectItem>
                  {uniqueSubeler && uniqueSubeler!.map((sube) => (
                    <SelectItem key={sube} value={sube}>
                      {sube}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Araç Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Araç</label>
            <Select
              value={selectedArac || ""}
              onValueChange={(value) => setSelectedArac(value || null)}
              disabled={!selectedSube}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder={selectedSube ? "Tüm Araçlar" : "Önce şube seçin"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Araçlar</SelectItem>
                {uniqueAraclar && uniqueAraclar!.map((arac) => (
                  <SelectItem key={arac} value={arac}>
                    {arac}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hizmet Türü Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Hizmet Türü</label>
            <Select
              value={selectedHizmetTuru || ""}
              onValueChange={(value) => setSelectedHizmetTuru(value || null)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Tüm Hizmet Türleri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Hizmet Türleri</SelectItem>
                {uniqueHizmetTurleri && uniqueHizmetTurleri!.map((hizmet) => (
                  <SelectItem key={hizmet} value={hizmet}>
                    {hizmet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Aktif Filtreler:</span>
            {selectedSube && (
              <span className={`px-2 py-1 rounded ${isSubeLocked ? 'bg-muted' : 'bg-primary/10'}`}>
                {isSubeLocked && <Lock className="h-3 w-3 inline mr-1" />}
                Şube: {selectedSube}
              </span>
            )}
            {selectedArac && (
              <span className="bg-primary/10 px-2 py-1 rounded">
                Araç: {selectedArac}
              </span>
            )}
            {selectedHizmetTuru && (
              <span className="bg-primary/10 px-2 py-1 rounded">
                Hizmet: {selectedHizmetTuru}
              </span>
            )}
          </div>
        )}

        {isSubeLocked && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            ℹ️ Yetkiniz sadece <strong>{lockedSube}</strong> şubesinin verilerini görüntülemeye izin veriyor.
          </div>
        )}
      </div>
    </Card>
  );
}