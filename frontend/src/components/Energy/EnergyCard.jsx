import React, { useState, useMemo, useEffect } from "react";
import { Card, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FaIndustry,
  FaExclamationTriangle,
  FaRegImage,
  FaFileAlt,
  FaCogs,
  FaHistory,
  FaCube,
  FaHeart,
  FaRegHeart,
  FaComments // NEW: Import chat icon
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

const EnergyCard = ({
  asset = {},
  prediction = null,
  onOpenPhotoViewer,
  onOpenDocumentsViewer,
  onOpenSensorModal,
  onOpenHistoryModal,
  onLikeAsset,
  isLiked = false
}) => {
  const latest = asset.latest ?? {};
  const predicted = prediction?.predicted_energy ?? 0;
  const confidence = prediction?.confidence ?? null;
  const created_at = prediction?.created_at ?? null;

  const normalizedPercent = useMemo(() => {
    const val = Number(predicted) || 0;
    return Math.max(0, Math.min(100, (val / 100) * 100));
  }, [predicted]);

  const getAssetId = () => asset.id || asset.asset_id || asset.asset;
  const getAssetName = () => asset.name || asset.asset_name || `Asset ${getAssetId()}`;

  const getImageUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes("localhost:8000")) return `${url}?t=${Date.now()}`;
      if (url.includes("localhost/media") && !url.includes("localhost:8000")) {
        return `${url.replace("localhost/media", "localhost:8000/media")}?t=${Date.now()}`;
      }
      return `${url}?t=${Date.now()}`;
    } catch {
      return url;
    }
  };

  const rawThumb = asset.asset_thumbnail ?? asset.photos?.[0]?.image ?? null;
  const thumbnailUrl = rawThumb ? getImageUrl(rawThumb) : null;

  // Debug: Log photos data
  console.log('Asset photos:', asset.photos);

  const [imageLoading, setImageLoading] = useState(!!thumbnailUrl);
  const [imageError, setImageError] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likeLoading, setLikeLoading] = useState(false);

  const assetName = getAssetName();
  const assetModel = asset.model ?? "";
  const modelUrl = asset.model_3d ?? null;

  // Enhanced photo handler - FIXED
  const handlePhotoClick = () => {
    console.log('Photo button clicked for asset:', assetName);
    console.log('Available photos:', asset.photos);

    if (asset.photos && Array.isArray(asset.photos) && asset.photos.length > 0) {
      // Pass the photos array directly to the photo viewer
      onOpenPhotoViewer(asset.photos);
    } else {
      alert(`هیچ تصویری برای تجهیز "${assetName}" موجود نیست`);
    }
  };

  // Enhanced documents handler
  const handleDocumentsClick = () => {
    console.log('Documents button clicked for asset:', assetName);
    console.log('Available documents:', asset.documents);

    if (asset.documents && Array.isArray(asset.documents) && asset.documents.length > 0) {
      onOpenDocumentsViewer(asset.documents);
    } else {
      alert(`هیچ سندی برای تجهیز "${assetName}" موجود نیست`);
    }
  };

  // Handle chat button click
  const handleChatClick = () => {
    const assetId = getAssetId();
    const assetNameEncoded = encodeURIComponent(getAssetName());
    // Open AI chat in new tab with asset context
    window.open(`/ai-chat?asset=${assetId}&name=${assetNameEncoded}`, '_blank');
  };

  // Handle like button click
  const handleLikeClick = async () => {
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      if (onLikeAsset) {
        const success = await onLikeAsset(getAssetId(), !liked);
        if (success) {
          setLiked(!liked);
        }
      } else {
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Error liking asset:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Sync with parent's isLiked prop
  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  // Determine energy status and color
  const getEnergyStatus = () => {
    if (normalizedPercent <= 33) return { status: 'low', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
    if (normalizedPercent <= 66) return { status: 'medium', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' };
    return { status: 'high', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
  };

  const energyStatus = getEnergyStatus();

  return (
    <>
      <div className="modern-asset-card">
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
                onLoad={() => { setImageLoading(false); setImageError(false); }}
                onError={() => { setImageLoading(false); setImageError(true); }}
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

          {/* Energy Status Badge */}
          <div
            className="energy-badge"
            style={{
              backgroundColor: energyStatus.color,
              color: 'white'
            }}
          >
            <i className="fas fa-bolt"></i>
            <span>{normalizedPercent.toFixed(0)}%</span>
          </div>

          {/* Like Button */}
          <OverlayTrigger overlay={<Tooltip>{liked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}</Tooltip>}>
            <button
              className={`like-btn ${liked ? 'liked' : ''} ${likeLoading ? 'loading' : ''}`}
              onClick={handleLikeClick}
              disabled={likeLoading}
            >
              {likeLoading ? (
                <Spinner animation="border" size="sm" />
              ) : liked ? (
                <FaHeart size={16} />
              ) : (
                <FaRegHeart size={16} />
              )}
            </button>
          </OverlayTrigger>
        </div>

        {/* Card Content */}
        <div className="asset-content">
          <div className="asset-header">
            <h6 className="asset-name" title={assetName}>{assetName}</h6>
            {assetModel && <p className="asset-model">{assetModel}</p>}
          </div>

          {/* Energy Gauge */}
          <div className="gauge-container">
            <SVGGauge value={normalizedPercent**2/10} label={`${(predicted * 1000).toFixed(0)} Wh`} />
            <div className="gauge-label">مصرف انرژی پیش‌بینی شده</div>
          </div>

          {/* Energy Details */}
          <div className="energy-details">
            <div className="detail-item">
              <span className="detail-label">تاریخ پیش‌بینی:</span>
              <span className="detail-value">{formatPersianDateTime(created_at) ?? "-"} </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">پیش‌بینی:</span>
              <span className="detail-value">{(predicted).toFixed(2)} Wh</span>
            </div>
            {confidence !== null && (
              <div className="detail-item">
                <span className="detail-label">اعتماد مدل:</span>
                <span className="detail-value">{confidence}%</span>
              </div>
            )}
          </div>

          {/* Action Buttons - FIXED HANDLERS */}
          <div className="action-buttons">
            {getAssetId() && (
              <>
                {/* Chat Button - NEW */}
                <OverlayTrigger overlay={<Tooltip>چت با هوش مصنوعی</Tooltip>}>
                  <button
                    className="action-btn chat-btn"
                    onClick={handleChatClick}
                  >
                    <FaComments size={14} />
                  </button>
                </OverlayTrigger>

                {/* Photo Button - FIXED */}
                <OverlayTrigger overlay={<Tooltip>مشاهده عکس‌ها</Tooltip>}>
                  <button
                    className="action-btn photo-btn"
                    onClick={handlePhotoClick}
                  >
                    <FaRegImage size={14} />
                  </button>
                </OverlayTrigger>

                {/* Documents Button - FIXED */}
                <OverlayTrigger overlay={<Tooltip>مشاهده اسناد</Tooltip>}>
                  <button
                    className="action-btn doc-btn"
                    onClick={handleDocumentsClick}
                  >
                    <FaFileAlt size={14} />
                  </button>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip>تاریخچه تجهیز</Tooltip>}>
                  <button
                    className="action-btn history-btn"
                    onClick={() => onOpenHistoryModal(getAssetId())}
                  >
                    <FaHistory size={14} />
                  </button>
                </OverlayTrigger>
              </>
            )}

            <OverlayTrigger overlay={<Tooltip>داده‌های سنسورها</Tooltip>}>
              <button
                className="action-btn sensor-btn"
                onClick={() => onOpenSensorModal(asset)}
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

      {/* ===== Model Viewer Modal ===== */}
      {modelUrl && (
        <ModelViewerModal
          show={showModelModal}
          onHide={() => setShowModelModal(false)}
          asset={asset}
        />
      )}

      {/* Modern Asset Card Styles */}
      <style jsx>{`
        .modern-asset-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
          position: relative;
        }

        .modern-asset-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .asset-image-container {
          position: relative;
          height: 160px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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

        .energy-badge {
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
          z-index: 3;
        }

        /* Like Button Styles */
        .like-btn {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 3;
          color: #6b7280;
        }

        .like-btn:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.95);
        }

        .like-btn.liked {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .like-btn.loading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .like-btn:disabled {
          cursor: not-allowed;
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
          margin: 0;
          font-weight: 500;
        }

        .gauge-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .gauge-label {
          margin-top: 8px;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .energy-details {
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

        /* Chat Button Style - NEW */
        .chat-btn {
          background: linear-gradient(135deg, #10b981, #059669);
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

          .like-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </>
  );
};

export default EnergyCard;