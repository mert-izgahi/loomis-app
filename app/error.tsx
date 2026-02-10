"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // optional if you use shadcn/ui

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bir hata oluştu
        </h2>
        <p className="text-gray-600 mb-6">
          Bir hata oluştu, tekrar dene.
        </p>
        <Button onClick={() => reset()}>
          Tekrar Dene
        </Button>
      </body>
    </html>
  );
}
