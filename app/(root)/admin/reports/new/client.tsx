"use client";

import Container from "@/components/layouts/container";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { reportSchema, ReportSchemaInput } from "@/lib/zod";
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
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReport } from "@/hooks/use-reports";
import GroupsField from "@/components/fields/groups-field";
import CategoryField from "@/components/fields/category-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

function NewReportPage() {
  const form = useForm<ReportSchemaInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: "",
      description: "",
      groupIds: [],
      // roles: [],
      categoryId: "",
      type: "Internal",
      link: "",
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: createReport, isPending } = useCreateReport();
  const onSubmit = async (data: ReportSchemaInput) => {
    await createReport(data)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["get-reports"] });
        toast.success("Rapor başarıyla oluşturuldu");
        form.reset();
      })
      .catch((err) => {
        toast.error(err.message || "Rapor oluşturulamadı");
      });
  };

  return (
    <Container className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Yeni Rapor Oluştur</h1>
        <p className="text-muted-foreground text-sm">
          Rapor oluşturulabilmesi için Rapor Servisleri’nin eksiksiz olarak
          tamamlanmış olması gerekmektedir.
        </p>
      </div>
      <Separator />

      <div className="max-w-xl">
        <Form {...form}>
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
                  <FormLabel>Rapor Adı <span className='text-red-500'>*</span></FormLabel>
                  <FormDescription>
                    Rapor adı en az 3 karakterden oluşmalıdır.
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
                    <FormLabel>Rapor Linki <span className='text-red-500'>*</span></FormLabel>
                    <FormDescription>Rapor linki alana giriniz.</FormDescription>
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
                  <FormLabel>Açıklama <span className='text-red-500'>*</span></FormLabel>
                  <FormDescription>
                    Açıklama en az 3 karakterden oluşmalı ve 256
                    karakteri geçmemelidir ({field.value?.length || 0} / 256
                    karakter).
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
            {/* Category Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rapor Kategorisi *</FormLabel>
                  <FormDescription>
                    Raporun kategorisini seçiniz.
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
                    Raporun görüntüleneceği grupları seçiniz.
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
            {/* Roles Field */}
            {/* <FormField
              control={form.control}
              name="roles"
              render={({ field }) => {
                const currentRoles = field.value || [];
                const allSelected = areAllRolesSelected(currentRoles as Role[]);

                return (
                  <FormItem>
                    <FormLabel>Roller ve Yetkiler</FormLabel>
                    <FormDescription>
                      Raporun görüntüleneceği kullanıcı rollerini seçiniz
                    </FormDescription>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {roleOptions.map((role) => (
                          <div
                            key={role.value}
                            className="flex items-center gap-3"
                          >
                            <Checkbox
                              checked={
                                role.value === "all"
                                  ? allSelected
                                  : currentRoles.includes(role.value as Role)
                              }
                              onCheckedChange={() => {
                                handleRoleChange(
                                  role.value,
                                  currentRoles as Role[],
                                  field.onChange
                                );
                              }}
                              disabled={isPending}
                              id={`role-${role.value}`}
                            />
                            <label
                              htmlFor={`role-${role.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {role.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            /> */}
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={isPending}
                variant={"brand"}
                className="w-full"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Oluşturuluyor..." : "Rapor Oluştur"}
              </Button>
              <Button asChild variant={"outline"}>
                <Link href="/reports">Geri Dön</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Container>
  );
}

export default NewReportPage;
