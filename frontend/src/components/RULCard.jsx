import React, { useState, useEffect } from "react";
import { Card, ProgressBar, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  FaInfoCircle,
  FaRegImage,
  FaFileAlt,
  FaCogs,
  FaHistory
} from "react-icons/fa";
import "react-circular-progressbar/dist/styles.css";

// Utility function for formatting RUL hours
const formatRULText = (hours) => {
  if (!hours && hours !== 0) return "-";
  return `${Math.round(hours)} ساعت`;
};

// Example priority/status indicator component
const PriorityIndicator = ({ priority }) => (
  <Badge bg={priority === "high" ? "danger" : priority === "medium" ? "warning" : "success"}>
    {priority?.toUpperCase() || "LOW"}
  </Badge>
);

// Example status badge based on RUL percent
const StatusBadge = ({ percent }) => (
  <Badge bg={percent > 60 ? "success" : percent > 30 ? "warning" : "danger"}>
    {percent > 60 ? "GOOD" : percent > 30 ? "MEDIUM" : "CRITICAL"}
  </Badge>
);

// Helper to ensure full media URL
const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path; // already full URL
  return `http://192.168.150.10:8000${path}`;
};

const RULCard = ({ asset, rulPercent, rulHours, priority = "low", status, openPhotoViewer, openDocumentsViewer, openSensorModal, openHistoryModal }) => {
  const [thumbnail, setThumbnail] = useState(null);

  // Update thumbnail when asset changes
  useEffect(() => {
    if (asset?.asset_thumbnail) setThumbnail(getMediaUrl(asset.asset_thumbnail));
  }, [asset]);

  return (
    <Card className="shadow-sm h-100 border-0" style={{ borderRadius: '12px', overflow: 'hidden', transition: '0.3s' }}>
      {/* Header */}
      <Card.Header className="bg-transparent border-bottom-0 pb-0 d-flex justify-content-between align-items-start">
        <PriorityIndicator priority={priority} />
        <StatusBadge percent={rulPercent} />
      </Card.Header>

      {/* Thumbnail */}
      {thumbnail && (
        <div style={{ height: 120, overflow: "hidden", borderRadius: "12px" }}>
          <img
            src={thumbnail}
            alt={asset.asset_name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Body */}
      <Card.Body className="text-center pt-2">
        <h6 className="fw-bold mb-2 text-truncate">{asset.asset_name}</h6>
        <div className="text-muted small mb-2">
          {asset.serial_number && <div>شماره سریال: {asset.serial_number}</div>}
          {asset.model && <div>مدل: {asset.model}</div>}
        </div>

        {/* Circular Progress */}
        <div style={{ width: 120, height: 120, margin: '0 auto 12px' }}>
          <CircularProgressbar
            value={rulPercent}
            text={`${Math.round(rulPercent)}%`}
            styles={buildStyles({
              pathColor: status?.color || "#3498db",
              textColor: '#2c3e50',
              trailColor: '#ecf0f1',
              textSize: '16px'
            })}
          />
        </div>

        {/* RUL ProgressBar */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted">عمر باقی‌مانده:</small>
            <strong className="text-dark">{formatRULText(rulHours)}</strong>
          </div>

          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{formatRULText(rulHours)}</Tooltip>}
          >
            <ProgressBar
              now={rulPercent}
              variant={rulPercent > 60 ? "success" : rulPercent > 30 ? "warning" : "danger"}
              style={{ height: '8px', borderRadius: '6px', cursor: 'pointer' }}
            />
          </OverlayTrigger>

          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">۰ ساعت</small>
            <small className="text-muted">{asset.expected_lifetime_hours || 1000} ساعت</small>
          </div>
        </div>

        {/* Confidence */}
        {asset.confidence !== undefined && asset.confidence !== null && (
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small className="text-muted d-flex align-items-center gap-1"><FaInfoCircle /> اطمینان پیش‌بینی:</small>
            <Badge bg="outline-primary" text="dark">{asset.confidence}%</Badge>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex justify-content-around mt-3 pt-2 border-top">
          <div className="action-icon" title="مشاهده عکس‌ها" onClick={() => openPhotoViewer(asset.asset || asset.asset_id || asset.id)}>
            <FaRegImage size={18} />
          </div>

          <div className="action-icon" title="مشاهده اسناد" onClick={() => openDocumentsViewer(asset.asset || asset.asset_id || asset.id)}>
            <FaFileAlt size={18} />
          </div>

          <div className="action-icon" title="سنسورها" onClick={() => openSensorModal(asset)}>
            <FaCogs size={18} />
          </div>

          <div className="action-icon" title="تاریخچه" onClick={() => openHistoryModal(asset.asset || asset.asset_id || asset.id)}>
            <FaHistory size={18} />
          </div>
        </div>

        <style jsx>{`
          .action-icon { cursor: pointer; color: #3498db; transition: transform 0.15s, color 0.15s; }
          .action-icon:hover { transform: scale(1.2); color: #2c3e50; }
        `}</style>
      </Card.Body>

      {/* Footer */}
      <Card.Footer className="bg-transparent border-top-0 text-center" style={{ fontSize: '.8rem', color: '#7f8c8d' }}>
        آخرین بروزرسانی: {asset.created_at ? new Date(asset.created_at).toLocaleString('fa-IR') : "-"}
      </Card.Footer>
    </Card>
  );
};

export default RULCard;
