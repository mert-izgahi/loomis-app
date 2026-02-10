import { useState, useEffect } from 'react';

// Tailwind CSS breakpoints (you can customize these)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface UseScreenSizeReturn {
  width: number;
  height: number;
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
}

export function useScreenSize(): UseScreenSizeReturn {
  const [screenData, setScreenData] = useState<UseScreenSizeReturn>(() => {
    // Default values for SSR
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        screenSize: 'lg' as ScreenSize,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeScreen: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const screenSize = getScreenSize(width);

    return {
      width,
      height,
      screenSize,
      isMobile: screenSize === 'xs' || screenSize === 'sm',
      isTablet: screenSize === 'md',
      isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl',
      isLargeScreen: screenSize === 'xl' || screenSize === '2xl',
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenSize = getScreenSize(width);

      setScreenData({
        width,
        height,
        screenSize,
        isMobile: screenSize === 'xs' || screenSize === 'sm',
        isTablet: screenSize === 'md',
        isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl',
        isLargeScreen: screenSize === 'xl' || screenSize === '2xl',
      });
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenData;
}

function getScreenSize(width: number): ScreenSize {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

// Alternative hook with custom breakpoints
export function useScreenSizeWithBreakpoints(customBreakpoints: Record<string, number>) {
  const [screenData, setScreenData] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        activeBreakpoint: Object.keys(customBreakpoints)[0] || 'default',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const activeBreakpoint = getActiveBreakpoint(width, customBreakpoints);

    return {
      width,
      height,
      activeBreakpoint,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const activeBreakpoint = getActiveBreakpoint(width, customBreakpoints);

      setScreenData({
        width,
        height,
        activeBreakpoint,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [customBreakpoints]);

  return screenData;
}

function getActiveBreakpoint(width: number, breakpoints: Record<string, number>): string {
  const sortedBreakpoints = Object.entries(breakpoints)
    .sort(([, a], [, b]) => b - a);

  for (const [name, minWidth] of sortedBreakpoints) {
    if (width >= minWidth) {
      return name;
    }
  }

  return 'xs';
}

// Simple width-only hook for better performance
export function useScreenWidth(): number {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return 1024;
    return window.innerWidth;
  });

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

// Usage examples:

// Basic usage
// const { width, height, screenSize, isMobile, isDesktop } = useScreenSize();

// Custom breakpoints usage
// const { width, activeBreakpoint } = useScreenSizeWithBreakpoints({
//   mobile: 0,
//   tablet: 768,
//   desktop: 1024,
//   wide: 1440,
// });

// Width only for better performance
// const width = useScreenWidth();