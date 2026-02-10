"use client";

import Container from "@/components/layouts/container";
import { Separator } from "@/components/ui/separator";
import React, { useEffect } from "react";
import { reportSchema, ReportSchemaInput } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReportStatus, ReportType } from "@/lib/enums";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useGetReport, useUpdateReport } from "@/hooks/use-reports";
import { reportStatusOptions } from "@/lib/lookup";
import GroupsField from "@/components/fields/groups-field";
import CategoryField from "@/components/fields/category-field";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  id: string;
}

function EditReportPage({ id }: Props) {
  const { data: report, isLoading } = useGetReport({ id });
  const form = useForm<ReportSchemaInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: "",
      description: "",
      groupIds: [],
      status: "Draft",
      categoryId: "",
      type: "Internal",
      link: "",
    },
  });
  const statusOptions = reportStatusOptions.filter(option => option.value !== "all");

  const queryClient = useQueryClient();

  const { mutateAsync: updateReport, isPending } = useUpdateReport();
  const onSubmit = async (data: ReportSchemaInput) => {
    await updateReport({ id, args: data })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["get-reports"] });
        queryClient.invalidateQueries({ queryKey: ["get-report", id] });
        toast.success("Rapor başarıyla güncellendi");
      })
      .catch((err) => {
        toast.error(err.message || "Rapor güncellenemedi");
      });
  };

  useEffect(() => {
    if (report && !isLoading) {
      const values = {
        name: report.name,
        description: report.description,
        groupIds: report.groups?.map((g) => g.id) || [],
        link: report.link || "",
        type: report.type as ReportType,
        status: report.status as ReportStatus, // "Published"
        categoryId: report.categoryId || "",
      };
      form.reset(values);
    }
  }, [report, isLoading]);


  // Render loading state
  if (isLoading || !report) {
    return (
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Rapor Bilgileri Düzenle</h1>
          <p className="text-muted-foreground text-sm">
            Rapor bilgilerini düzenleyebilirsiniz
          </p>
        </div>
        <Separator />
        <div className="max-w-xl">
          <div className="flex flex-col gap-6">
            {new Array(8).fill(0).map((_, index) => {
              return <Skeleton key={index} className="h-10 w-full" />;
            })}
          </div>
        </div>
      </Container>
    );
  }


  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Rapor Bilgileri Düzenle</h1>
        <p className="text-muted-foreground text-sm">
          Rapor bilgilerini düzenleyebilirsiniz
        </p>
      </div>
      <Separator />
      <div className="max-w-xl">
        {isLoading ? (
          <div className="flex flex-col gap-6">
            {new Array(3).fill(0).map((_, index) => {
              return <Skeleton key={index} className="h-4" />;
            })}
          </div>
        ) : (
          <Form {...form} key={report?.id || "new"}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >

              {/* Increased gap */}
              {/* Type Field */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rapor Türü *</FormLabel>
                    <FormDescription>
                      Raporunuzu hangi türden oluşturmak istiyorsunuz?(Internal,
                      External)
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="w-full "
                      >
                        <div className="flex items-center space-x-2 h-10">
                          <label
                            htmlFor="internal"
                            className={cn(
                              "flex items-center justify-between h-full space-x-2 flex-1 border border-border p-2 rounded cursor-pointer",
                              {
                                "bg-muted": field.value === "Internal",
                              }
                            )}
                          >
                            <RadioGroupItem
                              value="Internal"
                              id="internal"
                              hidden
                            />
                            <span
                              className={cn("text-sm font-medium", {
                                "font-bold": field.value === "Internal",
                              })}
                            >
                              Internal
                            </span>

                            {field.value === "Internal" && (
                              <div className="w-5 h-5 bg-brand flex items-center justify-center rounded-full">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </label>

                          <label
                            htmlFor="external"
                            className={cn(
                              "flex items-center h-full justify-between space-x-2 flex-1 border border-border p-2 rounded-md cursor-pointer",
                              {
                                "bg-muted": field.value === "External",
                              }
                            )}
                          >
                            <RadioGroupItem
                              value="External"
                              id="external"
                              hidden
                            />
                            <span
                              className={cn("text-sm font-medium", {
                                "font-bold": field.value === "External",
                              })}
                            >
                              External
                            </span>

                            {field.value === "External" && (
                              <div className="w-5 h-5 bg-brand flex items-center justify-center rounded-full">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rapor Adı *</FormLabel>
                    <FormDescription>
                      Rapor adı en az 3 karakterden oluşmalıdır
                    </FormDescription>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Rapor adını giriniz"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Link Field */}
              {form.watch("type") === "External" && (
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rapor Linki *</FormLabel>
                      <FormDescription>
                        Rapor linki alana giriniz
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Rapor linki giriniz"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama *</FormLabel>
                    <FormDescription>
                      Rapor açıklaması en az 3 karakterden oluşmalı ve 256
                      karakteri geçmemelidir ({field.value?.length || 0} / 256
                      karakter)
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
              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rapor Durumu *</FormLabel>
                    <FormDescription>Raporun durumunu seçiniz</FormDescription>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || report.status} // ✅ controlled, no defaultValue
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Rapor Durumu" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-row items-center gap-2">
                                <div
                                  className={cn("w-4 h-4 rounded", {
                                    "bg-chart-1": option.value === "Pending",
                                    "bg-chart-3": option.value === "Draft",
                                    "bg-chart-2": option.value === "Published",
                                  })}
                                />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Field */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rapor Kategorisi *</FormLabel>
                    <FormDescription>
                      Raporun kategorisini seçiniz
                    </FormDescription>
                    <FormControl>
                      <CategoryField
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Groups Field */}
              <FormField
                control={form.control}
                name="groupIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gruplar</FormLabel>
                    <FormDescription>
                      Raporun görüntüleneceği grupları seçiniz
                    </FormDescription>
                    <FormControl>
                      <GroupsField
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  variant={"brand"}
                  className="w-full"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Rapor Güncelleniyor..." : "Rapor Güncelle"}
                </Button>
                <Button asChild variant={"outline"}>
                  <Link href="/admin/reports">Geri Dön</Link>
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </Container>
  );
}

export default EditReportPage;
