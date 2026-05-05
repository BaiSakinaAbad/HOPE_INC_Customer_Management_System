/**
 * NavigationProvider — lightweight in-app routing context.
 *
 * Replaces a full router for this SPA. Components read `currentPage`
 * to decide what to render, and call `navigate(page)` to switch views.
 * The Sidebar consumes this context to highlight the active item and
 * drive navigation on click.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

export type PageId = 'dashboard' | 'customers' | 'deleted' | 'sales' | 'products' | 'employees' | 'logs';
const NAV_STATE_KEY = 'dashboard-nav-state';
const VALID_PAGES: PageId[] = ['dashboard', 'customers', 'deleted', 'sales', 'products', 'employees', 'logs'];

interface NavigationContextType {
  currentPage: PageId;
  navParams: Record<string, any>;
  navigate: (page: PageId, params?: Record<string, any>) => void;
}

interface NavigationProviderProps {
  children: React.ReactNode;
  /** Initial page to land on if no previous nav state exists in sessionStorage. */
  defaultPage?: PageId;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPage: 'dashboard',
  navParams: {},
  navigate: () => {},
});

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children, defaultPage = 'dashboard' }) => {
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    try {
      // If the role requires a specific defaultPage (non-dashboard), always honour it.
      // This prevents a stale 'dashboard' value in sessionStorage from trapping
      // restricted roles (e.g. 'user') on the home screen they cannot access.
      if (defaultPage !== 'dashboard') return defaultPage;
      const raw = window.sessionStorage.getItem(NAV_STATE_KEY);
      if (!raw) return defaultPage;
      const parsed = JSON.parse(raw) as { page?: string };
      if (parsed.page && VALID_PAGES.includes(parsed.page as PageId)) {
        return parsed.page as PageId;
      }
      return defaultPage;
    } catch {
      return defaultPage;
    }
  });
  const [navParams, setNavParams] = useState<Record<string, any>>(() => {
    try {
      const raw = window.sessionStorage.getItem(NAV_STATE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as { params?: Record<string, any> };
      return parsed.params ?? {};
    } catch {
      return {};
    }
  });

  const navigate = (page: PageId, params?: Record<string, any>) => {
    setCurrentPage(page);
    setNavParams(params || {});
  };

  useEffect(() => {
    window.sessionStorage.setItem(
      NAV_STATE_KEY,
      JSON.stringify({ page: currentPage, params: navParams }),
    );
  }, [currentPage, navParams]);

  return (
    <NavigationContext.Provider value={{ currentPage, navParams, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
