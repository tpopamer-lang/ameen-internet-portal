import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppRoutePath, ROUTE_META, resolveRoutePath } from '../config/routes';

interface RouterContextValue {
  currentPath: AppRoutePath;
  currentSearch: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<AppRoutePath>(() =>
    resolveRoutePath(window.location.pathname)
  );
  const [currentSearch, setCurrentSearch] = useState<string>(() =>
    window.location.search || ''
  );

  const syncMeta = useCallback((path: AppRoutePath) => {
    const meta = ROUTE_META[path];
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.description);
  }, []);

  useEffect(() => {
    const initialResolved = resolveRoutePath(window.location.pathname);
    if (initialResolved !== window.location.pathname && window.location.pathname !== '/') {
      window.history.replaceState({}, '', `${initialResolved}${window.location.search || ''}`);
    }
    syncMeta(initialResolved);
  }, [syncMeta]);

  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveRoutePath(window.location.pathname);
      setCurrentPath(resolved);
      setCurrentSearch(window.location.search || '');
      syncMeta(resolved);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncMeta]);

  const navigate = useCallback(
    (targetPath: string) => {
      const qIdx = targetPath.indexOf('?');
      const rawPathname = qIdx >= 0 ? targetPath.slice(0, qIdx) : targetPath;
      const rawSearch = qIdx >= 0 ? targetPath.slice(qIdx) : '';
      const resolved = resolveRoutePath(rawPathname);
      const nextUrl = `${resolved}${rawSearch}`;
      if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
        window.history.pushState({}, '', nextUrl);
      }
      setCurrentPath(resolved);
      setCurrentSearch(rawSearch);
      syncMeta(resolved);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncMeta]
  );

  return (
    <RouterContext.Provider value={{ currentPath, currentSearch, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used inside RouterProvider');
  }
  return ctx;
}

interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export function AppLink({ to, onClick, children, ...rest }: AppLinkProps) {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
