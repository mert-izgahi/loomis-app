"use client"
import Container from '@/components/layouts/container';
import SearchForm from '@/components/filters/search-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDeleteGroup, useGetGroups } from '@/hooks/use-groups';
import { PaginationType } from '@/types';
import { Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react'
import FilterField from '@/components/filters/filter-field';
import { sortOptions } from '@/lib/lookup';
import { ColumnDef } from '@tanstack/react-table';
import { GroupDocumentType } from '@/models/group.model';
import { BaseDataTable } from '@/components/tables/base-table';
import { formatDate } from '@/lib/utils';
import DeleteButton from '@/components/buttons/delete-button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function GroupsPage() {
    const searchParams = useSearchParams();
    const { data, isLoading } = useGetGroups({ query: searchParams.toString() });

    const groups = useMemo(() => {
        if (data) {
            return data.result.records;
        }
        return [];
    }, [data]);

    const pagination = useMemo(() => {
        if (data) {
            return data.result.pagination;
        }
        return {
            page: 1,
            limit: 10,
            totalPages: 1,
            total: 0,
            hasNextPage: false,
            hasPrevPage: false
        };
    }, [data]);

    const { mutateAsync: deleteGroup, isPending } = useDeleteGroup();
    const queryClient = useQueryClient();
    const handleDelete = async (id: string) => {
        await deleteGroup(id).then(() => {
            queryClient.invalidateQueries({ queryKey: ["get-groups"] });
            toast.success("Grup silindi");
        }).catch((err) => {
            toast.error(err.message || "Grup silinemedi");
        });
    }

    const columns = useMemo<ColumnDef<GroupDocumentType>[]>(
        () => {
            if (groups) {
                return [
                    {
                        header: "Grup Adı",
                        accessorKey: "name",
                    },
                    {
                        header: "Grup Açıklaması",
                        accessorKey: "description",
                        cell(props) {
                            return (
                                <p className='text-sm truncate'>{props.row.original.description}</p>
                            )
                        },
                    },
                    {
                        header: "Kullanıcı Sayısı",
                        accessorKey: "members.length",

                    },
                    {
                        header: "Oluşturulma Tarihi",
                        accessorKey: "createdAt",
                        cell(props) {
                            return (
                                <p className='text-sm'>{formatDate(props.row.original.createdAt.toString())}</p>
                            )
                        },
                    },
                    {
                        id: "actions",
                        header: "Aksiyonlar",
                        cell: ({ row }) => (
                            <div className="flex flex-row gap-2">
                                <Button asChild variant="outline" size="icon">
                                    <Link href={`/admin/groups/${row.original.id}`}>
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <DeleteButton
                                    title="Grubu sil"
                                    description="Grubu silmek istediginize emin misiniz?"
                                    onSubmit={() => handleDelete(row.original.id)}
                                    isDeleting={isPending}
                                />
                            </div>
                        ),
                    },
                ]
            }
            return [];
        },
        [isLoading, groups]
    );


    return (
        <Container className='flex flex-col gap-8'>
            <div className="flex flex-row items-start justify-betweenp-4">
                <div className="flex flex-col gap-1">
                    <h1 className='text-2xl font-bold'>Kullanıcı Grupları</h1>
                    <p className='text-muted-foreground text-xs'>
                        Grup listesini,detaylarını buradan görüntüleyebilir ve yönetebilirsiniz
                    </p>
                </div>

                <div className="flex flex-row ms-auto gap-2">
                    {/* <ReadCsvButton target='groups' /> */}
                    <Button asChild>
                        <Link href="/admin/groups/new">
                            <Plus className='mr-2 h-4 w-4' />
                            Grup Ekle
                        </Link>
                    </Button>
                </div>
            </div>

            <Separator />
            <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
                <div className='w-full sm:max-w-sm'>
                    <SearchForm baseUrl="admin/groups" isSearching={isLoading} />
                </div>
                <div className='w-full sm:max-w-sm flex flex-col md:flex-row gap-2 justify-end'>
                    <FilterField name='sort' options={sortOptions} baseUrl="admin/groups" />
                    <Button asChild variant={"secondary"} className='w-full md:w-auto'>
                        <Link href={`/admin/groups`}>Temizle</Link>
                    </Button>
                </div>
            </div>
            {
                groups.length === 0 ? (
                    <div className='flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>Kayıt bulunamadı</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 w-full">
                        <BaseDataTable columns={columns} data={groups}
                            pagination={pagination as PaginationType}
                            withPagination
                            loading={isLoading}
                        />
                    </div>
                )
            }
        </Container>
    )
}

export default GroupsPage