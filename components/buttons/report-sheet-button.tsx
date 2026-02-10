import React from 'react'
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

interface Props {
    report: ReportWithIsExistsAndCategoryAndGroup
}
function ReportSheetButton({ report }: Props) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    Raporu Detayları
                </Button>
            </SheetTrigger>
            <SheetContent className='sm:max-w-2xl'>
                <SheetHeader>
                    <SheetTitle>{report.name}</SheetTitle>
                    <SheetDescription>
                        {report.description}
                    </SheetDescription>
                </SheetHeader>

                <div className='p-4 flex flex-col gap-4'>
                    <div className="flex flex-col gap-2">
                        <h3 className='font-bold text-sm'>Gruplar</h3>
                        {
                            report.groups!.map((group: Group) => (
                                <div key={group.id} className='p-2 border border-border rounded text-sm'>
                                    <p className='text-xs'>{group.name}</p>
                                </div>
                            ))
                        }
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className='font-bold text-sm'>Rapor Kategorisi</h3>
                        <div className='p-2 border border-border rounded text-sm'>
                            <p className='text-xs'>{report.category!.name}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className='font-bold text-sm'>Oluşturulma Tarihi</h3>
                        <div className='p-2 border border-border rounded text-sm'>
                            <p className='text-xs'>{formatDate(report.createdAt.toString())}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className='font-bold text-sm'>Son Düzenleme Tarihi</h3>
                        <div className='p-2 border border-border rounded text-sm'>
                            <p className='text-xs'>{formatDate(report.updatedAt.toString())}</p>
                        </div>
                    </div>
                    {
                        report.updatedBy && <div className="flex flex-col gap-2">
                            <h3 className='font-bold text-sm'>Düzenleyen</h3>
                            <div className='p-2 border border-border rounded text-sm'>
                                <p className='text-xs'>{`${report.updatedBy.firstName} ${report.updatedBy.lastName}`}</p>
                            </div>
                        </div>
                    }
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ReportSheetButton