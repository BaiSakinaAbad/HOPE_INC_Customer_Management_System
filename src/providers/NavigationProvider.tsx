/**
 * NavigationProvider — lightweight in-app routing context.
 *
 * Replaces a full router for this SPA. Components read `currentPage`
 * to decide what to render, and call `navigate(page)` to switch views.
 * The Sidebar consumes this context to highlight the active item and
 * drive navigation on click.
 */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

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
      const raw = window.sessionStorage.getItem(NAV_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { page?: string };
        if (parsed.page && VALID_PAGES.includes(parsed.page as PageId)) {
          const storedPage = parsed.page as PageId;
          // Security check: if stored is 'dashboard' but role default is not dashboard, deny access.
          if (storedPage === 'dashboard' && defaultPage !== 'dashboard') {
            return defaultPage;
          }
          return storedPage;
        }
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

  // Track previous defaultPage to detect actual role changes vs URL changes
  const prevDefaultPageRef = useRef(defaultPage);

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

  // Dynamic role change check: only kick from dashboard if the role actually changed
  // (detected by defaultPage changing FROM 'dashboard' TO something else),
  // NOT when navigating between other pages
  useEffect(() => {
    if (
      currentPage === 'dashboard' &&
      defaultPage !== 'dashboard' &&
      prevDefaultPageRef.current === 'dashboard'
    ) {
      // Role changed: user no longer has dashboard access
      setCurrentPage(defaultPage);
    }
    prevDefaultPageRef.current = defaultPage;
  }, [defaultPage, currentPage]);

  return (
    <NavigationContext.Provider value={{ currentPage, navParams, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
