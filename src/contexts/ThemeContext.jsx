import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default to dark theme - apply immediately to prevent flash
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      const shouldBeDark = saved ? saved === 'dark' : true; // Default to dark
      
    // Apply class immediately during initialization
    const root = document.documentElement;
    root.classList.remove('dark'); // Clear first
    root.removeAttribute('data-theme');
    if (shouldBeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
      
      return shouldBeDark;
    } catch (e) {
      // If localStorage fails, default to dark
      document.documentElement.classList.add('dark');
      return true;
    }
  });

  useEffect(() => {
    // Only update if the DOM doesn't match the state (to avoid conflicts with toggleTheme)
    try {
      const root = document.documentElement;
      const hasDarkClass = root.classList.contains('dark');
      
      if (isDark && !hasDarkClass) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else if (!isDark && hasDarkClass) {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.error('Error updating theme:', e);
    }
  }, [isDark]);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentIsDark = root.classList.contains('dark');
    const newIsDark = !currentIsDark;
    
    // Update DOM immediately
    if (newIsDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    
    // Update state
    setIsDark(newIsDark);
    
    // Update localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

