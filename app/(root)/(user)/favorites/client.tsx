"use client";

import ReportCard from '@/components/cards/report-card';
import Container from '@/components/layouts/container';
import LoadingState from '@/components/shared/loading-state';
import { useGetProfileFavoriteReports } from '@/hooks/use-profile'
import { ReportWithIsExistsAndCategoryAndGroup } from '@/types';
import React from 'react'

function FavoritesReportsPage() {
    const { data: reports, isLoading } = useGetProfileFavoriteReports()

    if (isLoading) return <LoadingState />
    return (
        <Container className='flex flex-col gap-8'>
            <div className="flex flex-row items-start justify-betweenp-4">
                <div className="flex flex-col gap-1">
                    <h1 className='text-2xl font-bold'>Favori Raporlar</h1>
                    <p className='text-muted-foreground text-xs'>
                        Favori raporlar aşağındaki listede bulunmaktadır
                    </p>
                </div>
            </div>
            {
                reports.length === 0 ? (
                    <div className='flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>Kayıt bulunamadı</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full">
                        <ul className='flex flex-col gap-y-4 w-full'>
                            {
                                reports.map((report: ReportWithIsExistsAndCategoryAndGroup) => (
                                    <li key={report.id}>
                                        <ReportCard report={report} />
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                )
            }

        </Container>
    )
}

export default FavoritesReportsPage