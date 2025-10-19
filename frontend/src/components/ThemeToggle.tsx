
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check if theme is already set in localStorage
    const savedTheme = localStorage.getItem('nebulaTheme');
    // If no saved theme, check system preference
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedTheme === 'dark';
  });

  // Apply theme when component mounts and when theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('nebulaTheme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nebulaTheme', 'light');
    }
  }, [isDark]);

  // Apply theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('nebulaTheme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon size={20} className="text-foreground" />
      ) : (
        <Sun size={20} className="text-foreground" />
      )}
    </button>
  );
};

export default ThemeToggle;
