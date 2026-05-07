import { useState, useEffect } from 'react';

export const BP = { mobile: 640, tablet: 1024 } as const;

export function useWindowWidth(): number {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}