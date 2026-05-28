// src/components/anomaly/AnomalyRecordsTable.jsx
import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaBell,
  FaCheckCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaTimes,
  FaDatabase,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

// Record Detail Modal Component
const RecordDetailModal = ({ record, onClose }) => {
  const severity = getAnomalySeverity(record.anomaly);
  const SeverityIcon = severity.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>جزئیات رکورد آنومالی #{record.id}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>تجهیز:</label>
              <span>{record.asset?.name} - {record.asset?.model}</span>
            </div>
            <div className="detail-item">
              <label>زمان ثبت:</label>
              <span>{formatTimestamp(record.timestamp)}</span>
            </div>
            <div className="detail-item">
              <label>وضعیت:</label>
              <span className={`status-badge ${severity.level}`}>
                <SeverityIcon className="status-icon" />
                {severity.label}
              </span>
            </div>
          </div>

          <div className="sensors-grid">
            <h4>مقادیر سنسورها</h4>
            <div className="sensors-container">
              <div className="sensor-item">
                <label>ارتعاش X:</label>
                <span>{formatSensorValue(record.vibration_x)} g</span>
              </div>
              <div className="sensor-item">
                <label>ارتعاش Y:</label>
                <span>{formatSensorValue(record.vibration_y)} g</span>
              </div>
              <div className="sensor-item">
                <label>ارتعاش Z:</label>
                <span>{formatSensorValue(record.vibration_z)} g</span>
              </div>
              <div className="sensor-item">
                <label>راندمان موتور:</label>
                <span>{formatSensorValue(record.motor_efficiency * 100)}%</span>
              </div>
              <div className="sensor-item">
                <label>دمای روغن:</label>
                <span>{formatSensorValue(record.oil_temp)} °C</span>
              </div>
              <div className="sensor-item">
                <label>فشار روغن:</label>
                <span>{formatSensorValue(record.oil_pressure)} bar</span>
              </div>
              <div className="sensor-item">
                <label>دور بر دقیقه:</label>
                <span>{formatSensorValue(record.rpm, 0)} RPM</span>
              </div>
              <div className="sensor-item">
                <label>ساعات کارکرد:</label>
                <span>{formatSensorValue(record.runtime_hours, 0)} h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getAnomalySeverity = (anomalyValue) => {
  switch(anomalyValue) {
    case -1:
      return { level: "critical", label: "بحرانی", color: "red", icon: FaExclamationTriangle };
    case 0:
      return { level: "normal", label: "عادی", color: "green", icon: FaCheckCircle };
    case 1:
      return { level: "warning", label: "هشدار", color: "yellow", icon: FaBell };
    default:
      return { level: "unknown", label: "نامشخص", color: "gray", icon: FaCheckCircle };
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatSensorValue = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals);
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange, totalItems }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          نمایش {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} از {totalItems} رکورد
        </span>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronRight />
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronLeft />
        </button>
      </div>

      <div className="page-size-selector">
        <label>تعداد در صفحه:</label>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="page-size-select"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

export default function AnomalyRecordsTable({
  records,
  loading,
  error,
  onRefresh
}) {
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Sort records
  const sortedRecords = [...records].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested fields
    if (sortField === "asset") {
      aValue = a.asset?.name;
      bValue = b.asset?.name;
    }

    // Handle date fields
    if (sortField === "timestamp") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalItems = sortedRecords.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = sortedRecords.slice(startIndex, startIndex + pageSize);

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return FaSort;
    return sortDirection === "asc" ? FaSortUp : FaSortDown;
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <FaExclamationTriangle />
          <span>{error}</span>
          <button onClick={onRefresh} className="retry-btn">
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>در حال بارگذاری رکوردها...</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <FaDatabase className="empty-icon" />
        <h3>هیچ رکورد آنومالی یافت نشد</h3>
        <p>داده‌های سنسورها در حال حاضر موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="records-container">
      <div className="records-header">
        <h2 className="records-title">جدول رکوردهای آنومالی</h2>
        <div className="records-count">
          {totalItems} رکورد یافت شد
        </div>
      </div>

      <div className="table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th
                className="sortable"
                onClick={() => handleSort("id")}
              >
                <div className="th-content">
                  <span>شناسه</span>
                  {React.createElement(getSortIcon("id"))}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort("asset")}
              >
                <div className="th-content">
                  <span>تجهیز</span>
                  {React.createElement(getSortIcon("asset"))}
                </div>
              </th>
              <th
                className="sortable"
                onClick={() => handleSort("timestamp")}
              >
                <div className="th-content">
                  <span>زمان</span>
                  {React.createElement(getSortIcon("timestamp"))}
                </div>
              </th>
              <th>ارتعاش X</th>
              <th>ارتعاش Y</th>
              <th>ارتعاش Z</th>
              <th>راندمان موتور</th>
              <th>دمای روغن</th>
              <th>فشار روغن</th>
              <th>دور بر دقیقه</th>
              <th>ساعات کارکرد</th>
              <th>وضعیت</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map(record => {
              const severity = getAnomalySeverity(record.anomaly);
              const SeverityIcon = severity.icon;

              return (
                <tr key={record.id} className="record-row">
                  <td className="record-id">#{record.id}</td>
                  <td className="asset-cell">
                    <div className="asset-info">
                      <div className="asset-name">{record.asset?.name}</div>
                      <div className="asset-model">{record.asset?.model}</div>
                    </div>
                  </td>
                  <td className="timestamp-cell">
                    {formatTimestamp(record.timestamp)}
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.vibration_x)} g
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.vibration_y)} g
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.vibration_z)} g
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.motor_efficiency * 100)}%
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.oil_temp)} °C
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.oil_pressure)} bar
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.rpm, 0)} RPM
                  </td>
                  <td className="sensor-value">
                    {formatSensorValue(record.runtime_hours, 0)} h
                  </td>
                  <td className="status-cell">
                    <div className={`status-badge ${severity.level}`}>
                      <SeverityIcon className="status-icon" />
                      <span>{severity.label}</span>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <FaEye />
                      <span>جزئیات</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalItems={totalItems}
        />
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <style jsx>{`
        .records-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .records-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .records-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .records-count {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .records-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }

        .records-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: right;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }

        .records-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          text-align: right;
          font-size: 0.875rem;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
        }

        .sortable:hover {
          background: #f1f5f9;
        }

        .th-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .record-row:hover {
          background: #f8fafc;
        }

        .record-id {
          font-weight: 600;
          color: #6b7280;
        }

        .asset-cell {
          min-width: 150px;
        }

        .asset-name {
          font-weight: 600;
          color: #1f2937;
        }

        .asset-model {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .timestamp-cell {
          color: #6b7280;
          white-space: nowrap;
        }

        .sensor-value {
          font-family: 'Courier New', monospace;
          font-weight: 500;
          color: #1f2937;
        }

        .status-cell {
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.critical {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .status-badge.warning {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fed7aa;
        }

        .status-badge.normal {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .status-badge.unknown {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .status-icon {
          font-size: 0.875rem;
        }

        .actions-cell {
          white-space: nowrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn {
          background: #3b82f6;
          color: white;
        }

        .view-btn:hover {
          background: #2563eb;
        }

        /* Pagination Styles */
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .page-size-select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .page-size-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .detail-item label {
          font-weight: 600;
          color: #374151;
        }

        .sensors-grid h4 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .sensors-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .sensor-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .sensor-item label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .sensor-item span {
          font-weight: 600;
          color: #1f2937;
          font-family: 'Courier New', monospace;
        }

        /* Error State */
        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 2rem;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          max-width: 400px;
        }

        .retry-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          margin-right: auto;
        }

        .retry-btn:hover {
          background: #b91c1c;
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem 2rem;
          color: #6b7280;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem 2rem;
          text-align: center;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 3rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.875rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .pagination-container {
            flex-direction: column;
            gap: 1rem;
          }

          .pagination-controls {
            order: -1;
          }

          .records-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}