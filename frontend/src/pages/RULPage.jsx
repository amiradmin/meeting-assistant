// pages/RULPage.jsx
import React, { useEffect } from "react";
import { Card, Spinner } from "react-bootstrap";
import { FaIndustry } from "react-icons/fa";

// Custom components
import SummaryStats from "../components/RUL/SummaryStats";
import AssetGrid from "../components/RUL/AssetGrid";
import SensorModal from "../components/SensorModal";
import PhotoViewer from "../components/PhotoViewer";
import DocumentsViewer from "../components/DocumentsViewer";
import HistoryModal from "../components/RUL/HistoryModal";
import Legend from "../components/RUL/Legend";

// Hooks and utilities
import { useRULData } from "../hooks/useRULData";
import { useModalHandlers } from "../hooks/useModalHandlers";

const RULPage = () => {
  const {
    assets,
    loading,
    error,
    fetchRUL
  } = useRULData();

  const {
    // Modal states
    photos,
    documents,
    sensorAsset,
    sensorData,
    sensorLoading,
    historyRecords,
    historyLoading,
    showPhotoViewer,
    showDocumentsViewer,
    showSensorModal,
    showHistoryModal,
    historyAsset,
    isRealTime,
    realTimeLoading,
    connectionStatus,
    lastUpdate,

    // Modal handlers
    openPhotoViewer,
    openDocumentsViewer,
    openSensorModal,
    openHistoryModal,
    closeSensorModal,
    fetchSensorDataNow,
    startRealTime,
    stopRealTime,
    setShowPhotoViewer,
    setShowDocumentsViewer,
    setShowHistoryModal
  } = useModalHandlers();

  useEffect(() => {
    fetchRUL();
  }, [fetchRUL]);

  if (loading) {
    return (
      <div className="modern-loading-state">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">در حال بارگذاری...</h3>
          <p className="loading-subtitle">در حال دریافت اطلاعات عمر تجهیزات</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>

        <style jsx>{`
          .modern-loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 2rem;
          }

          .loading-container {
            text-align: center;
            max-width: 400px;
            width: 100%;
          }

          .loading-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
          }

          .spinner-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
          }

          .spinner-ring:nth-child(2) {
            width: 60px;
            height: 60px;
            top: 10px;
            left: 10px;
            border-top-color: #10b981;
            animation-duration: 1.2s;
            animation-direction: reverse;
          }

          .spinner-ring:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 20px;
            left: 20px;
            border-top-color: #f59e0b;
            animation-duration: 0.9s;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          .loading-subtitle {
            color: #6b7280;
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .loading-progress {
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
          }

          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
            border-radius: 2px;
            animation: progress 2s ease-in-out infinite;
          }

          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-error-state">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 className="error-title">خطا در بارگذاری داده‌ها</h3>
          <p className="error-message">{error}</p>
          <p className="error-subtitle">لطفاً اتصال شبکه را بررسی کرده و مجدداً تلاش کنید.</p>
          <button className="retry-button" onClick={fetchRUL}>
            <i className="fas fa-redo"></i>
            تلاش مجدد
          </button>
        </div>

        <style jsx>{`
          .modern-error-state {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 2rem;

          }

          .error-container {
            text-align: center;
            max-width: 400px;
            width: 100%;

          }

          .error-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #fef2f2, #fee2e2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: #ef4444;
            font-size: 2rem;
          }

          .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          .error-message {
            color: #ef4444;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .error-subtitle {
            color: #6b7280;
            margin-bottom: 2rem;
          }

          .retry-button {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }

          .retry-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="rul-page-container">
      {/* Modern Header Section */}
      <div className="modern-header mb-5">
        <div className="container-fluid">
          {/* Main Title */}
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <div className="header-content">
                <div className="rul-icon">
                  <i className="fas fa-clock"></i>Header
                </div>
                <h1 className="page-title">مدیریت عمر تجهیزات</h1>
                <p className="page-subtitle">(Remaining Useful Life - RUL)</p>
                <p className="page-description">
                  نظارت هوشمند بر سلامت تجهیزات و پیش‌بینی عمر باقی‌مانده با استفاده از تحلیل‌های پیشرفته
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Section */}
      <div className="stats-section">
        <div className="container-fluid">
          <SummaryStats assets={assets} />
        </div>
      </div>

      {/* Assets Grid Section */}
      <div className="grid-section">
        <div className="container-fluid">
          <AssetGrid
            assets={assets}
            onOpenPhotoViewer={openPhotoViewer}
            onOpenDocumentsViewer={openDocumentsViewer}
            onOpenSensorModal={openSensorModal}
            onOpenHistoryModal={openHistoryModal}
          />
        </div>
      </div>
<br />
      {/* Legend Section */}
      <div className="legend-section">
        <div className="container-fluid">
          <Legend />
        </div>
      </div>

      {/* Modals */}
      <PhotoViewer
        photos={photos}
        show={showPhotoViewer}
        onHide={() => setShowPhotoViewer(false)}
      />

      <DocumentsViewer
        documents={documents}
        show={showDocumentsViewer}
        onHide={() => setShowDocumentsViewer(false)}
      />

      <SensorModal
        show={showSensorModal}
        onHide={closeSensorModal}
        sensorAsset={sensorAsset}
        sensorData={sensorData}
        sensorLoading={sensorLoading}
        isRealTime={isRealTime}
        realTimeLoading={realTimeLoading}
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        onRefresh={fetchSensorDataNow}
        onStartRealTime={() => startRealTime(sensorAsset)}
        onStopRealTime={stopRealTime}
      />

      <HistoryModal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        historyRecords={historyRecords}
        historyLoading={historyLoading}
        historyAsset={historyAsset}
      />

      {/* Page Layout Styles */}
      <style jsx>{`
        .rul-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding-bottom: 2rem;
        }

        .modern-header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
          padding: 3rem 0;
          position: relative;
          overflow: hidden;
          height:500px;
        }

        .modern-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          animation: float 20s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .rul-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        .rul-icon i {
          font-size: 2rem;
          color: white;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .page-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .page-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .stats-section {
          margin: 2rem 0;
          height:320px;
        }

        .grid-section {
          margin: 2rem 0;
          min-height: 125vh;
        }

        .legend-section {
          margin: 2rem 0;

        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .page-subtitle {
            font-size: 1.1rem;
          }

          .page-description {
            font-size: 0.9rem;
          }

          .rul-icon {
            width: 60px;
            height: 60px;
          }

          .rul-icon i {
            font-size: 1.5rem;
          }

        }
      `}</style>
    </div>
  );
};

export default RULPage;