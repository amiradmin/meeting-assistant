// src/components/ThemeToggle.jsx
import React from 'react';
import { FaMoon, FaSun, FaLanguage } from 'react-icons/fa';
import { useTheme } from '../theme';

const ThemeToggle = () => {
  const { theme, direction, toggleTheme, toggleDirection } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <button
        onClick={toggleDirection}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: 'inherit'
        }}
        title={direction === 'rtl' ? 'تغییر به چپ به راست' : 'Switch to RTL'}
      >
        <FaLanguage />
        <span style={{ fontSize: '12px' }}>{direction === 'rtl' ? 'EN' : 'FA'}</span>
      </button>

      <button
        onClick={toggleTheme}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          color: 'inherit'
        }}
        title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
      >
        {theme === 'dark' ? <FaSun /> : <FaMoon />}
      </button>
    </div>
  );
};

export default ThemeToggle;