import { useGetAllGroups } from '@/hooks/use-groups'
import React, { useMemo, useState } from 'react'
import MultipleSelector, { Option } from '../ui/multiselect'
import { remove as removeDiacritics } from "diacritics";

interface Props {
  value?: string[]
  onChange?: (value: string[]) => void
}

function GroupsField({ value, onChange }: Props) {
  const { data: groups, isLoading } = useGetAllGroups()
  const [_, setOptions] = useState<Option[]>([])
  console.log(value);
  
  const defaultOptions = useMemo<Option[]>(() => {
    if (!groups) return []
    return groups.map((group) => ({
      value: group.id,
      label: group.name,
      // Store normalized name for searching
      searchableField: group.normalizedName || removeDiacritics(group.name.toLowerCase()),
    }))
  }, [groups])

  const selectedOptions = useMemo<Option[]>(() => {
    if (!groups || !value?.length) return []
    return groups
      .filter((g) => value.includes(g.id))
      .map((g) => ({
        value: g.id,
        label: g.name,
        searchableField: g.normalizedName || removeDiacritics(g.name.toLowerCase()),
      }))
  }, [groups, value])

  // Synchronous search function with diacritic removal
  const handleSearch = (searchTerm: string): Option[] => {
    if (!groups) return []
    
    // If search is empty, return all options
    if (!searchTerm.trim()) {
      setOptions(defaultOptions)
      return defaultOptions
    }

    // Normalize the search term
    const normalizedSearch = removeDiacritics(searchTerm.toLowerCase().trim())
    
    // Filter options using normalized search
    const filtered = defaultOptions.filter((opt) => {
      const searchField = opt.searchableField || removeDiacritics(opt.label.toLowerCase())
      return searchField.includes(normalizedSearch)
    })
    
    setOptions(filtered)
    return filtered
  }

  if (isLoading) return <p>Loading...</p>

  return (
    <MultipleSelector
      defaultOptions={defaultOptions}
      value={selectedOptions}
      onChange={(opts) => onChange?.(opts.map((o) => o.value))}
      onSearchSync={handleSearch}
      placeholder="Grup seçin..."
      emptyIndicator={
        <p className="text-center text-sm text-gray-500">Sonuç bulunamadı</p>
      }
      // IMPORTANT: turn off cmdk's built-in filtering (we already filter in onSearchSync)
      commandProps={{ shouldFilter: false }}
      // Optional: trigger the first sync search on focus (so options are hydrated)
      triggerSearchOnFocus
    />
  )
}

export default GroupsField