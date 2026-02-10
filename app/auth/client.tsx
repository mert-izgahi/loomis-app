"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { loginSchema, LoginSchemaInput, ldapLoginSchema, LDAPLoginInput } from "@/lib/zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Role } from "@/models/user.model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LoginType = "email" | "ldap";

function AuthPage() {
  const [loginType, setLoginType] = useState<LoginType>("ldap");
  const { login, loggingIn } = useSession();

  // Email/Password form
  const emailForm = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // LDAP form
  const ldapForm = useForm<LDAPLoginInput>({
    resolver: zodResolver(ldapLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onEmailSubmit = async (data: LoginSchemaInput) => {
    await login(data, "email").then((result) => {
      if (result) {
        setTimeout(() => {
          if (result.role === Role.Admin) {
            window.location.href = "/admin";
          } else if (result.role === Role.User) {
            window.location.href = "/";
          }
        }, 500);
      }
    });
  };

  const onLDAPSubmit = async (data: LDAPLoginInput) => {
    await login(data, "ldap").then((result) => {
      if (result) {
        setTimeout(() => {
          if (result.role === Role.Admin) {
            window.location.href = "/admin";
          } else if (result.role === Role.User) {
            window.location.href = "/";
          }
        }, 500);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-[25rem] bg-white shadow-xl p-4 rounded-[12px] gap-8 flex flex-col border border-border"
    >
      <div className="flex flex-col gap-y-6">
        <div className="w-full flex justify-center bg-primary py-2 rounded-sm mb-3">
          <Image src="/logo.svg" width={100} height={100} alt="logo" />
        </div>
        <p className="text-sm text-center">
          Yönetim, güvence, taşıma, koruma. <br />
          Loomis – önde gelen nakit yönetimi uzmanı.
        </p>
      </div>
      <Form {...ldapForm}>
        <form
          onSubmit={ldapForm.handleSubmit(onLDAPSubmit)}
          className="flex flex-col gap-y-6"
        >
          <FormField
            control={ldapForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kullanıcı Adı</FormLabel>
                <FormControl>
                  <Input
                    className="focus-visible:border-[#000000]"
                    placeholder="Kullanıcı adınızı giriniz (örn: aziz.kaya)"
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={ldapForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    className="focus-visible:border-[#000000]"
                    placeholder="LDAP şifrenizi giriniz"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant={"brand"}
            className="cursor-pointer mt-3"
            disabled={loggingIn}
          >
            {loggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            LDAP ile Giriş Yap
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}

export default AuthPage;