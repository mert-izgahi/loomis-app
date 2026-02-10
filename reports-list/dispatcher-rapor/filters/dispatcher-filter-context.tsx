"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface FilterContextType {
  selectedSube: string | null;
  setSelectedSube: (sube: string | null) => void;
  selectedArac: string | null;
  setSelectedArac: (arac: string | null) => void;
  selectedHizmetTuru: string | null;
  setSelectedHizmetTuru: (hizmetTuru: string | null) => void;
  clearFilters: () => void;
  lockedSube: string | null; // Locked sube for non-admin users
  isSubeLocked: boolean; // Whether the sube filter is locked
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  userSube?: string | null; // User's assigned branch
  isLocked?: boolean; // Whether filters should be locked
}

export function FilterProvider({ children, userSube = null, isLocked = false }: FilterProviderProps) {
  const [selectedSube, setSelectedSube] = useState<string | null>(null);
  const [selectedArac, setSelectedArac] = useState<string | null>(null);
  const [selectedHizmetTuru, setSelectedHizmetTuru] = useState<string | null>(null);

  // Auto-set the locked sube when component mounts or userSube changes
  useEffect(() => {
    if (isLocked && userSube) {
      setSelectedSube(userSube);
    }
  }, [isLocked, userSube]);

  const clearFilters = () => {
    // For locked users, keep the locked sube and only clear other filters
    if (isLocked && userSube) {
      setSelectedSube(userSube);
      setSelectedArac(null);
      setSelectedHizmetTuru(null);
    } else {
      setSelectedSube(null);
      setSelectedArac(null);
      setSelectedHizmetTuru(null);
    }
  };

  // Override setSelectedSube for locked users
  const handleSetSelectedSube = (sube: string | null) => {
    if (isLocked && userSube) {
      // Don't allow changing sube for locked users
      return;
    }
    setSelectedSube(sube);
  };

  return (
    <FilterContext.Provider
      value={{
        selectedSube,
        setSelectedSube: handleSetSelectedSube,
        selectedArac,
        setSelectedArac,
        selectedHizmetTuru,
        setSelectedHizmetTuru,
        clearFilters,
        lockedSube: isLocked ? userSube : null,
        isSubeLocked: isLocked && !!userSube,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}