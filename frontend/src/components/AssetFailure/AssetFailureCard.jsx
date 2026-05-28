import React, { useState } from "react";
import { Card, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FaIndustry,
  FaExclamationTriangle,
  FaRegImage,
  FaFileAlt,
  FaCogs,
  FaHistory,
  FaCube
} from "react-icons/fa";
import SVGGauge from "./SVGGauge";
import ModelViewerModal from "./ModelViewerModal";

const formatPersianDateTime = (dateString) => {
  if (!dateString) return '---';

  const date = new Date(dateString);
  return date.toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AssetFailureCard = ({
  asset = {},
  onOpenPhotoViewer,
  onOpenDocumentsViewer,
  onOpenSensorModal,
  onOpenHistoryModal
}) => {
  const predictedRUL = asset.failure_probability ?? 0;
  const healthPercent = Math.floor(Math.max(0, Math.min(100, predictedRUL * 100)));

  // ✅ FIXED: Use the calculated healthPercent
  const displayPercentage = healthPercent;

  const getAssetId = () => asset.asset_id;

  // Determine health status and color
  const getHealthStatus = () => {
    if (healthPercent >= 80) return { status: 'excellent', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    if (healthPercent >= 60) return { status: 'good', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    if (healthPercent >= 30) return { status: 'warning', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
    return { status: 'critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
  };

  const healthStatus = getHealthStatus();

  const getImageUrl = (url) => {
    if (!url) return null;
    try {
      // If already absolute (starts with http)
      if (url.startsWith("http")) return `${url}?t=${Date.now()}`;

      // Otherwise, prefix with backend API base
      const baseUrl = "http://192.168.150.10:8000";
      return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}?t=${Date.now()}`;
    } catch {
      return url;
    }
  };

  // ✅ FIXED: Extract data from the correct API structure
  const assetInfo = asset.details?.asset_info || {};
  const predictionData = asset.details?.prediction_data || {};

  const rawThumb = assetInfo.photos?.[0]?.image ?? null;
  console.log(rawThumb);
  const thumbnailUrl = rawThumb ? getImageUrl(rawThumb) : null;




  const [imageLoading, setImageLoading] = useState(!!thumbnailUrl);
  const [imageError, setImageError] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);

  const assetName = asset.asset_name;
  const assetModel = asset.asset_model ?? "";
  const modelUrl = assetInfo.model_3d ?? null;

  // ✅ FIXED: Extract data for modal functions
  const assetPhotos = assetInfo.photos || [];
  const assetDocuments = assetInfo.documents || [];
  const sensorData = predictionData || {};

  // For history, you might need to fetch separately or it might be in a different endpoint
  const assetHistory = []; // You'll need to populate this from your API

  // ✅ FIXED: Modal handler functions with correct data
  const handleOpenPhotoViewer = () => {
    if (onOpenPhotoViewer && assetPhotos.length > 0) {
      onOpenPhotoViewer({
        assetId: asset.asset_id,
        assetName: asset.asset_name,
        photos: assetPhotos.map(photo => ({
          ...photo,
          image: getImageUrl(photo.image)
        }))
      });
    }
  };

  const handleOpenDocumentsViewer = () => {
    if (onOpenDocumentsViewer && assetDocuments.length > 0) {
      onOpenDocumentsViewer({
        assetId: asset.asset_id,
        assetName: asset.asset_name,
        documents: assetDocuments.map(doc => ({
          ...doc,
          file: getImageUrl(doc.file) // Use getImageUrl for documents too
        }))
      });
    }
  };

  const handleOpenSensorModal = () => {
    if (onOpenSensorModal) {
      onOpenSensorModal({
        assetId: asset.asset_id,
        assetName: asset.asset_name,
        assetModel: asset.asset_model,
        sensorData: sensorData,
        failureProbability: asset.failure_probability,
        predictedAt: asset.predicted_at,
        predictedFailureDate: asset.predicted_failure_date,
        status: asset.status
      });
    }
  };

  const handleOpenHistoryModal = () => {
    if (onOpenHistoryModal) {
      onOpenHistoryModal({
        assetId: asset.asset_id,
        assetName: asset.asset_name,
        history: assetHistory,
        // You can also pass prediction history if available
        predictionHistory: {
          currentProbability: asset.failure_probability,
          predictedAt: asset.predicted_at,
          predictedFailureDate: asset.predicted_failure_date
        }
      });
    }
  };

  return (
    <>
      <div className="modern-failure-card">
        {/* Card Header with Image */}
        <div className="asset-image-container">
          {thumbnailUrl ? (
            <>
              {imageLoading && (
                <div className="image-loading">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
              {imageError && (
                <div className="image-error">
                  <FaExclamationTriangle size={24} className="mb-2" />
                  <small>خطا در بارگذاری تصویر</small>
                </div>
              )}
              <img
                src={thumbnailUrl}
                alt={assetName}
                className={`asset-image ${imageLoading ? 'loading' : ''} ${imageError ? 'error' : ''}`}
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
                crossOrigin="anonymous"
                loading="lazy"
              />
            </>
          ) : (
            <div className="asset-placeholder">
              <FaIndustry size={40} />
              <span>{assetName}</span>
            </div>
          )}

          {/* Health Status Badge */}
          <div
            className="health-badge"
            style={{
              backgroundColor: healthStatus.color,
              color: 'white'
            }}
          >
            <i className="fas fa-heartbeat"></i>
            {/* ✅ FIXED: Use displayPercentage */}
            <span>{displayPercentage}%</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="asset-content">
          <div className="asset-header">
            <h6 className="asset-name" title={assetName}>{assetName}</h6>
            {assetModel && <p className="asset-model">{assetModel}</p>}
            <div className="asset-location">
              <small className="text-muted">
                {assetInfo.factory_name} - {assetInfo.section?.name}
              </small>
            </div>
          </div>

          {/* Health Gauge */}
          <div className="gauge-container">
            {/* ✅ FIXED: Pass displayPercentage to SVGGauge */}
            <SVGGauge value={displayPercentage} label={`${displayPercentage}%`} />
            <div className="gauge-label">وضعیت سلامت تجهیز</div>
          </div>

          {/* Asset Details */}
          <div className="asset-details">
            <div className="detail-item">
              <span className="detail-label">احتمال خرابی:</span>
              <span className="detail-value" style={{ color: healthStatus.color }}>
                {displayPercentage}%
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">وضعیت:</span>
              <span className="detail-value">{asset.status ?? "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">تاریخ پیش‌بینی:</span>
              <span className="detail-value">{formatPersianDateTime(asset.predicted_at) ?? "-"}</span>
            </div>
            {asset.predicted_failure_date && (
              <div className="detail-item">
                <span className="detail-label">پیش‌بینی خرابی:</span>
                <span className="detail-value" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                  {formatPersianDateTime(asset.predicted_failure_date)}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {assetPhotos.length > 0 && (
              <OverlayTrigger overlay={<Tooltip>مشاهده عکس‌ها ({assetPhotos.length})</Tooltip>}>
                <button
                  className="action-btn photo-btn"
                  onClick={handleOpenPhotoViewer}
                >
                  <FaRegImage size={14} />
                </button>
              </OverlayTrigger>
            )}

            {assetDocuments.length > 0 && (
              <OverlayTrigger overlay={<Tooltip>مشاهده اسناد ({assetDocuments.length})</Tooltip>}>
                <button
                  className="action-btn doc-btn"
                  onClick={handleOpenDocumentsViewer}
                >
                  <FaFileAlt size={14} />
                </button>
              </OverlayTrigger>
            )}

            <OverlayTrigger overlay={<Tooltip>تاریخچه تجهیز</Tooltip>}>
              <button
                className="action-btn history-btn"
                onClick={handleOpenHistoryModal}
              >
                <FaHistory size={14} />
              </button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>داده‌های سنسورها</Tooltip>}>
              <button
                className="action-btn sensor-btn"
                onClick={handleOpenSensorModal}
              >
                <FaCogs size={14} />
              </button>
            </OverlayTrigger>

            {modelUrl && (
              <OverlayTrigger overlay={<Tooltip>مشاهده مدل 3D</Tooltip>}>
                <button
                  className="action-btn model-btn"
                  onClick={() => setShowModelModal(true)}
                >
                  <FaCube size={14} />
                </button>
              </OverlayTrigger>
            )}
          </div>
        </div>
      </div>

      {/* ===== 3D Model Viewer Modal ===== */}
      {modelUrl && (
        <ModelViewerModal
          show={showModelModal}
          onHide={() => setShowModelModal(false)}
          asset={{
            ...asset,
            model_3d: modelUrl,
            name: assetName
          }}
        />
      )}

      {/* Keep your existing styles... */}
      <style jsx>{`
        .modern-failure-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
          position: relative;
        }

        .modern-failure-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .asset-image-container {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .asset-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: all 0.3s ease;
        }

        .asset-image.loading {
          filter: blur(4px);
        }

        .image-loading {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .image-error {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          z-index: 2;
        }

        .asset-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .asset-placeholder span {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .health-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .asset-content {
          padding: 1.5rem;
        }

        .asset-header {
          margin-bottom: 1.5rem;
        }

        .asset-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .asset-model {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
          font-weight: 500;
        }

        .asset-location {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .gauge-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .gauge-label {
          margin-top: 8px;
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .asset-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          justify-content: space-around;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .action-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .action-btn:hover::before {
          opacity: 1;
        }

        .photo-btn {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
        }

        .doc-btn {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
        }

        .history-btn {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .sensor-btn {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .model-btn {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .asset-content {
            padding: 1.25rem;
          }

          .asset-image-container {
            height: 140px;
          }

          .action-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </>
  );
};

export default AssetFailureCard;