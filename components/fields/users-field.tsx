import React, { useMemo, useState } from 'react'
import MultipleSelector, { Option } from '../ui/multiselect'
import { useGetAllUsers } from '@/hooks/use-users'

interface Props {
  value?: string[]
  onChange?: (value: string[]) => void
}

function UsersField({ value, onChange }: Props) {
  const { data: users, isLoading } = useGetAllUsers()
  const [_, setOptions] = useState<Option[]>([])

  const defaultOptions = useMemo<Option[]>(() => {
    if (!users) return []
    return users.map((user) => ({
      value: user.id,
      label: user.firstName + " " + user.lastName,
    }))
  }, [users])

  const selectedOptions = useMemo<Option[]>(() => {
    if (!users || !value?.length) return []
    return users
      .filter((u) => value.includes(u.id))
      .map((u) => ({ value: u.id, label: u.firstName + " " + u.lastName }))
  }, [users, value])

  // Synchronous search function — filter by LABEL, and return defaultOptions when empty
  const handleSearch = (searchTerm: string): Option[] => {
    if (!users) return []
    if (!searchTerm.trim()) {
      setOptions(defaultOptions)
      return defaultOptions
    }

    const lower = searchTerm.toLowerCase()
    const filtered = defaultOptions.filter((opt) =>
      opt.label.toLowerCase().includes(lower)
    )
    setOptions(filtered)
    return filtered
  }

  if (isLoading) return <p>Loading...</p>

  return (
    <MultipleSelector
      className='h-20'
      defaultOptions={defaultOptions}
      value={selectedOptions}
      onChange={(opts) => onChange?.(opts.map((o) => o.value))}
      onSearchSync={handleSearch}
      placeholder="Kullancılar seçin..."
      emptyIndicator={
        <p className="text-center text-sm text-gray-500">Sonuç bulunamadı</p>
      }
      // IMPORTANT: turn off cmdk’s built-in filtering (we already filter in onSearchSync)
      commandProps={{ shouldFilter: false }}
      // Optional: trigger the first sync search on focus (so options are hydrated)
      triggerSearchOnFocus
    />
  )
}

export default UsersField
