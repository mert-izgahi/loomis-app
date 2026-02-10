"use client";
import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { SessionProvider } from "./session-provider";
import { ReactQueryProvider } from "./react-query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </ReactQueryProvider>
    </SessionProvider>
  );
}

export default Providers;
