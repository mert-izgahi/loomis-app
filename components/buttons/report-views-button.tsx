"use client";

import React, { useEffect, useState } from 'react'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '../ui/button'
import { formatDate } from '@/lib/utils'
import { ReportWithIsExistsAndCategoryAndGroup } from '@/types'
import { Group } from '@prisma/client'
import { useGetReportViews } from '@/hooks/use-reports';
import { Eye } from 'lucide-react';
import { Input } from '../ui/input';

interface Props {
    reportId: string
}
function ReportViewsButton({ reportId }: Props) {
    const { data, isLoading } = useGetReportViews({ id: reportId! });

    const [views, setViews] = useState([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        if (data) {
            setViews(data.views!);
        }
    }, [data]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
        const filteredViews = data?.views!.filter((view) =>
            view?.user?.firstName?.toLowerCase().includes(e.target.value.toLowerCase()) ||
            view?.user?.lastName?.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setViews(filteredViews || []);
    };






    return (
        <Sheet>

            <SheetTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                    <Eye /> Görüntülenme
                </Button>
            </SheetTrigger>

            <SheetContent className='sm:max-w-2xl'>
                <SheetHeader>
                    <SheetTitle>Görüntülenme</SheetTitle>
                    <SheetDescription>
                        Görüntülenme tarihleri ve detayları
                    </SheetDescription>
                </SheetHeader>

                <div className="p-4 flex flex-col gap-4 h-[calc(100vh-200px)] overflow-y-auto">
                    <Input placeholder='Ara' value={keyword} onChange={handleSearch} />
                    {
                        views && views!?.map((view: any) => (
                            <div key={view!.id} className='p-2 border border-border rounded text-sm'>
                                <p className='font-bold text-xs'>
                                    {view?.user?.firstName} {view?.user?.lastName}
                                </p>
                                <p className='text-xs'>{formatDate(view.createdAt)}</p>
                            </div>
                        ))
                    }
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ReportViewsButton