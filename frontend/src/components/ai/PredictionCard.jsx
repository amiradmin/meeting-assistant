import React, { useState } from 'react';
import {
  FaPlay,
  FaCalendarAlt,
  FaTrash,
  FaSpinner,
  FaInfoCircle,
  FaGraduationCap,
  FaChartLine,
  FaTimes,
  FaRocket,
  FaClock,
  FaHistory
} from 'react-icons/fa';
import DateInfo from './DateInfo';
import MonitoringReportModal from './MonitoringReportModal';
import ScheduleModal from './ScheduleModal';
import ModelTooltipModal from './ModelTooltipModal';

const PredictionCard = ({
  title,
  description,
  icon,
  status,
  progress,
  isRunning,
  nextSchedule,
  lastUpdate,
  onStart,
  onSchedule,
  onRemoveSchedule,
  onTrainModel,
  isTraining,
  modelTooltip,
  shouldShowTrainButton = false,
  latestModelVersions,
  monitoringReportUrl,
  onGenerateReport,
  isGeneratingReport = false,
  reportStatus = null
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTooltipModal, setShowTooltipModal] = useState(false);
  const [reportModalState, setReportModalState] = useState({
    hasReport: false,
    reportStatus: 'idle',
    reportFileUrl: null,
    error: null
  });

  const getModelType = () => {
    const typeMap = {
      'پیش‌بینی ناهنجاری ها': 'anomaly',
      'پیش‌بینی تعمیرات': 'maintenance',
      'پیش‌بینی راندمان': 'efficiency',
      'پیش‌بینی عمر مفید': 'lifetime'
    };
    return typeMap[title] || 'general';
  };

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'بدون تاریخ';
    try {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? 'تاریخ نامعتبر' : date.toLocaleString('fa-IR');
    } catch (error) {
      return 'تاریخ نامعتبر';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'running': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed': return 'تکمیل شده';
      case 'running': return 'در حال اجرا';
      case 'error': return 'خطا';
      default: return 'آماده';
    }
  };

  const getCardGradient = () => {
    const gradients = {
      'پیش‌بینی ناهنجاری ها': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
      'پیش‌بینی تعمیرات': 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
      'پیش‌بینی راندمان': 'linear-gradient(135deg, #45b7d1 0%, #96c93d 100%)',
      'پیش‌بینی عمر مفید': 'linear-gradient(135deg, #b06ab3 0%, #4568dc 100%)'
    };
    return gradients[title] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const fetchWithTimeout = (url, options = {}) => {
    const { timeout = 8000, ...fetchOptions } = options;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout: Request took too long'));
      }, timeout);

      fetch(url, fetchOptions)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const handleScheduleSubmit = (scheduleConfig) => {
    onSchedule(scheduleConfig);
    setShowScheduleModal(false);
  };

  const handleViewReport = async () => {
    console.log('🔍 Opening monitoring report modal for:', getModelType());
    setShowReportModal(true);

    setReportModalState({
      hasReport: false,
      reportStatus: 'loading',
      reportFileUrl: null,
      error: null
    });

    try {
      const reportUrl = `/api/pdm/monitoring/report/file/?model_type=${getModelType()}&t=${Date.now()}`;
      const response = await fetchWithTimeout(reportUrl, { timeout: 5000 });

      if (response.ok) {
        setReportModalState({
          hasReport: true,
          reportStatus: 'success',
          reportFileUrl: reportUrl,
          error: null
        });
      } else {
        setReportModalState({
          hasReport: false,
          reportStatus: 'idle',
          reportFileUrl: null,
          error: null
        });
      }
    } catch (error) {
      console.error('Error checking report:', error);
      setReportModalState({
        hasReport: false,
        reportStatus: 'error',
        reportFileUrl: null,
        error: 'سرویس گزارش‌دهی در دسترس نیست. لطفاً بعداً تلاش کنید.'
      });
    }
  };

  const handleGenerateNewReport = async () => {
    console.log('🔄 Generating new report for:', getModelType());

    setReportModalState(prev => ({
      ...prev,
      reportStatus: 'loading',
      error: null
    }));

    try {
      const generateResponse = await fetchWithTimeout(
        `/api/pdm/monitoring/report/file/?model_type=${getModelType()}&generate_sample=true&t=${Date.now()}`,
        { timeout: 10000 }
      );

      if (generateResponse.ok) {
        const reportUrl = `/api/pdm/monitoring/report/file/?model_type=${getModelType()}&t=${Date.now()}`;
        setReportModalState({
          hasReport: true,
          reportStatus: 'success',
          reportFileUrl: reportUrl,
          error: null
        });
      } else {
        throw new Error(`خطای سرور: ${generateResponse.status}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportModalState({
        hasReport: false,
        reportStatus: 'error',
        reportFileUrl: null,
        error: 'سرویس گزارش‌دهی موقتاً در دسترس نیست. لطفاً بعداً تلاش کنید.'
      });
    }
  };

  const handleShowDemoReport = () => {
    setReportModalState({
      hasReport: true,
      reportStatus: 'success',
      reportFileUrl: '/demo-monitoring-report.html',
      error: null
    });
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setTimeout(() => {
      setReportModalState({
        hasReport: false,
        reportStatus: 'idle',
        reportFileUrl: null,
        error: null
      });
    }, 300);
  };

  const handleShowTooltipModal = () => {
    setShowTooltipModal(true);
  };

  const handleCloseTooltipModal = () => {
    setShowTooltipModal(false);
  };

  return (
    <>
      <div className="prediction-card">
        {/* Header with Gradient */}
        <div className="card-header" style={{ background: getCardGradient() }}>
          <div className="header-content">
            <div className="icon-wrapper">
              {icon}
            </div>
            <div className="title-section">
              <h3 className="card-title">{title}</h3>
              <p className="card-description">{description}</p>
            </div>
          </div>

          {/* Model Version Tooltip */}
          {modelTooltip && (
            <div className="model-tooltip" onClick={handleShowTooltipModal}>
              <FaInfoCircle />
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="card-body">
          {/* Date Info */}
          <DateInfo
            lastUpdate={lastUpdate}
            shouldShowTrainButton={shouldShowTrainButton}
            modelVersionData={latestModelVersions}
          />

          {/* Status and Progress */}
          <div className="status-section">
            <div className="status-indicator">
              <div
                className="status-dot"
                style={{
                  backgroundColor: getStatusColor(),
                  animation: isRunning ? 'pulse 2s infinite' : 'none'
                }}
              />
              <span className="status-text" style={{ color: getStatusColor() }}>
                {getStatusText()}
              </span>
            </div>

            {progress > 0 && (
              <span className="progress-text">
                {progress}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Schedule Info */}
          {nextSchedule && (
            <div className="schedule-info">
              <div className="schedule-header">
                <div className="schedule-icon">
                  <FaClock />
                </div>
                <span className="schedule-title">برنامه‌ریزی شده</span>
                <button
                  onClick={() => onRemoveSchedule()}
                  className="remove-schedule-btn"
                >
                  <FaTrash />
                </button>
              </div>
              {nextSchedule.nextRun && (
                <div className="schedule-time">
                  <FaHistory />
                  اجرای بعدی: {new Date(nextSchedule.nextRun).toLocaleString('fa-IR')}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={onStart}
              disabled={isRunning}
              className={`action-btn primary ${isRunning ? 'running' : ''}`}
            >
              {isRunning ? (
                <>
                  <FaSpinner className="spinner" />
                  در حال اجرا...
                </>
              ) : (
                <>
                  <FaRocket />
                  اجرای پیش‌بینی
                </>
              )}
            </button>

            {/* Schedule Button */}
            <button
              onClick={() => setShowScheduleModal(true)}
              className={`action-btn secondary ${nextSchedule ? 'scheduled' : ''}`}
            >
              <FaCalendarAlt />
              {nextSchedule ? '' : 'زمان‌بندی'}
            </button>

            {/* Monitoring Report Button */}
            <button
              onClick={handleViewReport}
              disabled={isGeneratingReport}
              className="action-btn success"
            >
              {isGeneratingReport ? (
                <>
                  <FaSpinner className="spinner" />
                  در حال تولید...
                </>
              ) : (
                <>
                  <FaChartLine />
                  گزارش مانیتورینگ
                </>
              )}
            </button>

            {/* Train Model Button */}
            {shouldShowTrainButton && onTrainModel && (
              <button
                onClick={onTrainModel}
                disabled={isTraining}
                className="action-btn train"
              >
                {isTraining ? (
                  <>
                    <FaSpinner className="spinner" />
                    در حال آموزش...
                  </>
                ) : (
                  <>
                    <FaGraduationCap />
                    آموزش مدل
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleScheduleSubmit}
        title={title}
      />

      {/* Monitoring Report Modal */}
      <MonitoringReportModal
        isOpen={showReportModal}
        hasReport={reportModalState.hasReport}
        reportStatus={reportModalState.reportStatus}
        reportFileUrl={reportModalState.reportFileUrl}
        modelType={getModelType()}
        onClose={handleCloseReportModal}
        onGenerateReport={handleGenerateNewReport}
        error={reportModalState.error}
        onFallback={handleShowDemoReport}
      />

      {/* Model Tooltip Modal */}
      <ModelTooltipModal
        isOpen={showTooltipModal}
        onClose={handleCloseTooltipModal}
        modelTooltip={modelTooltip}
        title={title}
      />

      <style jsx>{`
        .prediction-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          animation: slideIn 0.5s ease-out;
        }

        .prediction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          padding: 1.5rem;
          color: white;
          position: relative;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-wrapper {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .title-section {
          flex: 1;
        }

        .card-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .card-description {
          margin: 0;
          font-size: 0.875rem;
          opacity: 0.9;
          line-height: 1.4;
        }

        .model-tooltip {
          position: absolute;
          top: 1rem;
          left: 1rem;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s ease;
          background: rgba(255, 255, 255, 0.2);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .model-tooltip:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .card-body {
          padding: 1.5rem;
        }

        .status-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-text {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .progress-text {
          font-size: 0.875rem;
          font-weight: 700;
          color: #374151;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: width 0.3s ease;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .schedule-info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .schedule-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .schedule-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #0369a1;
          font-size: 0.875rem;
        }

        .schedule-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0369a1;
        }

        .remove-schedule-btn {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .remove-schedule-btn:hover {
          background: rgba(220, 38, 38, 0.1);
        }

        .schedule-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #475569;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
          font-size: 0.875rem;
        }

        .action-btn.primary {
          background: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-btn.primary.running {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .action-btn.secondary {
          background: white;
          color: #374151;
          border: 2px solid #d1d5db;
        }

        .action-btn.secondary:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .action-btn.secondary.scheduled {
          background: #fed7aa;
          color: #9a3412;
          border-color: #fdba74;
        }

        .action-btn.success {
          background: #10b981;
          color: white;
        }

        .action-btn.success:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btn.train {
          background: #8b5cf6;
          color: white;
        }

        .action-btn.train:hover:not(:disabled) {
          background: #7c3aed;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default PredictionCard;