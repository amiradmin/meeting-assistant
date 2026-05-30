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

  const getInitialDirection = () => {
    const savedDirection = localStorage.getItem("direction");
    if (savedDirection && (savedDirection === "rtl" || savedDirection === "ltr")) {
      return savedDirection;
    }
    return "rtl"; // پیش‌فرض راست به چپ برای فارسی
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [direction, setDirection] = useState(getInitialDirection);

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

  useEffect(() => {
    localStorage.setItem("direction", direction);
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.style.direction = direction;

    // اضافه کردن کلاس RTL یا LTR به body
    if (direction === "rtl") {
      document.body.classList.add("rtl-mode");
      document.body.classList.remove("ltr-mode");
    } else {
      document.body.classList.add("ltr-mode");
      document.body.classList.remove("rtl-mode");
    }
  }, [direction]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const toggleDirection = () => setDirection((prev) => (prev === "rtl" ? "ltr" : "rtl"));

  return (
    <ThemeContext.Provider value={{ theme, direction, toggleTheme, toggleDirection }}>
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