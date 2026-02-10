"use client";

import Container from '@/components/layouts/container'
import { Separator } from '@/components/ui/separator'
import React, { useEffect } from 'react'
import { groupSchema, GroupSchemaInput } from '@/lib/zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetGroup, useUpdateGroup } from '@/hooks/use-groups';
import UsersField from '@/components/fields/users-field';
import { Textarea } from '@/components/ui/textarea';

interface EditGroupPageProps {
  id: string
}
function EditGroupPage({ id }: EditGroupPageProps) {
  const form = useForm<GroupSchemaInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      memberIds: [],
    }
  })
  const { data: group, isLoading } = useGetGroup(id);
  const queryClient = useQueryClient();
  const { mutateAsync: updateGroup, isPending } = useUpdateGroup();
  const onSubmit = async (data: GroupSchemaInput) => {
    await updateGroup({ id, args: data }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["get-groups"] });
      toast.success("Grup düzenlendi");
    }).catch((err) => {
      toast.error(err.message || "Grup düzenlenemedi");
    });
  }

  useEffect(() => {
    if (group) {
      form.setValue("name", group.name);
      form.setValue("description", group.description);
      form.setValue("memberIds", group.members.map(m => m.id));
    }
  }, [group, form]);



  return (
    <Container className='flex flex-col gap-8'>
      <div className="flex flex-col gap-1">
        <h1 className='text-2xl font-bold'>Grup Düzenle</h1>
        <p className='text-muted-foreground text-xs'>
          Aşağıdaki formu doldurarak grupu düzenleyebilirsiniz
        </p>
      </div>

      <Separator />

      {isLoading ? <div className='flex flex-col gap-4 max-w-xl'>
        {
          new Array(5).fill(0).map((_, index) => (
            <Skeleton key={index} className='h-10' />
          ))
        }
      </div> : <div className="max-w-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adı <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Grup adı en az 3 karakterden oluşmalıdır.
                  </FormDescription>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Açıklama <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    Açıklama en az 3 karakterden oluşmalı ve 256 karakteri
                    geçmemelidir ({field.value?.length || 0} / 256 karakter).
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Rapor açıklamasını giriniz"
                      disabled={isPending}
                      rows={4}
                      maxLength={256}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memberIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Üyeler
                  </FormLabel>
                  <FormDescription>
                    Grup üye olacak kisiler
                  </FormDescription>
                  <FormControl>
                    <UsersField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' disabled={isPending} variant={"brand"}>
              {
                isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              }
              {isPending ? "Grup Düzenleniyor..." : "Grup Düzenle"}
            </Button>
            <Button asChild variant={"outline"}>
              <Link href="/admin/groups">Geri Dön</Link>
            </Button>
          </form>
        </Form>
      </div>}

    </Container>
  )
}

export default EditGroupPage