import React, { useState } from "react";
import FailureSummaryStats from "../components/AssetFailure/FailureSummaryStats";
import FailureGrid from "../components/AssetFailure/FailureGrid";
import AssetFailureTable from "../components/AssetFailure/AssetFailureTable";
import { useAssetFailureData } from "../hooks/useAssetFailureData";
import { Spinner } from "react-bootstrap";

// Shared Modals
import SensorModal from "../components/SensorModal";
import PhotoViewer from "../components/PhotoViewer";
import DocumentsViewer from "../components/DocumentsViewer";
import HistoryModal from "../components/RUL/HistoryModal";

const AssetFailureDashboard = () => {
  const { assets, loading, error, refetch } = useAssetFailureData();

  // === Modal State ===
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showDocumentsViewer, setShowDocumentsViewer] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // === Modal Handlers ===
  const handleOpenPhotoViewer = (asset) => {
    setSelectedAsset(asset);
    setShowPhotoViewer(true);
  };

  const handleOpenDocumentsViewer = (asset) => {
    setSelectedAsset(asset);
    setShowDocumentsViewer(true);
  };

  const handleOpenSensorModal = (asset) => {
    setSelectedAsset(asset);
    setShowSensorModal(true);
  };

  const handleOpenHistoryModal = (asset) => {
    setSelectedHistory(asset);
    setShowHistoryModal(true);
  };

  const handleCloseAllModals = () => {
    setShowPhotoViewer(false);
    setShowDocumentsViewer(false);
    setShowSensorModal(false);
    setShowHistoryModal(false);
    setSelectedAsset(null);
    setSelectedHistory(null);
  };



  if (loading)
    return (
      <div className="modern-loading-state">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">در حال بارگذاری...</h3>
          <p className="loading-subtitle">در حال دریافت اطلاعات پیش‌بینی خرابی تجهیزات</p>
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
            border: 4px solid transparent;
            border-top: 4px solid #ef4444;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
          }

          .spinner-ring:nth-child(2) {
            width: 60px;
            height: 60px;
            top: 10px;
            left: 10px;
            border-top-color: #f59e0b;
            animation-delay: -0.5s;
          }

          .spinner-ring:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 20px;
            left: 20px;
            border-top-color: #eab308;
            animation-delay: -1s;
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
            font-size: 1rem;
            color: #6b7280;
            margin-bottom: 2rem;
          }

          .loading-progress {
            width: 100%;
            height: 4px;
            background: #f3f4f6;
            border-radius: 2px;
            overflow: hidden;
          }

          .progress-bar {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #ef4444, #f59e0b);
            border-radius: 2px;
            animation: progress 2s ease-in-out infinite;
          }

          @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );

  if (error)
    return (
      <div className="modern-error-state">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 className="error-title">خطا در بارگذاری</h3>
          <p className="error-message">{error}</p>
          <p className="error-subtitle">لطفاً اتصال شبکه را بررسی کرده و مجدداً تلاش کنید.</p>
          <button
            className="retry-button"
            onClick={refetch}
          >
            <i className="fas fa-redo me-2"></i>
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
          }

          .error-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
          }

          .error-icon i {
            font-size: 2rem;
            color: #ef4444;
          }

          .error-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          .error-message {
            font-size: 1rem;
            color: #ef4444;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }

          .error-subtitle {
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 2rem;
          }

          .retry-button {
            background: linear-gradient(135deg, #ef4444, #dc2626);
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
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
          }
        `}</style>
      </div>
    );

  return (
    <div className="failure-page-container">
      {/* Modern Header Section */}
      <div className="modern-header mb-5">
        <div className="container-fluid">
          {/* Main Title */}
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <div className="header-content">
                <div className="failure-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h1 className="page-title">داشبورد پیش‌بینی خرابی تجهیزات</h1>
                <p className="page-subtitle">نظارت هوشمند و پیش‌بینی خرابی تجهیزات صنعتی</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Section */}
      <div className="stats-section">
        <div className="container-fluid">
          <FailureSummaryStats assets={assets} />
        </div>
      </div>

      {/* Failure Grid Section */}
      <div className="grid-section">
        <div className="container-fluid">
          <FailureGrid
            assets={assets}
            onOpenPhotoViewer={handleOpenPhotoViewer}
            onOpenDocumentsViewer={handleOpenDocumentsViewer}
            onOpenSensorModal={handleOpenSensorModal}
            onOpenHistoryModal={handleOpenHistoryModal}
          />
        </div>
      </div>
<br />
      {/* Table Section */}
      <div className="table-section">
        <div className="container-fluid">
          <AssetFailureTable assets={assets} />
        </div>
      </div>

      {/* Modals */}
      {selectedAsset && (

        <>
          <PhotoViewer
            photos={selectedAsset.details.asset_info.photos || []}
            show={showPhotoViewer}
            onHide={handleCloseAllModals}
          />
          <DocumentsViewer
            documents={selectedAsset.details.asset_info.documents || []}
            show={showDocumentsViewer}
            onHide={handleCloseAllModals}
          />
          <SensorModal
            show={showSensorModal}
            onHide={handleCloseAllModals}
            sensorAsset={selectedAsset}
            sensorData={selectedAsset.sensor_data || []}
            sensorLoading={false} // optionally manage loading state
          />
        </>
      )}

      {selectedHistory && (
        <HistoryModal
          show={showHistoryModal}
          onHide={handleCloseAllModals}
          historyRecords={selectedHistory.history_records || []}
          historyLoading={false}
          historyAsset={selectedHistory}
        />
      )}

      {/* Final Layout Styles */}
      <style jsx>{`
        /* Page Layout Styles */
        .failure-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          padding-bottom: 2rem;
        }

        .modern-header {

          background: linear-gradient(135deg, #ef4444 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0 2rem;
          margin: -1.5rem -15px 0;
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
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .header-content {
          position: relative;
          z-index: 2;
        }

        .failure-icon {
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
        }

        .failure-icon i {
          font-size: 2.5rem;
          color: #fbbf24;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .page-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 0;
          font-weight: 300;
        }

        .stats-section {
          margin: 2rem 0;
          padding: 0 1rem;
          height:320px;
        }

        .grid-section {
          margin: 2rem 0;
          padding: 0 1rem;
        }

        .table-section {
          margin: 500px 0;
          padding: 0 1rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .modern-header {
            padding: 2rem 0 1.5rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .failure-icon {
            width: 60px;
            height: 60px;
          }

          .failure-icon i {
            font-size: 2rem;
          }

          .stats-section,
          .grid-section,
          .table-section {
            margin: 1.5rem 0;
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Focus styles for accessibility */
        .retry-button:focus {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }

        /* Animation for page load */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .failure-page-container > * {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AssetFailureDashboard;
