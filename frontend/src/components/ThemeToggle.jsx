// src/components/ThemeToggle.jsx
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../theme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: 'var(--bg-tertiary, #f1f5f9)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '30px',
        cursor: 'pointer',
        color: 'var(--text-primary, #1e293b)',
        transition: 'all 0.3s ease',
        fontSize: '0.85rem',
        fontWeight: 500
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />}
      <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
};

export default ThemeToggle;