import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('coachlens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('coachlens_theme', 'light');
    }
    setIsDark(newIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl glass flex items-center justify-center text-textSecondary hover:text-accent transition-all duration-300 group"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span className="theme-toggle-icon">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  );
}
