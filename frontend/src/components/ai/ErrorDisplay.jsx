import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <FaExclamationTriangle style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: '1.5' }}>{error}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#dc2626',
          cursor: 'pointer',
          fontSize: '0.875rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        بستن
      </button>
    </div>
  );
};

export default ErrorDisplay;