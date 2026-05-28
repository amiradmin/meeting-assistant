// src/theme.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    } else {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a CustomThemeProvider");
  }
  return context;
};