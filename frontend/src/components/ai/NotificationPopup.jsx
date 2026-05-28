// components/NotificationPopup.jsx
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from 'react-icons/fa';

const NOTIFICATION_STYLES = {
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    textColor: '#065f46',
    iconColor: '#10b981',
    progressColor: '#10b981',
    titleColor: '#064e3b'
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    textColor: '#991b1b',
    iconColor: '#ef4444',
    progressColor: '#ef4444',
    titleColor: '#7f1d1d'
  },
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    iconColor: '#3b82f6',
    progressColor: '#3b82f6',
    titleColor: '#1e3a8a'
  },
  default: {
    backgroundColor: '#f9fafb',
    borderColor: '#6b7280',
    textColor: '#374151',
    iconColor: '#6b7280',
    progressColor: '#6b7280',
    titleColor: '#111827'
  }
};

const ICONS = {
  success: <FaCheckCircle size={20} />,
  error: <FaExclamationCircle size={20} />,
  info: <FaInfoCircle size={20} />,
  default: <FaInfoCircle size={20} />,
};

const NotificationPopup = ({
  show,
  onClose,
  type = 'info',
  title,
  message,
  duration = 4000,
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const styles = useMemo(() => NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.default, [type]);
  const icon = useMemo(() => ICONS[type] || ICONS.default, [type]);

  if (!show) return null;

  return (
    <>
      <div className="notification-wrapper">
        <div
          className="notification-container"
          style={{
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor,
            color: styles.textColor
          }}
          role="alert"
          aria-live="assertive"
        >
          <div className="notification-header">
            <div className="notification-title-section">
              <div
                className="notification-icon"
                style={{ color: styles.iconColor }}
              >
                {icon}
              </div>
              <div className="notification-content">
                {title && (
                  <h4
                    className="notification-title"
                    style={{ color: styles.titleColor }}
                  >
                    {title}
                  </h4>
                )}
                <p className="notification-message">
                  {message}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="notification-close-btn"
              onClick={onClose}
              aria-label="Close notification"
              style={{ color: styles.textColor }}
            >
              <FaTimes size={16} />
            </button>
          </div>

          {duration > 0 && (
            <div className="notification-progress">
              <div
                className="notification-progress-bar"
                style={{
                  backgroundColor: styles.progressColor,
                  animation: `progressShrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .notification-wrapper {
          position: fixed;
          top: 180px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          min-width: 400px;
          max-width: 480px;
          animation: slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .notification-container {
          border: 1px solid;
          border-radius: 12px;
          box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.15),
            0 5px 10px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        .notification-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px;
        }

        .notification-title-section {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .notification-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          line-height: 1.4;
        }

        .notification-message {
          margin: 0;
          line-height: 1.5;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .notification-close-btn {
          background: none;
          border: none;
          opacity: 0.7;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .notification-close-btn:hover {
          opacity: 1;
          background-color: rgba(0, 0, 0, 0.08);
          transform: scale(1.05);
        }

        .notification-progress {
          width: 100%;
          height: 3px;
          background-color: rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .notification-progress-bar {
          height: 100%;
          width: 100%;
          transform-origin: left;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @keyframes progressShrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }

        /* Hover effects */
        .notification-container:hover {
          transform: translateY(-1px);
          box-shadow:
            0 15px 35px rgba(0, 0, 0, 0.2),
            0 5px 15px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .notification-wrapper {
            min-width: 90%;
            max-width: 95%;
            top: 60px;
          }

          .notification-header {
            padding: 16px;
          }

          .notification-title-section {
            gap: 10px;
          }

          .notification-title {
            font-size: 1rem;
          }

          .notification-message {
            font-size: 0.9rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .notification-container {
            box-shadow:
              0 10px 25px rgba(0, 0, 0, 0.3),
              0 5px 10px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
          }

          .notification-close-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .notification-progress {
            background-color: rgba(255, 255, 255, 0.2);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .notification-wrapper {
            animation: none;
          }

          .notification-progress-bar {
            animation: none;
          }

          .notification-container:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

NotificationPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
};

export default NotificationPopup;