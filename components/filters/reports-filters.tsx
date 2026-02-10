"use client";
import React, { useMemo } from "react";
import { Badge } from "../ui/badge";
import { useGetAllGroups } from "@/hooks/use-groups";
import { useGetAllCategories } from "@/hooks/use-categories";
import { useSearchParams } from "next/navigation";
import { OptionType } from "@/types";
import { Separator } from "../ui/separator";
import SearchForm from "./search-form";
import FilterField from "./filter-field";
import { Button } from "../ui/button";
import {
  reportStatusOptions,
  reportTypeOptions,
  sortOptions,
} from "@/lib/lookup";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReportsFiltersProps {
  isLoading: boolean;
  baseUrl?: string;
  withStatus?: boolean;
  withCategory?: boolean;
  withSort?: boolean;
  withType?: boolean;
  withGroups?: boolean;
}

function ReportsFilters({
  isLoading,
  baseUrl,
  withStatus,
  withCategory,
  withSort,
  withType,
  withGroups,
}: ReportsFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: groupData } = useGetAllGroups();
  const { data: categories } = useGetAllCategories();

  const groups = useMemo(() => {
    if (groupData) {
      return groupData;
    }
    return [];
  }, [groupData]);

  const handleFilterByGroup = (groupId: string) => {
    const query = new URLSearchParams(searchParams);
    query.set("groupId", groupId);
    query.set("page", "1");
    router.push(`/${baseUrl}?${query.toString()}`);
  };

  const activeGroupId = useMemo(() => {
    return searchParams.get("groupId") || "";
  }, [searchParams]);

  const clearFilters = () => {
    const query = new URLSearchParams(searchParams);
    query.delete("groupId");
    query.set("page", "1");
    // window.location.href = `${baseUrl}?${query.toString()}`
    router.push(`/${baseUrl}?${query.toString()}`);
  };

  const categoriesOptions = useMemo(() => {
    if (categories) {
      const options = [
        { label: "Tümü", value: "" },
      ]
      const cat = categories.map((category) => ({
        label: category.name,
        value: category.id,
      })) as OptionType[];
      return options.concat(cat);
    }
    return [];
  }, [categories]);

  const statusOptions = useMemo(() => {
    return [...reportStatusOptions];
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {withGroups && (
        <>
          <div className="flex flex-row items-center w-full overflow-x-auto">
            <Badge
              onClick={() => clearFilters()}
              variant={activeGroupId === "" ? "default" : "outline"}
              className="flex flex-row items-center gap-2 mr-4 cursor-pointer hover:bg-muted hover:text-foreground"
            >
              Tümü
            </Badge>
            {groups.map((group) => (
              <Badge
                key={group.id}
                onClick={() => handleFilterByGroup(group.id!)}
                variant={activeGroupId === group.id ? "default" : "outline"}
                className="flex flex-row items-center gap-2 mr-4 cursor-pointer hover:bg-muted hover:text-foreground"
              >
                <span>{group.name}</span>
              </Badge>
            ))}
          </div>
          <Separator />
        </>
      )}
      <div className="flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <SearchForm baseUrl={baseUrl!} isSearching={isLoading} />
        </div>
        <div className="w-full flex flex-col justify-end sm:flex-row gap-2">
          {withStatus && (
            <FilterField
              name="status"
              options={statusOptions}
              baseUrl={baseUrl!}
            />
          )}
          {withCategory && (
            <FilterField
              name="categoryId"
              options={categoriesOptions}
              baseUrl={baseUrl!}
            />
          )}
          {withType && (
            <FilterField
              name="type"
              options={reportTypeOptions}
              baseUrl={baseUrl!}
            />
          )}
          {withSort && (
            <FilterField name="sort" options={sortOptions} baseUrl={baseUrl!} />
          )}
          <Button asChild variant={"secondary"}>
            <Link href={`/${baseUrl}`}>Temizle</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReportsFilters;
