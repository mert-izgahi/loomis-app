"use client";

import { OptionType } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SelectNative } from "../ui/select-native";

interface FilterFieldProps {
  baseUrl: string;
  options: OptionType[];
  placeholder?: string;
  name:
  | "role"
  | "sort"
  | "isActive"
  | "categoryId"
  | "status"
  | "type"
  | "reportId"
  | "selectedYear";
}

function FilterField({
  baseUrl,
  options,
  name,
}: FilterFieldProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortKey = searchParams.get("sortKey");
  const sortOrder = searchParams.get("sortOrder");


  const [currentValue, setCurrentValue] = useState(
    name === "sort" && sortKey && sortOrder
      ? `${sortKey}-${sortOrder}`
      : searchParams.get(name) || "all"
  );

  const handleFilterChange = (option: OptionType) => {
    const params = new URLSearchParams(searchParams);
    if (option.value === "all") {
      params.delete(name);
    } else {
      if (name === "sort") {
        switch (option.value) {
          case "created-asc":
            params.set("sortKey", "createdAt");
            params.set("sortOrder", "asc");
            break;
          case "created-desc":
            params.set("sortKey", "createdAt");
            params.set("sortOrder", "desc");
            break;
          case "name-asc":
            params.set("sortKey", "name");
            params.set("sortOrder", "asc");
            break;
          case "name-desc":
            params.set("sortKey", "name");
            params.set("sortOrder", "desc");
            break;
        }
      } else {
        params.set(name, option.value);
      }

      params.set("page", "1"); // Reset page when filtering
    }

    setCurrentValue(option.value);
    router.push(`/${baseUrl}?${params.toString()}`);
  };

  useEffect(() => {
    setCurrentValue(searchParams.get(name) || "all");
  }, [searchParams, name]);
  useEffect(() => {
    if (name === "sort") {
      if (sortKey && sortOrder) {
        if (sortKey === "createdAt" && sortOrder === "asc") setCurrentValue("created-asc");
        if (sortKey === "createdAt" && sortOrder === "desc") setCurrentValue("created-desc");
        if (sortKey === "name" && sortOrder === "asc") setCurrentValue("name-asc");
        if (sortKey === "name" && sortOrder === "desc") setCurrentValue("name-desc");
      } else {
        setCurrentValue("all");
      }
    } else {
      setCurrentValue(searchParams.get(name) || "all");
    }
  }, [searchParams, name]);
  return (
    <SelectNative
      value={currentValue || "all"}
      className="w-full md:min-w-[120px]"
      onChange={(e) => {
        if (e.target.value === currentValue) return;
        if (e.target.value === "all") {
          router.push(`/${baseUrl}`);
          return;
        }
        const option = options.find((opt) => opt.value === e.target.value);
        if (option) {
          handleFilterChange(option);
        }
      }}
    >
      {/* <option value="all">{placeholder || "Tümü"}</option> */}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectNative>
  );
}

export default FilterField;
