import React, { useMemo } from "react";
import { Option } from "../ui/multiselect";
import { useGetAllCategories } from "@/hooks/use-categories";
import SearchableSelect from "../shared/searchable-select-field";
import { Skeleton } from "../ui/skeleton";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

function CategoryField({ value, onChange }: Props) {
  const { data: categories, isLoading } = useGetAllCategories();

  const defaultOptions = useMemo<Option[]>(() => {
    if (!categories) return [];
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
      // Make sure normalizedName is already normalized in the database
      searchableField: category.normalizedName,
    }));
  }, [categories]);

  if (isLoading) return <Skeleton className="h-10 max-w-xs w-full" />;

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={defaultOptions}
      placeholder="Select a category"
    />
  );
}

export default CategoryField;