"use client";

import Container from "@/components/layouts/container";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { groupSchema, GroupSchemaInput } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCreateGroup } from "@/hooks/use-groups";
import UsersField from "@/components/fields/users-field";
import { Textarea } from "@/components/ui/textarea";


function NewGroupPage() {
  const form = useForm<GroupSchemaInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      memberIds: [],
    },
  });
  const queryClient = useQueryClient();
  const { mutateAsync: createGroup, isPending } = useCreateGroup();
  const onSubmit = async (data: GroupSchemaInput) => {
    await createGroup(data)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["get-groups"] });
        toast.success("Grup Oluşturuldu");
        form.reset();
      })
      .catch((err) => {
        toast.error(err.message || "Grupu oluşturulamadı");
      });
  };
  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Yeni Grup OLuştur</h1>
        <p className="text-muted-foreground text-xs">
          Aşağıdaki formu doldurarak yeni grupu oluşturabilirsiniz.
        </p>
      </div>
      <Separator />

      <div className="max-w-xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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
                  <FormLabel>Üyeler</FormLabel>
                  <FormDescription>Grup üye olacak kisiler</FormDescription>
                  <FormControl>
                    <UsersField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} variant={"brand"}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Grup oluşturuluyor" : "Grup Oluştur"}
            </Button>
            <Button asChild variant={"outline"}>
              <Link href="/admin/groups">Geri Dön</Link>
            </Button>
          </form>
        </Form>
      </div>
    </Container>
  );
}

export default NewGroupPage;
