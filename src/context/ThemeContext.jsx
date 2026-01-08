import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Load from localStorage or system preference
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [primaryHsl, setPrimaryHsl] = useState(() => {
    // Load custom color from localStorage (default fallback)
    return localStorage.getItem("primaryHsl") || "239 68% 55%";
  });

  useEffect(() => {
    // Apply dark mode
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDark);
  }, [isDark]);

  useEffect(() => {
    // Apply custom primary color
    document.documentElement.style.setProperty("--primary", primaryHsl);
    localStorage.setItem("primaryHsl", primaryHsl);
  }, [primaryHsl]);

  return (
    <ThemeContext.Provider
      value={{ isDark, setIsDark, primaryHsl, setPrimaryHsl }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
