"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { useState, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";

function SearchForm({ baseUrl, isSearching, onFinish }: { baseUrl: string, isSearching: boolean, onFinish?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const handleSubmit = useCallback(
  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new URLSearchParams(searchParams);
    
    let processedSearch = search;
    
    // Replace Turkish characters with their English equivalents
    const turkishChars: { [key: string]: string } = {
      'İ': 'i',
      'I': 'ı',
      'Ş': 'ş',
      'Ç': 'ç',
      'Ğ': 'ğ',
      'Ü': 'ü',
      'Ö': 'ö'
    };
    
    // Replace each Turkish character
    Object.keys(turkishChars).forEach(char => {
      processedSearch = processedSearch.replace(new RegExp(char, 'g'), turkishChars[char]);
    });
    
    // Set the search parameter
    query.set("search", processedSearch);
    
    // IMPORTANT: Reset to page 1 when searching
    query.set("page", "1");
    
    router.push(`/${baseUrl}?${query.toString()}`);
    onFinish && onFinish();
  },
  [search, router, baseUrl, searchParams, onFinish]
);

  const handleClear = useCallback(() => {
    setSearch("");
    const query = new URLSearchParams(searchParams);
    query.delete("search");
    
    // Also reset to page 1 when clearing search
    query.set("page", "1");
    
    router.push(`/${baseUrl}?${query.toString()}`);
  }, [router, baseUrl, searchParams]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2 w-full max-w-sm">
      <Input
        placeholder="Search..."
        value={search}
        onChange={handleChange}
      />
      <Button size={"icon"} type="submit">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>

      {
        search && (
          <Button disabled={isSearching} size={"icon"} variant={"ghost"} onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )
      }
    </form>
  );
}

export default SearchForm;