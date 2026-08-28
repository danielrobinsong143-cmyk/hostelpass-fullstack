import { useEffect, useState } from "react";
import { ThemeContext } from "./themeContextDefinition";

const THEME_STORAGE_KEY = "theme";

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  // No saved preference — fall back to the user's OS-level preference.
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  ).matches;

  return prefersDark ? "dark" : "light";
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
