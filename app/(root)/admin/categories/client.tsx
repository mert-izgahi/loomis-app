"use client";

import SearchForm from "@/components/filters/search-form";
import Container from "@/components/layouts/container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaginationType } from "@/types";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useDeleteCategory, useGetCategories } from "@/hooks/use-categories";
import FilterField from "@/components/filters/filter-field";
import { sortOptions } from "@/lib/lookup";
import { BaseDataTable } from "@/components/tables/base-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/buttons/delete-button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Category } from "@/generated/prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

function CategoriesPage() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetCategories({
    query: searchParams.toString(),
  });

  const categories = useMemo(() => {
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
      hasPrevPage: false,
    };
  }, [data]);

  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();
  const queryClient = useQueryClient();
  const handleDelete = async (id: string) => {
    await deleteCategory(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["get-categories"] });
        toast.success("Kategori silindi");
      })
      .catch((err) => {
        toast.error(err.message || "Kategori silinemedi");
      });
  };

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Adı",
        cell: (info) => <p className="text-sm">{info.getValue() as string}</p>,
      },
      {
        accessorKey: "description",
        header: "Açıklama",
        cell: (info) => (
          <p className="text-sm truncate">{info.getValue() as string}</p>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Oluşturulma Tarihi",
        cell: (info) => (
          <p className="text-sm">{formatDate(info.getValue() as string)}</p>
        ),
      },
      {
        id: "actions",
        header: "Aksiyonlar",
        cell: ({ row }) => (
          <div className="flex flex-row gap-2">
            <Button asChild variant="outline" size="icon">
              <Link href={`/admin/categories/${row.original.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <DeleteButton
              title="Kategoriyi Sil"
              description="Kategoriyi silmek istediginize emin misiniz?"
              onSubmit={() => handleDelete(row.original.id)}
              isDeleting={isPending}
            />
          </div>
        ),
      },
    ],
    [data, isPending]
  );

  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-row items-start justify-betweenp-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground text-xs">
            Kategori listesini,detaylarını buradan görüntüleyebilir ve yönetebilirsiniz
          </p>
        </div>

        <div className="flex flex-row ms-auto gap-2">
          {/* <UploadCategoriesFromCSVButton /> */}
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Kategori Ekle
            </Link>
          </Button>
        </div>
      </div>

      <Separator />
      <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <SearchForm baseUrl="admin/categories" isSearching={isLoading} />
        </div>
        <div className="w-full sm:max-w-sm flex flex-col md:flex-row gap-2 justify-end">
          <FilterField
            name="sort"
            options={sortOptions}
            baseUrl="admin/categories"
          />
          <Button asChild variant={"secondary"}>
            <Link href={`/admin/categories`}>Temizle</Link>
          </Button>
        </div>
      </div>
      {isLoading && <Skeleton className="w-full h-20" />}
      {categories.length === 0 && !isLoading ? (
        <div className="flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">Kayıt bulunamadı</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <BaseDataTable
            columns={columns}
            data={categories}
            pagination={pagination as PaginationType}
            withPagination
            loading={isLoading}
          />
        </div>
      )}
    </Container>
  );
}

export default CategoriesPage;
