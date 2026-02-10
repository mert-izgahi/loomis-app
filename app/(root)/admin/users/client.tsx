"use client";

import Container from "@/components/layouts/container";
import SearchForm from "@/components/filters/search-form";
import { BaseDataTable } from "@/components/tables/base-table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useGetAllUsers,
  useGetUsers,
  useUpdateUser,
} from "@/hooks/use-users";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, User as UserIcon, UserCheck, UserStar, UserX, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import FilterField from "@/components/filters/filter-field";
import { activeOptions, roleOptions, sortOptions } from "@/lib/lookup";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { UpdateUserSchemaInput } from "@/lib/zod";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/shared/metric-card";
import { UserWithGroups } from "@/types";
import { Role } from "@/lib/enums";

function UsersPage() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useGetUsers({ query: searchParams.toString() });
  const { data: allUsers, isLoading: allUsersLoading } = useGetAllUsers();

  const users = useMemo(() => {
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
      pageIndex: 1,
      pageSize: 10,
      pageCount: 1,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }, [data]);

  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const queryClient = useQueryClient();

  const handleUpdate = async (id: string, args: UpdateUserSchemaInput) => {
    await updateUser({ id, args })
      .then(() => {
        toast.success("Kullanıcı düzenlendi");
        queryClient.invalidateQueries({ queryKey: ["get-users"] });
      })
      .catch((err) => {
        toast.error(err.message || "Kullanıcı düzenlenemedi");
      });
  };



  const columns: ColumnDef<UserWithGroups>[] = useMemo(() => {
    return [
      {
        accessorKey: "firstName",
        header: "Adı",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "lastName",
        header: "Soyadı",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "isActive",
        header: "Durum",
        cell: (info) => (
          <div className="flex">
            {
              isUpdating ? <Loader2 className="w-4 h-4" /> : <Switch
                checked={info.row.original.isActive}
                disabled={isUpdating}
                onCheckedChange={(value) =>
                  handleUpdate(info.row.original.id as string, {
                    firstName: info.row.original!.firstName,
                    lastName: info.row.original!.lastName,
                    email: info.row.original!.email,
                    role: info.row.original!.role as Role,
                    groupIds: info.row.original!.groups!.map((g) =>
                      g.id
                    ),
                    isActive: value,
                    phone: info.row.original!.phone || undefined,
                  })
                }
              />
            }
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: (info) => {
          const role = roleOptions.find(
            (option) => option.value === info.getValue()
          );
          return role ? role.label : "N/A";
        },
      },
      {
        accessorKey: "phone",
        header: "Telefon",
        cell: (info) => info.getValue() || "N/A",
      },
      {
        accessorKey: "createdAt",
        header: "Oluşturulma Tarihi",
        cell: (info) => formatDate(info.getValue() as string),
      },
      {
        accessorKey: "",
        header: "Aksiyonlar",
        cell: (info) => (
          <div className="flex flex-row gap-2">
            <Button asChild size={"icon"} variant={"outline"}>
              <Link href={`/admin/users/${info.row.original.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ),
      },
    ];
  }, []);



  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-row items-start justify-betweenp-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Kullanıcı Listesi</h1>
          <p className="text-muted-foreground text-xs">
            Tüm kullanıcı listeler
          </p>
        </div>

        <div className="flex flex-row ms-auto">
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Kullanıcı Ekle
            </Link>
          </Button>
        </div>
      </div>
      {allUsersLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <MetricCard
            title="Kullanıcı Sayısı"
            count={allUsers?.length || 0}
            icon={<UserIcon className="w-6 h-6" />}
            className="w-full h-full"
          />

          <MetricCard
            title="Aktif Kullanıcı Sayısı"
            count={allUsers?.filter((user) => user.isActive).length || 0}
            icon={<UserCheck className="w-6 h-6" />}
            className="w-full h-full"
          />

          <MetricCard
            title="Pasif Kullanıcı Sayısı"
            count={allUsers?.filter((user) => !user.isActive).length || 0}
            icon={<UserX className="w-6 h-6" />}
            className="w-full h-full"
          />

          <MetricCard
            title="Toplam Admin Sayısı"
            count={allUsers?.filter((user) => user.role === "Admin").length || 0}
            icon={<UserStar className="w-6 h-6" />}
            className="w-full h-full"
          />
        </div>
      )}
      <Separator />

      <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <SearchForm baseUrl="admin/users" isSearching={isLoading} />
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center flex-1 sm:justify-end gap-2">
          <div className="w-full">
            <FilterField
              baseUrl="admin/users"
              name="role"
              options={roleOptions}
            />
          </div>
          <div className="w-full">
            <FilterField
              baseUrl="admin/users"
              name="isActive"
              options={activeOptions}
            />
          </div>
          <div className="w-full">
            <FilterField
              baseUrl="admin/users"
              name="sort"
              options={sortOptions}
            />
          </div>
          <Button asChild variant={"secondary"} className="w-full md:w-auto">
            <Link href={`/admin/users`}>Temizle</Link>
          </Button>
        </div>
      </div>
      {isLoading && <Skeleton className="w-full h-20" />}
      {users.length === 0 && !isLoading ? (
        <div className="flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center">
          <p className="text-muted-foreground text-sm">Kayıt bulunamadı</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <BaseDataTable
            columns={columns}
            data={users}
            withPagination
            pagination={pagination}
          />
        </div>
      )}
    </Container>
  );
}

export default UsersPage;
