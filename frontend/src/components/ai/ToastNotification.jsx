import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaSync, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 1000,
      maxWidth: '400px',
      width: '90%',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white'
        };
      case 'error':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white'
        };
      case 'warning':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white'
        };
      case 'info':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white'
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ fontSize: '1.25rem', flexShrink: 0 }} />;
      case 'error':
        return <FaExclamationTriangle style={{ fontSize: '1.25rem', flexShrink: 0 }} />;
      case 'warning':
        return <FaExclamationTriangle style={{ fontSize: '1.25rem', flexShrink: 0 }} />;
      case 'info':
        return <FaSync style={{ fontSize: '1.25rem', flexShrink: 0 }} />;
      default:
        return <FaCheckCircle style={{ fontSize: '1.25rem', flexShrink: 0 }} />;
    }
  };

  return (
    <div style={getToastStyles()}>
      {getIcon()}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.4' }}>
          {message}
        </div>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '4px',
          opacity: 0.8,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
      >
        <FaTimes style={{ fontSize: '0.875rem' }} />
      </button>
    </div>
  );
};

export const ToastNotification = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};