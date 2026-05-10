'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Always initialize as 'light' on server to match SSR.
  // The <html> dark class is applied by the inline <script> in layout.tsx <head>
  // BEFORE React hydrates, so the DOM is already correct.
  // We only call setTheme('dark') on the client after hydration to re-render
  // theme-aware icons (Sun/Moon) without causing a hydration mismatch.
  const [theme, setTheme] = useState<Theme>('light');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const stored = localStorage.getItem('theme') as Theme | null;
    const resolved = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sync React state with the resolved theme so child components re-render.
    // Using rAF avoids the synchronous setState during paint warning.
    const id = requestAnimationFrame(() => {
      setTheme(resolved);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
