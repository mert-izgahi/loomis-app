"use client";

import React from "react";
import {
  Sidebar as SidebarSN,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar, SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  Home as HomeIcon,
  Heart as FavoriteIcon,
  CalendarSync as CalendarIcon,
  ChartNoAxesCombined as ReportsListIcon,
  FilePlus2 as AddIcon,
  FolderKanban as CategoryIcon,
  ChartArea,
  Layers as GroupIcon,
  Users,
  Eye,
  ChartBar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SidebarItem({ href, icon: Icon, name, active, ...props }: any) {
  const { open, isMobile } = useSidebar();

  if (!isMobile && !open) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            className={cn(
              active && "bg-brand text-brand-foreground h-10",
              "h-10 hover:bg-brand hover:text-brand-foreground"
            )}
          >
            <Link href={href} {...props}>
              <Icon />
              {isMobile ? (
                <span>{name}</span>
              ) : !open ? (
                <span>{name}</span>
              ) : null}
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right">
          <span>{name}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <SidebarMenuButton
      asChild
      className={cn(
        active && "bg-brand text-brand-foreground h-10",
        "h-10 hover:bg-brand hover:text-brand-foreground"
      )}
    >
      <Link href={href} {...props}>
        <Icon />
        <span>{name}</span>
      </Link>
    </SidebarMenuButton>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useSession();
  const { open, isMobile } = useSidebar();
  const userLinks = [
    { name: "Ana Sayfa", href: "/", icon: HomeIcon, active: pathname === "/" },
    {
      name: "Favoriler Listesi",
      href: "/favorites",
      icon: FavoriteIcon,
      active: pathname === "/favorites",
    },
    {
      name: "Raporlar Listesi",
      href: "/reports",
      icon: ReportsListIcon,
      active: pathname === "/reports",
    },

    {
      name: "Sık Kullanılan Raporlar",
      href: "/trending",
      icon: CalendarIcon,
      active: pathname === "/trending",
    },
  ];

  const adminLinks = [
    {
      name: "Ana Sayfa",
      href: "/",
      icon: HomeIcon,
      active: pathname === "/admin",
    },

    {
      name: "Yeni Rapor Oluştur",
      href: "/admin/reports/new",
      icon: AddIcon,
      active: pathname === "/add-report",
    },
    {
      name: "Tüm Raporlar",
      href: "/admin/reports",
      icon: ReportsListIcon,
      active: pathname === "/admin/reports",
    },
    {
      name: "Sık Kullanılan Raporlar",
      href: "/admin/trending",
      icon: CalendarIcon,
      active: pathname === "/admin/trending",
    },
    {
      name: "Kategoriler Listesi",
      href: "/admin/categories",
      icon: CategoryIcon,
      active: pathname === "/admin/categories",
    },
    {
      name: "Kullanıcılar",
      href: "/admin/users",
      icon: Users,
      active: pathname === "/admin/users",
    },
    {
      name: "Gruplar",
      href: "/admin/groups",
      icon: GroupIcon,
      active: pathname === "/admin/groups",
    },
    {
      name: "Görüntüleme",
      href: "/admin/views",
      icon: Eye,
      active: pathname === "/admin/views",
    },
    // {
    //   name: "Analitik",
    //   href: "/admin/analytics",
    //   icon: ChartBar,
    //   active: pathname === "/admin/analytics",
    // },
    {
      name: "Charts Örnekleri",
      href: "/admin/charts",
      icon: ChartArea,
      active: pathname === "/admin/charts",
    },

  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarSN className="border-r-0!" collapsible="icon">
      <SidebarHeader
        className="h-16 bg-dark shrink-0 flex flex-row items-center border-b border-neutral-800 justify-between">
        <Link href="/" className="flex">
          <Image className="!w-8 !h-8" src="/logoMini.svg" width={80} height={40} alt="logo" />
          {open && (
            <Image className="!w-auto !h-8" src="/logoText.svg" width={80} height={40} alt="logoText" />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="text-dark-foreground h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#1a1818] mb-3  justify-between items-center hidden md:flex">
            Menü {open && (<SidebarTrigger />)}
          </SidebarGroupLabel>
          {!open && !isMobile && (
            <div className="flex text-[#1a1818] mb-3 justify-center items-center w-full ml-0.5">
              <SidebarTrigger />
            </div>
          )}
          <SidebarGroupContent >
            <SidebarMenu className={
              cn(
                "flex flex-col",
                {
                  "justify-start items-start":open,
                  "justify-center items-center":!open,
                }
              )
            }>
              {isAdmin ? (
                <>
                  {adminLinks.map((link, index) => (
                    <SidebarMenuItem key={index} className="text-[#1a1818] w-full" >
                      <SidebarItem {...link} />
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                <>
                  {userLinks.map((link, index) => (
                    <SidebarMenuItem key={index} className="text-[#1a1818] w-full">
                      <SidebarItem {...link} />
                    </SidebarMenuItem>
                  ))}

                  <SidebarMenuItem className="text-[#1a1818]">
                    <SidebarItem
                      name="Yeni Rapor Talebi"
                      href="https://portal.loomis.com.tr/SupportCenter/Index"
                      target="_blank"
                      icon={AddIcon}
                    />
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {open && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent
              className="bg-neutral-800 hover:bg-brand hover:text-brand-foreground transition-colors duration-300 px-2 py-4 rounded-lg flex flex-col gap-2 group">
              <h1 className="text-md font-bold">Loomis Raporlar</h1>
              <p className="text-xs text-white group:hover:text-white">
                Raporlar oluşturun, kategorileri yönetin. <br />
                favori raporlarınızı belirleyin ve sık kullandığınız raporları
                kolayca takip edin.
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      {open && (
        <SidebarFooter
          className="h-16 bg-dark text-dark-foreground border-t border-neutral-800  flex flex-row items-center">
          <p className="text-xs">
            © {new Date().getFullYear()} Loomis Reports Dashboard
          </p>
        </SidebarFooter>
      )}
    </SidebarSN>
  );
}

export default Sidebar;
