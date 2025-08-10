'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('whatsapp-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Listen for storage changes to sync theme across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'whatsapp-theme' && e.newValue) {
        setTheme(e.newValue as Theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update document theme attribute when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme; // Also add as class for broader compatibility
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('whatsapp-theme', newTheme);
    
    // Trigger storage event for same-tab updates (since storage event doesn't fire on same window)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'whatsapp-theme',
      newValue: newTheme,
      oldValue: theme,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
