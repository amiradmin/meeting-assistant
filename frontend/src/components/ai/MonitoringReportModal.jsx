import React from 'react';
import { FaTimes, FaDownload, FaRedo, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaFilePdf } from 'react-icons/fa';

const MonitoringReportModal = ({
  isOpen,
  hasReport,
  reportStatus,
  reportFileUrl,
  modelType,
  onClose,
  onGenerateReport,
  error,
  onFallback
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (reportStatus) {
      case 'loading':
        return <FaSpinner className="spinner" />;
      case 'success':
        return <FaCheckCircle className="success" />;
      case 'error':
        return <FaExclamationTriangle className="error" />;
      default:
        return <FaFilePdf className="idle" />;
    }
  };

  const getStatusText = () => {
    switch (reportStatus) {
      case 'loading':
        return 'در حال بارگذاری...';
      case 'success':
        return 'گزارش آماده است';
      case 'error':
        return 'خطا در بارگذاری';
      default:
        return hasReport ? 'گزارش موجود است' : 'گزارشی موجود نیست';
    }
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal">
        {/* Header */}
        <div className="report-modal-header">
          <h2 className="report-modal-title">
            <FaFilePdf />
            گزارش مانیتورینگ مدل
          </h2>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="report-modal-content">
          {/* Status Section */}
          <div className="report-status-section">
            <div className="status-indicator">
              {getStatusIcon()}
              <span className="status-text">{getStatusText()}</span>
            </div>

            {error && (
              <div className="error-message">
                <FaExclamationTriangle />
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="report-actions">
            {hasReport && reportFileUrl && (
              <a
                href={reportFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button primary"
              >
                <FaDownload />
                مشاهده گزارش کامل
              </a>
            )}

            <button
              onClick={onGenerateReport}
              disabled={reportStatus === 'loading'}
              className="action-button secondary"
            >
              {reportStatus === 'loading' ? (
                <>
                  <FaSpinner className="spinner" />
                  در حال تولید...
                </>
              ) : (
                <>
                  <FaRedo />
                  تولید گزارش جدید
                </>
              )}
            </button>

            {!hasReport && (
              <button
                onClick={onFallback}
                className="action-button fallback"
              >
                <FaFilePdf />
                مشاهده گزارش نمونه
              </button>
            )}
          </div>

          {/* Report Preview */}
          {hasReport && reportFileUrl && (
            <div className="report-preview">
              <h3>پیش‌نمایش گزارش</h3>
              <div className="preview-container">
                <iframe
                  src={reportFileUrl}
                  className="report-iframe"
                  title="Monitoring Report Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .report-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
          backdrop-filter: blur(8px);
        }

        .report-modal {
          background: white;
          border-radius: 20px;
          width: 95%;
          height: 90%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        .report-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px 20px 0 0;
        }

        .report-modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .report-modal-content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          overflow-y: auto;
        }

        .report-status-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          padding: 2rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .status-indicator .spinner {
          animation: spin 1s linear infinite;
          color: #3b82f6;
          font-size: 1.5rem;
        }

        .status-indicator .success {
          color: #10b981;
          font-size: 1.5rem;
        }

        .status-indicator .error {
          color: #ef4444;
          font-size: 1.5rem;
        }

        .status-indicator .idle {
          color: #6b7280;
          font-size: 1.5rem;
        }

        .status-text {
          color: #374151;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          background: #fef2f2;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #fecaca;
          max-width: 500px;
          text-align: center;
        }

        .report-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          min-width: 200px;
          justify-content: center;
        }

        .action-button.primary {
          background: #3b82f6;
          color: white;
        }

        .action-button.primary:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .action-button.secondary {
          background: #10b981;
          color: white;
        }

        .action-button.secondary:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .action-button.fallback {
          background: #8b5cf6;
          color: white;
        }

        .action-button.fallback:hover {
          background: #7c3aed;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .report-preview {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .report-preview h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .preview-container {
          flex: 1;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
        }

        .report-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .report-modal-overlay {
            padding: 1rem;
          }

          .report-modal {
            width: 100%;
            height: 95%;
          }

          .report-modal-header {
            padding: 1rem 1.5rem;
          }

          .report-modal-title {
            font-size: 1.25rem;
          }

          .report-modal-content {
            padding: 1.5rem;
            gap: 1.5rem;
          }

          .report-actions {
            flex-direction: column;
            align-items: center;
          }

          .action-button {
            width: 100%;
            max-width: 300px;
          }

          .status-indicator {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MonitoringReportModal;