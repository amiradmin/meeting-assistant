import React from 'react';
import { FaTimes, FaCodeBranch, FaCalendarAlt, FaFile, FaInfoCircle } from 'react-icons/fa';

const ModelTooltipModal = ({ isOpen, onClose, modelTooltip, title }) => {
  if (!isOpen) return null;

  // Parse the tooltip text to extract model information
  const parseModelInfo = (tooltipText) => {
    const lines = tooltipText.split('\n').filter(line => line.trim());
    const info = {};

    lines.forEach(line => {
      if (line.includes('نوع:')) info.type = line.split('نوع:')[1]?.trim();
      if (line.includes('ورژن:')) info.version = line.split('ورژن:')[1]?.trim();
      if (line.includes('تاریخ ایجاد:')) info.createdAt = line.split('تاریخ ایجاد:')[1]?.trim();
      if (line.includes('فایل:')) info.fileStatus = line.split('فایل:')[1]?.trim();
    });

    return info;
  };

  const modelInfo = parseModelInfo(modelTooltip);

  const getStatusColor = (status) => {
    return status === 'موجود' ? '#10b981' : '#ef4444';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content tooltip-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <FaInfoCircle />
            اطلاعات مدل - {title}
          </h2>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="model-info-grid">
            <div className="info-item">
              <div className="info-icon">
                <FaCodeBranch />
              </div>
              <div className="info-content">
                <label>نوع مدل</label>
                <span className="info-value">{modelInfo.type || 'نامشخص'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <FaCodeBranch />
              </div>
              <div className="info-content">
                <label>ورژن</label>
                <span className="info-value version">{modelInfo.version || 'نامشخص'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <FaCalendarAlt />
              </div>
              <div className="info-content">
                <label>تاریخ ایجاد</label>
                <span className="info-value">{modelInfo.createdAt || 'نامشخص'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <FaFile />
              </div>
              <div className="info-content">
                <label>وضعیت فایل</label>
                <span
                  className="info-value status"
                  style={{ color: getStatusColor(modelInfo.fileStatus) }}
                >
                  {modelInfo.fileStatus || 'نامشخص'}
                </span>
              </div>
            </div>
          </div>

          <div className="model-description">
            <h3>توضیحات مدل</h3>
            <p>
              این مدل برای {title.toLowerCase()} طراحی شده است و آخرین بروزرسانی آن در تاریخ مشخص شده انجام شده است.
              وضعیت فایل مدل نشان‌دهنده دسترسی به فایل‌های آموزشی و اجرایی مدل می‌باشد.
            </p>
          </div>

          <div className="technical-details">
            <h3>جزئیات فنی</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">فرمت مدل:</span>
                <span className="detail-value">TensorFlow/Keras</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">آخرین آموزش:</span>
                <span className="detail-value">{modelInfo.createdAt || 'نامشخص'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">وضعیت:</span>
                <span
                  className="detail-value status"
                  style={{ color: getStatusColor(modelInfo.fileStatus) }}
                >
                  {modelInfo.fileStatus === 'موجود' ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-close">
            بستن
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
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

        .tooltip-modal {
          background: white;
          border-radius: 20px;
          width: 95%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border-radius: 20px 20px 0 0;
        }

        .modal-title {
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

        .modal-body {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .model-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .info-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .info-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-content label {
          display: block;
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }

        .info-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }

        .info-value.version {
          color: #8b5cf6;
          font-family: monospace;
        }

        .info-value.status {
          font-weight: 700;
        }

        .model-description {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .model-description h3 {
          margin: 0 0 1rem 0;
          color: #0369a1;
          font-size: 1.25rem;
        }

        .model-description p {
          margin: 0;
          color: #475569;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .technical-details {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .technical-details h3 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1.25rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
        }

        .modal-actions {
          padding: 1.5rem 2rem;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 0 0 20px 20px;
          text-align: center;
        }

        .btn-close {
          padding: 0.75rem 2rem;
          background: #8b5cf6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .btn-close:hover {
          background: #7c3aed;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
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

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 1rem;
          }

          .tooltip-modal {
            width: 100%;
            height: 95%;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .model-info-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            padding: 1rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelTooltipModal;