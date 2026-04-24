/**
 * NavigationProvider — lightweight in-app routing context.
 *
 * Replaces a full router for this SPA. Components read `currentPage`
 * to decide what to render, and call `navigate(page)` to switch views.
 * The Sidebar consumes this context to highlight the active item and
 * drive navigation on click.
 */
import React, { createContext, useContext, useState } from 'react';

export type PageId = 'dashboard' | 'customers' | 'deleted' | 'sales' | 'products';

interface NavigationContextType {
  currentPage: PageId;
  navigate: (page: PageId) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'dashboard',
  navigate: () => {},
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  return (
    <NavigationContext.Provider value={{ currentPage, navigate: setCurrentPage }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
