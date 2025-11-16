import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-slate-800 text-yellow-500 dark:text-yellow-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-300 dark:border-slate-700"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // Moon icon for dark mode (click to switch to light)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for light mode (click to switch to dark)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;

