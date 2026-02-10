"use client";

import Container from '@/components/layouts/container'
import { Separator } from '@/components/ui/separator'
import React, { useEffect, useState } from 'react'
import { updateUserSchema, UpdateUserSchemaInput } from '@/lib/zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Lock, LockOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Role } from '@/lib/enums';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import GroupsField from '@/components/fields/groups-field';
import { useGetUser, useUpdateUser } from '@/hooks/use-users';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


interface pageProps {
  id: string
}

function EditUserPage({ id }: pageProps) {
  const [editPassword, setEditPassword] = useState(false);
  const { data: user, isLoading } = useGetUser(id);

  const form = useForm<UpdateUserSchemaInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: user?.role.toString() || "User",
      isActive: true,
      department: "",
      title: "",
      office: "",
      distinguishedName: "",
      password: "",
      confirmPassword: "",
      groupIds: []
    }
  });
  const queryClient = useQueryClient();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const onSubmit = async (data: UpdateUserSchemaInput) => {
    await updateUser({ id, args: data }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["get-users"] });
      queryClient.invalidateQueries({ queryKey: ["get-user", id] });
      toast.success("Kullanıcı düzenlendi");
    }).catch((err) => {
      toast.error(err.message || "Kullanıcı düzenlenemedi");
    });
  }


  useEffect(() => {
    if (user && !isLoading) {
      console.log('User role from API:', user.role); // Should log "Admin"

      const values = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        isActive: user.isActive,
        groupIds: user.groups.map(g => g.id),
        department: user.department || "",
        title: user.title || "",
        office: user.office || "",
        distinguishedName: user.distinguishedName || "",
        password: "",
        confirmPassword: "",
        role: user.role || "User"
      }

      console.log('Values being reset:', values); // Check if role is in here
      form.reset(values);
    }
  }, [user, isLoading]);


  if (isLoading && !user) {
    return (
      <Container className='flex flex-col gap-8'>
        <div className="flex flex-col gap-1">
          <h1 className='text-2xl font-bold'>
            Kullanıcı Düzenle
          </h1>
          <p className='text-muted-foreground text-xs'>
            Aşağıdaki formu doldurarak kullanıcıyı düzenleyebilirsiniz
          </p>
        </div>
        <Separator />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {
            new Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-32" />
            ))
          }
        </div>
      </Container>
    )
  }


  return (
    <Container className='flex flex-col gap-8'>
      <div className="flex flex-col gap-1">
        <h1 className='text-2xl font-bold'>
          Kullanıcı Düzenle
        </h1>
        <p className='text-muted-foreground text-xs'>
          Aşağıdaki formu doldurarak kullanıcıyı düzenleyebilirsiniz
        </p>
      </div>
      <Separator />
      <div className='w-full'>
        <Form {...form} key={user?.id || "new"}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
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
                        Kullanıcı adı
                      </FormDescription>
                      <FormControl>
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
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
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
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
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
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

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departman</FormLabel>
                      <FormDescription>
                        Kullanıcı Departmanı
                      </FormDescription>
                      <FormControl>
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="office"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ofis</FormLabel>
                      <FormDescription>
                        Kullanıcı Ofisi
                      </FormDescription>
                      <FormControl>
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unvan</FormLabel>
                      <FormDescription>
                        Kullanıcı Unvanı
                      </FormDescription>
                      <FormControl>
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="distinguishedName"
                  render={({ field }) => (
                    <FormItem className="col-span-4">
                      <FormLabel>Distinguished Name</FormLabel>
                      <FormDescription>
                        Kullanıcı Distinguished Name
                      </FormDescription>
                      <FormControl>
                        <Input readOnly className='bg-muted/70 cursor-not-allowed' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <Separator className='my-8' />

            <div className="flex flex-col gap-4">
              <h3 className='text-lg font-semibold'>Kullanıcı İzinleri</h3>
              <div className="flex flex-col gap-4">
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || user?.role} // ✅ controlled, no defaultValue
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={"Admin"}>
                              Admin
                            </SelectItem>
                            <SelectItem value={"User"}>
                              Kullanıcı
                            </SelectItem>
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

            <Separator className='my-8' />
            <Collapsible className='w-full gap-6'>
              <CollapsibleTrigger asChild>
                <Button className='w-full'>
                  <Lock className='w-4 h-4 mr-2' />
                  Sifre Değiştir
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='py-6'>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <h3 className='text-lg font-semibold'>Kullanıcı Şifresi</h3>
                      <p className='text-muted-foreground text-xs'>
                        Kullancının Şifresini Değiştirme Yapmak İstiyorsanız Sifre Değiştirme Butonuna Tıklayın
                      </p>
                    </div>
                    <Button type='button' size={"icon"} onClick={() => setEditPassword(!editPassword)} variant='outline'>
                      {
                        editPassword ? <LockOpen className='w-4 h-4' /> : <Lock className='w-4 h-4' />
                      }
                    </Button>
                  </div>
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
                            <Input {...field} type='password' autoComplete='off' readOnly={!editPassword}
                              className={cn("", {
                                "bg-muted/40 cursor-not-allowed": !editPassword
                              })}
                            />
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
                            <Input {...field} type='password' autoComplete='off' readOnly={!editPassword}
                              className={cn("", {
                                "bg-muted/40 cursor-not-allowed": !editPassword
                              })}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild variant={"outline"}>
                <Link href="/admin/users">Geri Dön</Link>
              </Button>

              <Button type='submit' disabled={isPending} variant={"brand"}>
                {
                  isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                }
                Kayıt et
              </Button>

            </div>
          </form>
        </Form>
      </div>
    </Container>
  )
}

export default EditUserPage;