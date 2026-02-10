"use client";
import UserButton from "@/components/buttons/user-button";
import { useSession } from "@/providers/session-provider";
import React from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

function Header() {
  const { user:currentUser, fetchingUser } = useSession();
  const { isMobile } = useSidebar();

  // Don't render header if still fetching and no user data
  if (fetchingUser && !currentUser) {
    return (
      <div className="flex justify-between bg-neutral-900 h-16 pr-4 md:pr-8 pl-5 md:pl-8 items-center">
        <div className="w-8 h-8 bg-gray-600 animate-pulse rounded"></div>
        <div className="w-20 h-6 bg-gray-600 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 z-20 flex justify-between bg-neutral-900 h-16 pr-4 md:pr-8 pl-5 md:pl-8 items-center`}>
      {/* <Link href="/" className="flex">
        <Image className="!w-8 !h-8" src="/logoMini.svg" width={80} height={40} alt="logo" />
        {open && (
          <Image className="!w-auto !h-8" src="/logoText.svg" width={80} height={40} alt="logoText" />
        )}
      </Link> */}
      <div className="w-full flex items-center justify-end gap-x-3">
        {
          isMobile && <Button asChild variant={"secondary"} size={"icon"} className="md:hidden flex items-center justify-center">
            <SidebarTrigger />
          </Button>
        }
        <div className="flex flex-row">
          <h1 className="hidden md:block font-medium text-sm text-white">Hoşgeldiniz {currentUser?.firstName || ''} {currentUser?.lastName || ''}</h1>
        </div>
        {currentUser && <UserButton />}
      </div>
    </div>
  );
}

export default Header;
