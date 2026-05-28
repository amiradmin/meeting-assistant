// components/RUL/RULCard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Card, Badge, ProgressBar, Tooltip, OverlayTrigger, Spinner } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  FaInfoCircle,
  FaRegImage,
  FaFileAlt,
  FaHistory,
  FaCogs,
  FaIndustry,
  FaExclamationTriangle,
} from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import PriorityIndicator from "./PriorityIndicator";
import { formatRULText, getRULPercent, getRULStatus, getPriority } from "../../utils/rulHelpers";
import SVGGauge from "./SVGGauge";

const MAX_RUL = 300;

const RULCard = ({
  asset,
  onOpenPhotoViewer,
  onOpenDocumentsViewer,
  onOpenSensorModal,
  onOpenHistoryModal,
}) => {
  const rulPercent = getRULPercent(asset.predicted_rul || 0, MAX_RUL);
  const rulHours = asset.predicted_rul || 0;
  const status = getRULStatus(rulPercent);
  const priority = getPriority(rulPercent);

  const [imageLoading, setImageLoading] = useState(!!asset?.asset_thumbnail);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    setImageError(true);
    console.error("Failed to load image:", asset?.asset_thumbnail, e);
  };

  // Fixed handler functions
  const handlePhotoClick = () => {
    console.log('Photo button clicked for asset:', asset.asset_name);
    console.log('Asset photos data:', asset.photos);
    
    if (asset.photos && Array.isArray(asset.photos) && asset.photos.length > 0) {
      onOpenPhotoViewer(asset.photos);
    } else {
      alert('هیچ تصویری برای این تجهیز موجود نیست');
    }
  };

  const handleDocumentsClick = () => {
    console.log('Documents button clicked for asset:', asset.asset_name);
    console.log('Asset documents data:', asset.documents);
    
    if (asset.documents && Array.isArray(asset.documents) && asset.documents.length > 0) {
      onOpenDocumentsViewer(asset.documents);
    } else {
      alert('هیچ سندی برای این تجهیز موجود نیست');
    }
  };

  const handleSensorClick = () => {
    console.log('Sensor button clicked for asset:', asset.asset_name);
    onOpenSensorModal(asset);
  };

  const handleHistoryClick = () => {
    console.log('History button clicked for asset:', asset.asset_name);
    onOpenHistoryModal(asset);
  };

  const getAssetId = () => asset.asset || asset.asset_id || asset.id;

  // Force absolute URL with cache busting
  const getImageUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes("localhost:8000")) return `${url}?t=${Date.now()}`;
      if (url.includes("localhost/media") && !url.includes("localhost:8000")) {
        const fixedUrl = url.replace("localhost/media", "localhost:8000/media");
        return `${fixedUrl}?t=${Date.now()}`;
      }
      return `${url}?t=${Date.now()}`;
    } catch (error) {
      console.error("Error processing image URL:", error);
      return url;
    }
  };

  const thumbnailUrl = asset?.asset_thumbnail ? getImageUrl(asset.asset_thumbnail) : null;

  return (
    <>
      <div className="modern-rul-card">
        {/* Card Header with Image */}
        <div className="asset-image-container">
          {thumbnailUrl ? (
            <>
              {imageLoading && (
                <div className="image-loading">
                  <Spinner animation="border" size="sm" />
                  <small>در حال بارگذاری تصویر...</small>
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
                alt={`تصویر ${asset.asset_name}`}
                className={`asset-image ${imageLoading ? 'loading' : ''} ${imageError ? 'error' : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous"
                loading="lazy"
              />
            </>
          ) : (
            <div className="asset-placeholder">
              <FaIndustry size={40} />
              <span>{asset.asset_name}</span>
            </div>
          )}
          
          {/* RUL Status Badge */}
          <div 
            className="rul-badge" 
            style={{ 
              backgroundColor: status.color,
              color: 'white'
            }}
          >
            <i className="fas fa-clock"></i>
            <span>{Math.round(rulPercent)}%</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="asset-content">
          <div className="asset-header">
            <h6 className="asset-name" title={asset.asset_name}>{asset.asset_name}</h6>
            <div className="asset-details">
              {asset.serial_number && (
                <div className="detail-item">
                  <span className="detail-label">شماره سریال:</span>
                  <span className="detail-value">{asset.serial_number}</span>
                </div>
              )}
              {asset.model && (
                <div className="detail-item">
                  <span className="detail-label">مدل:</span>
                  <span className="detail-value">{asset.model}</span>
                </div>
              )}
            </div>
          </div>

          {/* RUL Gauge */}
          <div className="gauge-container">
            <SVGGauge value={`${Math.round(rulPercent)}`} label={`${Math.round(rulPercent)}%`} />
            <div className="gauge-label">عمر باقی‌مانده</div>
          </div>

          {/* RUL Details */}
          <div className="rul-details">
            <div className="rul-info">
              <div className="rul-value">
                <span className="rul-hours">{formatRULText(rulHours)}</span>
                <span className="rul-status" style={{ color: status.color }}>
                  {rulPercent > 60 ? "سالم" : rulPercent > 30 ? "هشدار" : "بحرانی"}
                </span>
              </div>
              
              <div className="rul-progress">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${rulPercent}%`,
                      backgroundColor: status.color
                    }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span>۰ ساعت</span>
                  <span>{MAX_RUL} ساعت</span>
                </div>
              </div>
            </div>

            {asset.confidence !== undefined && asset.confidence !== null && (
              <div className="confidence-info">
                <span className="confidence-label">اطمینان پیش‌بینی:</span>
                <div className="confidence-badge">
                  <FaInfoCircle size={12} />
                  <span>{asset.confidence}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - FIXED HANDLERS */}
          <div className="action-buttons">
            <OverlayTrigger overlay={<Tooltip>مشاهده عکس‌ها</Tooltip>}>
              <button 
                className="action-btn photo-btn" 
                onClick={handlePhotoClick}
              >
                <FaRegImage size={14} />
              </button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>مشاهده اسناد</Tooltip>}>
              <button 
                className="action-btn doc-btn" 
                onClick={handleDocumentsClick}
              >
                <FaFileAlt size={14} />
              </button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>داده‌های سنسورها</Tooltip>}>
              <button 
                className="action-btn sensor-btn" 
                onClick={handleSensorClick}
              >
                <FaCogs size={14} />
              </button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>تاریخچه تجهیز</Tooltip>}>
              <button 
                className="action-btn history-btn" 
                onClick={handleHistoryClick}
              >
                <FaHistory size={14} />
              </button>
            </OverlayTrigger>
          </div>

          {/* Footer */}
          <div className="card-footer">
            <span className="last-update">
              آخرین بروزرسانی: {asset.created_at ? new Date(asset.created_at).toLocaleString("fa-IR") : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Modern RUL Card Styles */}
      <style jsx>{`
        .modern-rul-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
          position: relative;
        }
        
        .modern-rul-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }
        
        .asset-image-container {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: #6b7280;
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
        
        .rul-badge {
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
          margin: 0 0 1rem 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .asset-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }
        
        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .detail-value {
          color: #1f2937;
          font-weight: 600;
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
        
        .rul-details {
          margin-bottom: 1.5rem;
        }
        
        .rul-info {
          margin-bottom: 1rem;
        }
        
        .rul-value {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .rul-hours {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .rul-status {
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .rul-progress {
          margin-bottom: 1rem;
        }
        
        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }
        
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .confidence-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-top: 1px solid #f3f4f6;
        }
        
        .confidence-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .confidence-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }
        
        .action-buttons {
          display: flex;
          justify-content: space-around;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
          margin-bottom: 1rem;
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
        
        .sensor-btn {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .history-btn {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .card-footer {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        
        .last-update {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
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

export default RULCard;