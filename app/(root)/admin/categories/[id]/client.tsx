"use client";

import Container from "@/components/layouts/container";
import { Separator } from "@/components/ui/separator";
import React, { useEffect } from "react";
import { categorySchema, CategorySchemaInput } from "@/lib/zod";
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
import { useGetCategory, useUpdateCategory } from "@/hooks/use-categories";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface EditCategoryPageProps {
  id: string;
}
function EditCategoryPage({ id }: EditCategoryPageProps) {
  const form = useForm<CategorySchemaInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const { data: category, isLoading } = useGetCategory(id);
  const queryClient = useQueryClient();
  const { mutateAsync: updateCategory, isPending } = useUpdateCategory();
  const onSubmit = async (data: CategorySchemaInput) => {
    await updateCategory({ id, args: data })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["get-categories"] });
        toast.success("Kategori düzenlendi");
      })
      .catch((err) => {
        toast.error(err.message || "Kategori düzenlenemedi");
      });
  };

  useEffect(() => {
    if (category) {
      form.setValue("name", category.name);
      form.setValue("description", category.description);
    }
  }, [category]);

  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Kategori Düzenle</h1>
        <p className="text-muted-foreground text-xs">
          Aşağıdaki formu doldurarak yeni kategori düzenleyebilirsiniz.
        </p>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex flex-col gap-4 max-w-xl">
          {new Array(5).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-10" />
          ))}
        </div>
      ) : (
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
                    <FormLabel>
                      Adı <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormDescription>
                      Kategori adı en az 3 karakterden oluşmalıdır.
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
              <Button type="submit" disabled={isPending} variant={"brand"}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Kategori güncelleniyor" : "Kategori güncelle"}
              </Button>
              <Button asChild variant={"outline"}>
                <Link href="/admin/categories">Geri Dön</Link>
              </Button>
            </form>
          </Form>
        </div>
      )}
    </Container>
  );
}

export default EditCategoryPage;
