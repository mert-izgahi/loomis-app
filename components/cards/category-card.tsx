"use client"

import React from 'react'
import { AnimatedCard } from '../shared/animated'
import { formatDate } from '@/lib/utils'
import { Button } from '../ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import DeleteButton from '../buttons/delete-button'
import { useDeleteCategory } from '@/hooks/use-categories'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Category } from '@prisma/client'
interface CategoryCardProps {
    category: Category
}
function CategoryCard({ category }: CategoryCardProps) {

    const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();
    const queryClient = useQueryClient();
    const handleDelete = async (id: string) => {
        await deleteCategory(id).then(() => {
            queryClient.invalidateQueries({ queryKey: ["get-categories"] });
            toast.success("Kategori silindi");
        }).catch((err) => {
            toast.error(err.message || "Kategori silinemedi");
        });
    }
    return (
        <AnimatedCard className='w-full'>
            <div className='flex flex-col gap-2 border border-border p-2 rounded hover:bg-muted w-full'>
                <div className="flex flex-row items-center justify-between">
                    <h1 className='font-bold text-sm'>{category.name}</h1>
                    <span className='text-xs text-muted-foreground'>{formatDate(category.createdAt.toString())}</span>
                </div>
                <p className='text-xs'>{category.description}</p>

                <div className="flex flex-row items-center justify-end gap-3">
                    <Button size={"icon"} variant={"outline"} asChild>
                        <Link href={`/admin/categories/${category.id}`}>
                            <Pencil size={16} />
                        </Link>
                    </Button>

                    {/* <Button size={"sm"} variant={"outline"}>
                        Sil
                    </Button> */}
                    <DeleteButton title="Kategoriyi Sil" description="Kategoriyi silmek istediginize emin misiniz?"
                        onSubmit={() => {
                            handleDelete(category.id)
                        }}
                        isDeleting={isPending} />
                </div>
            </div>
        </AnimatedCard>
    )
}

export default CategoryCard