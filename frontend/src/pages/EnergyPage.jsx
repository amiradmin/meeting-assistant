import React, { useState, useEffect, useCallback } from "react";
import { FaBolt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ProgressBar } from "react-bootstrap";

// Energy Components
import EnergySummaryStats from "../components/Energy/EnergySummaryStats";
import EnergyGrid from "../components/Energy/EnergyGrid";
import EnergyChart from "../components/Energy/EnergyChart";
import EnergyTable from "../components/Energy/EnergyTable";
import Legend from "../components/Energy/Legend";

// Shared Modals
import SensorModal from "../components/SensorModal";
import PhotoViewer from "../components/PhotoViewer";
import DocumentsViewer from "../components/DocumentsViewer";
import HistoryModal from "../components/RUL/HistoryModal";

// Hooks
import { useEnergyPredictionData } from "../hooks/useEnergyPredictionData";
import { useModalHandlers } from "../hooks/useModalHandlers";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.150.10:8000/api";

// Modern Progress Indicator Component
const ModernProgressIndicator = ({ message = "در حال بارگذاری..." }) => {
  return (
    <div className="modern-progress-overlay">
      <div className="progress-modal">
        <div className="progress-content">
          <div className="progress-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="progress-title">{message}</h3>
          <p className="progress-subtitle">لطفاً منتظر بمانید...</p>
          <div className="progress-bar-container">
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-progress-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .progress-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 400px;
          width: 90%;
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }

        .progress-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .progress-spinner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }

        .spinner-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          border-top-color: #764ba2;
          animation-delay: -0.5s;
        }

        .spinner-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          border-top-color: #f093fb;
          animation-delay: -1s;
        }

        .progress-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .progress-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        .progress-bar-container {
          width: 100%;
          max-width: 300px;
        }

        .progress-track {
          width: 100%;
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 45%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 3px;
          animation: progress-shimmer 2s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes progress-shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .progress-modal {
            padding: 2rem;
            margin: 1rem;
          }

          .progress-title {
            font-size: 1.25rem;
          }

          .progress-spinner {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

const EnergyPage = () => {
  const {
    assets,
    loadingAssets,
    errorAssets,
    fetchAssets,
    predictions,
    loadingPredictions,
    fetchPredictions,
    fetchPredictionHistory
  } = useEnergyPredictionData();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hourOffset, setHourOffset] = useState(new Date().getHours());
  const [showProgress, setShowProgress] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataSource, setDataSource] = useState("history"); // 'history' or 'time-based'
  const [likedAssets, setLikedAssets] = useState(new Set()); // Track liked assets

  const {
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
    setShowHistoryModal,
  } = useModalHandlers();

  // Load liked assets from localStorage on component mount
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedAssets');
    if (savedLikes) {
      try {
        setLikedAssets(new Set(JSON.parse(savedLikes)));
      } catch (error) {
        console.error('Error loading liked assets:', error);
      }
    }
  }, []);

  // Save liked assets to localStorage when they change
  useEffect(() => {
    localStorage.setItem('likedAssets', JSON.stringify([...likedAssets]));
  }, [likedAssets]);

  // Handle like/unlike functionality
  const handleLikeAsset = async (assetId, like) => {
    try {
      // You can add API call here to save like status to backend
      // For now, we'll just update the local state

      setLikedAssets(prev => {
        const newSet = new Set(prev);
        if (like) {
          newSet.add(assetId);
        } else {
          newSet.delete(assetId);
        }
        return newSet;
      });

      // Optional: Show toast notification
      console.log(`Asset ${assetId} ${like ? 'liked' : 'unliked'}`);

      return true;
    } catch (error) {
      console.error('Error updating like:', error);
      return false;
    }
  };

  // Fetch assets and initial prediction history on mount
  useEffect(() => {
    const initializeData = async () => {
      setShowProgress(true);
      setProgressMessage("در حال بارگذاری داده‌های انرژی...");

      try {
        // Fetch assets first
        await fetchAssets();

        // Then fetch prediction history for initial data
        await fetchPredictionHistory();

        setIsInitialLoad(false);
        setDataSource("history");

        // Brief delay to show completion
        setTimeout(() => {
          setShowProgress(false);
        }, 500);

      } catch (error) {
        console.error("Failed to initialize data:", error);
        setProgressMessage("خطا در بارگذاری داده‌ها");

        setTimeout(() => {
          setShowProgress(false);
        }, 2000);
      }
    };

    initializeData();
  }, [fetchAssets, fetchPredictionHistory]);

  // Combine date & hour
  const getCombinedDateTime = useCallback(() => {
    const dt = new Date(selectedDate);
    dt.setHours(hourOffset, 0, 0, 0);
    return dt;
  }, [selectedDate, hourOffset]);

  // Enhanced fetch predictions with progress - FIXED VERSION
  const handleFetchPredictions = useCallback(async (dateTime) => {
    if (!dateTime) return;

    setShowProgress(true);
    setProgressMessage("در حال دریافت پیش‌بینی‌های انرژی...");

    try {
      // Use the fetchPredictions function from hook to update state
      // This will automatically handle the loading state
      await fetchPredictions(dateTime);
      setDataSource("time-based");

      // Brief delay to show completion
      setTimeout(() => {
        setShowProgress(false);
      }, 500);

    } catch (err) {
      console.error("Failed to fetch predictions:", err);
      setProgressMessage("خطا در دریافت داده‌ها");

      // Show error for 2 seconds then hide
      setTimeout(() => {
        setShowProgress(false);
      }, 2000);
    }
  }, [fetchPredictions]);

  // Refetch when date/hour changes (only after initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      handleFetchPredictions(getCombinedDateTime());
    }
  }, [selectedDate, hourOffset, handleFetchPredictions, getCombinedDateTime, isInitialLoad]);

  // FIXED: Handlers - synchronize DatePicker and hour slider
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      // Update hour slider when date changes to match the selected time
      setHourOffset(date.getHours());
      setIsInitialLoad(false);
    }
  };

  const handleSliderChange = (value) => {
    setHourOffset(value);
    // Update the selectedDate's hour when slider changes
    const newDate = new Date(selectedDate);
    newDate.setHours(value);
    setSelectedDate(newDate);
    setIsInitialLoad(false);
  };

  // Refresh with history data
  const handleRefreshWithHistory = async () => {
    setShowProgress(true);
    setProgressMessage("در حال دریافت آخرین پیش‌بینی‌ها...");

    try {
      await fetchPredictionHistory();
      setDataSource("history");

      setTimeout(() => {
        setShowProgress(false);
      }, 500);
    } catch (error) {
      console.error("Failed to refresh history:", error);
      setProgressMessage("خطا در دریافت داده‌ها");

      setTimeout(() => {
        setShowProgress(false);
      }, 2000);
    }
  };

  // FIXED: Safe normalization of assets with predictions
  const assetsWithPredictions = React.useMemo(() => {
    if (!Array.isArray(assets)) return [];

    return assets.map((asset) => {
      // Ensure we have a valid asset ID
      const assetId = asset.id || asset.asset_id || asset.asset;
      if (!assetId) {
        console.warn('Asset missing ID:', asset);
        return {
          ...asset,
          id: 'unknown',
          latestPrediction: null,
        };
      }

      // Safely find prediction
      let pred = null;
      if (Array.isArray(predictions)) {
        pred = predictions.find((p) => {
          // Handle different API response formats
          const predictionAssetId = p.asset || p.asset_id || p.assetId;
          return predictionAssetId === assetId;
        });
      } else if (predictions && Array.isArray(predictions.predictions)) {
        // Handle case where predictions is an object with predictions array
        pred = predictions.predictions.find((p) => {
          const predictionAssetId = p.asset || p.asset_id || p.assetId;
          return predictionAssetId === assetId;
        });
      }

      return {
        ...asset,
        id: assetId,
        latestPrediction: pred || null,
      };
    });
  }, [assets, predictions]);

  // FIXED: Get predictions array for components that expect array
  const predictionsArray = React.useMemo(() => {
    if (Array.isArray(predictions)) {
      return predictions;
    } else if (predictions && Array.isArray(predictions.predictions)) {
      return predictions.predictions;
    }
    return [];
  }, [predictions]);

  // Debug: Log predictions and assets to see what's happening
  useEffect(() => {
    console.log('Predictions:', predictions);
    console.log('Assets:', assets);
    console.log('Assets with predictions:', assetsWithPredictions);
    console.log('Predictions array:', predictionsArray);
    console.log('Liked assets:', likedAssets);
  }, [predictions, assets, assetsWithPredictions, predictionsArray, likedAssets]);

  // === UI STATES ===
  if (loadingAssets && isInitialLoad)
    return (
      <div className="modern-loading-state">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">در حال بارگذاری...</h3>
          <p className="loading-subtitle">در حال دریافت اطلاعات انرژی تجهیزات</p>
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
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
          }

          .spinner-ring:nth-child(2) {
            width: 60px;
            height: 60px;
            top: 10px;
            left: 10px;
            border-top-color: #764ba2;
            animation-delay: -0.5s;
          }

          .spinner-ring:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 20px;
            left: 20px;
            border-top-color: #f093fb;
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
            background: linear-gradient(90deg, #667eea, #764ba2);
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

  if (errorAssets)
    return (
      <div className="modern-error-state">
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 className="error-title">خطا در بارگذاری</h3>
          <p className="error-message">{errorAssets}</p>
          <p className="error-subtitle">لطفاً اتصال شبکه را بررسی کرده و مجدداً تلاش کنید.</p>
          <button
            className="retry-button"
            onClick={() => fetchAssets()}
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
            background: linear-gradient(135deg, #667eea, #764ba2);
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
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          }
        `}</style>
      </div>
    );

  // === MAIN UI ===
  return (
    <div className="energy-page-container">
      {/* Modern Progress Indicator Overlay */}
      {showProgress && <ModernProgressIndicator message={progressMessage} />}

      {/* Modern Header Section */}
      <div className="modern-header mb-5">
        <div className="container-fluid">
          {/* Main Title */}
          <div className="row justify-content-center mb-4">
            <div className="col-12 text-center">
              <div className="header-content">
                <div className="energy-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h1 className="page-title">مدیریت انرژی تجهیزات</h1>
                <p className="page-subtitle">پیش‌بینی و نظارت هوشمند مصرف انرژی</p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="controls-card">
                <div className="row align-items-end">
                  {/* Date Picker */}
                  <div className="col-md-6 mb-3">
                    <label className="control-label">
                      <i className="fas fa-calendar-alt me-2"></i>
                      انتخاب تاریخ و زمان
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={60}
                      dateFormat="yyyy/MM/dd HH:mm"
                      className="form-control modern-input"
                      placeholderText="تاریخ و زمان پیش‌بینی را انتخاب کنید"
                      timeCaption="زمان"
                      isClearable
                      todayButton="امروز"
                      timeInputLabel="زمان:"
                      showTimeInput
                    />
                  </div>

                  {/* Hour Slider */}
                  <div className="col-md-6 mb-3">
                    <label className="control-label">
                      <i className="fas fa-clock me-2"></i>
                      تنظیم ساعت: {hourOffset.toString().padStart(2, '0')}:00
                    </label>
                    <div className="slider-container">
                      <Slider
                        min={0}
                        max={23}
                        value={hourOffset}
                        onChange={handleSliderChange}
                        marks={{ 0: "۰۰", 6: "۰۶", 12: "۱۲", 18: "۱۸", 23: "۲۳" }}
                        railStyle={{
                          backgroundColor: "#e9ecef",
                          height: 8,
                          borderRadius: 4,
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
                        }}
                        handleStyle={{
                          borderColor: "#667eea",
                          height: 20,
                          width: 20,
                          backgroundColor: "#667eea",
                          marginTop: -6,
                          boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
                        }}
                        trackStyle={{
                          backgroundColor: "#667eea",
                          height: 8,
                          borderRadius: 4,
                          boxShadow: "0 1px 3px rgba(102, 126, 234, 0.2)"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Selection Display */}
                <div className="current-selection mt-3 p-3 bg-light rounded">
                  <div className="row text-center">
                    <div className="col-12" style={{color:"black"}}>
                      <strong >انتخاب فعلی:</strong>
                      <span className="ms-2">
                        {selectedDate.toLocaleDateString('fa-IR')} - ساعت {hourOffset.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Header Styles */}
      <style jsx>{`
        .react-datepicker-popper {
          transform: translate(19px, -60px) !important;
        }

        .modern-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem 0 2rem;
          margin: -1.5rem -15px 0;
          position: relative;
          overflow: hidden;
          height: 500px;
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

        .energy-icon {
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

        .energy-icon i {
          font-size: 2.5rem;
          color: #ffd700;
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

        .controls-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .control-label {
          display: block;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .control-label i {
          color: #667eea;
        }

        .modern-input {
          border: 2px solid #e9ecef;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: white;
        }

        .modern-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          outline: none;
        }

        .slider-container {
          padding: 0.5rem 0;
        }

        .data-source-badge {
          display: inline-block;
        }

        .current-selection {
          border: 1px solid #dee2e6;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .modern-header {
            padding: 2rem 0 1.5rem;
            height: 400px;
          }

          .page-title {
            font-size: 2rem;
          }

          .energy-icon {
            width: 60px;
            height: 60px;
          }

          .energy-icon i {
            font-size: 2rem;
          }

          .controls-card {
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* Rest of the components - FIXED: Use predictionsArray instead of predictions */}
      <EnergySummaryStats assets={assetsWithPredictions} />
      <EnergyGrid
        assets={assetsWithPredictions.filter((a) => a.latestPrediction)}
        predictions={predictionsArray}
        loadingPredictions={loadingPredictions}
        onOpenPhotoViewer={openPhotoViewer}
        onOpenDocumentsViewer={openDocumentsViewer}
        onOpenSensorModal={openSensorModal}
        onOpenHistoryModal={openHistoryModal}
        onLikeAsset={handleLikeAsset} // Pass the like handler
        likedAssets={likedAssets} // Pass the liked assets set
      />

      <div className="charts-section">
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-lg-6">
              <EnergyChart predictions={predictionsArray} />
            </div>
            <div className="col-lg-6">
              <EnergyTable predictions={predictionsArray} />
            </div>
          </div>
        </div>
      </div>

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

      {/* Final Layout Styles */}
      <style jsx>{`
        .energy-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding-bottom: 2rem;
        }

        .charts-section {
          margin: 3rem 0;
          height: 730px;
        }

        .legend-section {
          margin: 2rem 0;
        }

        @media (max-width: 768px) {
          .energy-page-container {
            padding-bottom: 1rem;
          }

          .charts-section {
            margin: 2rem 0;
          }

          .legend-section {
            margin: 1.5rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergyPage;