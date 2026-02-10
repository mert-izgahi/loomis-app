import { useGetProfile, useToggleFavoriteReport } from '@/hooks/use-profile';
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { Report } from '@prisma/client';
interface Props {
    report: Report
}
function FavoriteReportButton({ report }: Props) {
    const { data: profile } = useGetProfile();
    const [isFavorite, setIsFavorite] = useState(false);
    const { mutateAsync: toggleFavorite, isPending } = useToggleFavoriteReport();

    const handleToggleFavorite = async () => {
        await toggleFavorite(report.id);
        setIsFavorite(!isFavorite);
    }

    useEffect(() => {
        setIsFavorite(profile?.favouriteReports.map(r => r.id).includes(report.id) || false);
    }, [profile?.favouriteReports, report.id]);

    return (
        <Button type='button' variant={isFavorite ? "brand" : "outline"} size={"icon"} onClick={handleToggleFavorite} disabled={isPending} className='cursor-pointer'>
            {
                isFavorite ? <HeartOff className='h-4 w-4' /> : <Heart className='h-4 w-4' />
            }
        </Button>
    )
}

export default FavoriteReportButton