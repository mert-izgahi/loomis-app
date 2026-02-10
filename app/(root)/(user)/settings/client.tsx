"use client"
import Container from '@/components/layouts/container'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { useGetProfile, useUpdateProfile } from '@/hooks/use-profile'
import { UpdateProfileSchemaInput, updateProfileSchema } from '@/lib/zod'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
function ProfileSettingsPage() {
    const { data, isLoading } = useGetProfile()
    const profileForm = useForm<UpdateProfileSchemaInput>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: ""
        }
    });
    const queryClient = useQueryClient();
    const { mutateAsync: updateProfile, isPending } = useUpdateProfile();


    const onSubmit = async (data: UpdateProfileSchemaInput) => {
        await updateProfile(data).then(() => {
            queryClient.invalidateQueries({ queryKey: ["get-profile"] });
            toast.success("Profiliniz güncellendi");
            profileForm.reset();
        }).catch((err) => {
            toast.error(err.message || "Profiliniz güncellenemedi");
        });
    }

    useEffect(() => {
        if (data) {
            profileForm.setValue("firstName", data.firstName);
            profileForm.setValue("lastName", data.lastName);
            profileForm.setValue("email", data.email);
            profileForm.setValue("phone", data.phone || "");
        }
    }, [data, profileForm])
    return (
        <Container className='flex flex-col gap-8'>
            <div className="flex flex-col gap-1">
                <h1 className='text-2xl font-bold'>
                    Kullanıcı Bilgileri
                </h1>
                <p className='text-muted-foreground text-xs'>
                    Kullanıcı bilgilerini düzenleyebilirsin
                </p>
            </div>
            <Separator />

            <div className="max-w-xl flex flex-col gap-8">
                {
                    isLoading ? <div className="flex flex-col gap-4">
                        {
                            new Array(3).fill(0).map((_, index) => (
                                <Skeleton key={index} className='h-10 w-full' />
                            ))
                        }
                    </div> : <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onSubmit)} className='flex flex-col gap-8'>
                            <div className="flex flex-col gap-4">
                                <h3 className='text-lg font-semibold'>Kullanıcı Bilgileri</h3>
                                <div className="flex flex-col gap-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Adı <span className='text-red-500'>*</span></FormLabel>
                                                <FormDescription>
                                                    Kullanıcı adı
                                                </FormDescription>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={profileForm.control}
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
                                        control={profileForm.control}
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
                                        control={profileForm.control}
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
                                <Button type='submit' disabled={isPending} variant={"brand"}>
                                    {
                                        isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    }
                                    Kaydet
                                </Button>
                            </div>
                        </form>
                    </Form>
                }


                {/* <Separator /> */}

                {/* <div className="flex flex-col gap-1">
                    <h1 className='text-2xl font-bold'>
                        Şifre Değiştirme
                    </h1>
                    <p className='text-muted-foreground text-xs'>
                        Şifreni değiştirme
                    </p>
                </div> */}
                {/* <Separator /> */}

                {/* <div className="max-w-xl flex flex-col gap-8">
                    {
                        isLoading ? <div className="flex flex-col gap-4">
                            {
                                new Array(3).fill(0).map((_, index) => (
                                    <Skeleton key={index} className='h-10 w-full' />
                                ))
                            }
                        </div> : <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='flex flex-col gap-8'>
                                <div className="flex flex-col gap-4">
                                    <h3 className='text-lg font-semibold'>Şifre Değiştirme</h3>
                                    <div className="flex flex-col gap-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="oldPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Eski Şifre <span className='text-red-500'>*</span></FormLabel>
                                                    <FormDescription>
                                                        Eski Şifreni giriniz
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input {...field} type='password' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Yeni Şifre <span className='text-red-500'>*</span></FormLabel>
                                                    <FormDescription>
                                                        Yeni Şifreni giriniz
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input {...field} type='password' />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={passwordForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Yeni Şifre Tekrar <span className='text-red-500'>*</span></FormLabel>
                                                    <FormDescription>
                                                        Yeni Şifreni tekrar giriniz
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
                                    <Button type='submit' disabled={isPendingPassword || loggingOut}>
                                        {
                                            (isPendingPassword || loggingOut) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        }
                                        Şifre Değiştir
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    }

                    <Button asChild variant={"outline"}>
                        <Link href="/">Geri Dön</Link>
                    </Button>
                </div> */}
            </div>
        </Container>
    )
}

export default ProfileSettingsPage