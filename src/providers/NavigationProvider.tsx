/**
 * NavigationProvider — lightweight in-app routing context.
 *
 * Replaces a full router for this SPA. Components read `currentPage`
 * to decide what to render, and call `navigate(page)` to switch views.
 * The Sidebar consumes this context to highlight the active item and
 * drive navigation on click.
 */
import React, { createContext, useContext, useState } from 'react';

export type PageId = 'dashboard' | 'customers' | 'deleted' | 'sales' | 'products' | 'employees';

interface NavigationContextType {
  currentPage: PageId;
  navParams: Record<string, any>;
  navigate: (page: PageId, params?: Record<string, any>) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'dashboard',
  navParams: {},
  navigate: () => {},
});

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [navParams, setNavParams] = useState<Record<string, any>>({});

  const navigate = (page: PageId, params?: Record<string, any>) => {
    setCurrentPage(page);
    setNavParams(params || {});
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navParams, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
