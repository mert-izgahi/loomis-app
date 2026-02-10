"use client"

import React from 'react'
import { AnimatedCard } from '../shared/animated'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '../ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '../ui/badge'
import { ReportWithIsExistsAndCategoryAndGroup } from '@/types'
import { Group } from '@prisma/client'
interface ReportCardProps {
    report: ReportWithIsExistsAndCategoryAndGroup
    withEdit?: boolean
    withGroups?: boolean
    withStatus?: boolean
    withCategory?: boolean
    withDelete?: boolean
}
function ReportCard({ report, withEdit, withGroups, withStatus, withCategory }: ReportCardProps) {
    
    return (
        <AnimatedCard className='w-full'>
            <div className='flex flex-col gap-2 border border-border p-2 rounded hover:bg-muted w-full'>
                <div className="flex flex-row justify-between items-start">
                    <div className="flex flex-col gap-2.5">
                        <Link href={`/reports/${report.id}`}>
                            <h1 className='font-bold text-md hover:underline'>{report.name}</h1>
                        </Link>
                        <div className="flex flex-row items-center justify-between gap-2">
                            <span className='text-xs text-muted-foreground'>{formatDate(report.createdAt.toString())}</span>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                        {withStatus && <Badge
                            className={cn(
                                report.status === "Pending" && "bg-chart-1",
                                report.status === "Draft" && "bg-chart-2",
                                report.status === "Published" && "bg-chart-3",
                                "text-xs"
                            )}
                        >{report.status
                            === "Pending" ? "Beklemede" :
                            report.status === "Draft" ? "Taslak" :
                                report.status === "Published" ? "Yayınlandı" : ""
                            }</Badge>}
                        {
                            withCategory && <Badge variant={"outline"}>{report?.category?.name}</Badge>
                        }
                    </div>

                </div>
                <p className='text-xs'>{report.description}</p>

                <div className="flex flex-row items-center justify-between gap-3">
                    {
                        withGroups && <div className="flex flex-row items-center gap-2">
                            <div className="flex flex-row items-center gap-2">
                                {
                                    report?.groups?.slice(0, 3).map((group: Group) => (
                                        <Badge variant={"outline"} key={group?.id!}>{group.name}</Badge>
                                    ))
                                }
                            </div>
                        </div>
                    }
                    {
                        withEdit && <Button size={"icon"} variant={"outline"} asChild>
                            <Link href={`/admin/reports/${report.id}`}>
                                <Pencil size={16} />
                            </Link>
                        </Button>
                    }
                </div>
            </div>
        </AnimatedCard>
    )
}

export default ReportCard