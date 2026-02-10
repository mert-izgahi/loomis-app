"use client"

import React from 'react'
import { AnimatedCard } from '../shared/animated'
import { formatDate } from '@/lib/utils'
import { Button } from '../ui/button'
import Link from 'next/link'
import DeleteButton from '../buttons/delete-button'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { useDeleteGroup } from '@/hooks/use-groups'
import { Group } from '@prisma/client'
interface GroupCardProps {
    group: Group
}
function GroupCard({ group }: GroupCardProps) {

    const { mutateAsync: deleteGroup, isPending } = useDeleteGroup();
    const queryClient = useQueryClient();
    const handleDelete = async (id: string) => {
        await deleteGroup(id).then(() => {
            queryClient.invalidateQueries({ queryKey: ["get-groups"] });
            toast.success("Kategori silindi");
        }).catch((err) => {
            toast.error(err.message || "Kategori silinemedi");
        });
    }
    return (
        <AnimatedCard className='w-full'>
            <div className='flex flex-col gap-2 border border-border p-2 rounded hover:bg-muted w-full'>
                <div className="flex flex-row items-center justify-between">
                    <h1 className='font-bold text-sm'>{group.name}</h1>
                    <span className='text-xs text-muted-foreground'>{formatDate(group.createdAt.toString())}</span>
                </div>
                <p className='text-xs'>{group.description}</p>

                <div className="flex flex-row items-center justify-end gap-3">
                    <Button size={"icon"} variant={"outline"} asChild>
                        <Link href={`/admin/groups/${group.id}`}>
                            <Pencil size={16} />
                        </Link>
                    </Button>
                    <DeleteButton title="Grup Sil" description="Grup silmek istediginize emin misiniz?"
                        onSubmit={() => {
                            handleDelete(group.id)
                        }}
                        isDeleting={isPending}
                    />
                </div>
            </div>
        </AnimatedCard>
    )
}

export default GroupCard