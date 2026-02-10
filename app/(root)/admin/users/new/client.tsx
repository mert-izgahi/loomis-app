"use client";

import Container from '@/components/layouts/container'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { createUserSchema, CreateUserSchemaInput } from '@/lib/zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Role } from '@/lib/enums';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import GroupsField from '@/components/fields/groups-field';
import { useCreateUser } from '@/hooks/use-users';
function NewUserPage() {
  const form = useForm<CreateUserSchemaInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: Role.User,
      isActive: true,
      password: "",
      confirmPassword: "",
      groupIds: []
    }
  });
  const queryClient = useQueryClient();
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const onSubmit = async (data: CreateUserSchemaInput) => {
    await createUser(data).then(() => {
      queryClient.invalidateQueries({ queryKey: ["get-groups"] });
      toast.success("Kullanıcı oluşturuldu");
      form.reset();
    }).catch((err) => {
      toast.error(err.message || "Kullanıcı oluşturulamadı");
    });
  }



  return (
    <Container className='flex flex-col gap-4'>
      <div className="flex flex-col gap-1">
        <h1 className='text-2xl font-bold'>Yeni Kullanıcı Oluştur</h1>
        <p className='text-muted-foreground text-xs'>
          Aşağıdaki formu doldurarak yeni kullancı oluşturabilirsiniz
        </p>
      </div>
      <Separator />

      <div className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-8'>
            <div className="flex flex-col gap-4">
              <h3 className='text-lg font-semibold'>Kullanıcı Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adı <span className='text-red-500'>*</span></FormLabel>
                      <FormDescription>
                        Kullanıcı adı.
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
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyadı <span className='text-red-500'>*</span></FormLabel>
                      <FormDescription>
                        Kullanıcı soyadı
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className='text-red-500'>*</span></FormLabel>
                      <FormDescription>
                        Kullanıcı email adresi
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormDescription>
                        Kullanıcı Telefon Numarası
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className='text-lg font-semibold'>Kullanıcı Şifresi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Sifresi <span className='text-red-500'>*</span></FormLabel>
                      <FormDescription>
                        Şifre en az 6 karakterden olusmalıdır.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type='password' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Kullanıcı Sifresini Onayla
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormDescription>
                        Şifre en az 6 karakterden olusmalıdır. Şifreler aynı olmalıdır.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} type='password' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <div className="flex flex-col gap-4">
              <h3 className='text-lg font-semibold'>Kullanıcı İzinleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Rolu <span className='text-red-500'>*</span></FormLabel>
                      <FormDescription>
                        Hangi rolde kullanıcı olacak
                      </FormDescription>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Role.Admin}>Admin</SelectItem>
                            <SelectItem value={Role.User}>Kullanıcı</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullancı Grupları</FormLabel>
                      <FormDescription>
                        Hangi gruplarda kullanıcı olacak
                      </FormDescription>
                      <FormControl>
                        <GroupsField value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl className='flex items-end'>
                        <FormLabel id='isActive' htmlFor='isActive' className='flex flex-row gap-2'>
                          <Switch checked={field.value} onCheckedChange={field.onChange} id='isActive' />
                          <div className="flex flex-col">
                            <span className='text-xs'>Aktif Mi</span>
                            <span className='text-xs text-muted-foreground'>Eğer kullanıcı aktif değilse, giriş yapamaz.</span>
                          </div>
                        </FormLabel>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>





            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant={"outline"}>
                <Link href="/admin/users">Geri Dön</Link>
              </Button>
              
              <Button type='submit' disabled={isPending} variant={"brand"}>
                {
                  isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                }
                Oluştur
              </Button>
              
            </div>
          </form>
        </Form>
      </div>
    </Container>
  )
}

export default NewUserPage;