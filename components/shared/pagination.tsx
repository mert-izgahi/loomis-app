"use client";

import {
  Pagination as PaginationSN,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

import { PaginationType } from "@/types";
import { SelectNative } from "../ui/select-native";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";


type Props = {
  pagination: PaginationType;
};

export function Pagination({ pagination }: Props) {
  if (!pagination) {
    return null;
  }
  const searchParams = useSearchParams();
  const router = useRouter();
  const limitOptions = [5, 10, 20, 30, 40, 50];
  const handleLimitChange = (limit: number) => {
    const query = new URLSearchParams(searchParams);
    query.set("limit", limit.toString());
    query.set("page", "1");
    router.push(`?${query.toString()}`);
  };


  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (pagination.pageCount < 5) {
      for (let i = 1; i <= pagination.pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (pagination.pageIndex < 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (pagination.pageIndex > pagination.pageCount - 2) {
        for (let i = pagination.pageCount - 4; i <= pagination.pageCount; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (
          let i = pagination.pageIndex - 1;
          i <= pagination.pageIndex + 1;
          i++
        ) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(pagination.pageCount);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center flex-col md:flex-row gap-4  justify-between w-full">
      <div className="order-1 md:order-none">
        <PaginationSN>
          <PaginationPrevious
            href={
              pagination.hasPrevPage ? `?page=${pagination.pageIndex - 1}&limit=${pagination.pageSize}` : "#"
            }
          >
            <PaginationLink>Previous</PaginationLink>
          </PaginationPrevious>
          <PaginationContent>
            {getPageNumbers().map((page, index) => {
              if (typeof page === "number") {
                return (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href={`?page=${page}&limit=${pagination.pageSize}`}
                      className={cn("rounded", {
                        "bg-brand text-brand-foreground":
                          page === pagination.pageIndex,
                      })}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else {
                return (
                  <PaginationItem key={index}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
            })}
          </PaginationContent>
          <PaginationNext
            href={
              pagination.hasNextPage ? `?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}` : "#"
            }
          >
            <PaginationLink>Next</PaginationLink>
          </PaginationNext>
        </PaginationSN>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm">
          Gösterilen kayıt sayısı:{" "}
          <span className="font-bold">{pagination.total}</span>
        </p>
        <SelectNative
          value={searchParams.get("limit") || "10"}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
          className="w-20"
        >
          {limitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectNative>
      </div>
    </div>
  );
}
