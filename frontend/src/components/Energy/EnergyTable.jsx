import React, { useState } from "react";
import { Table, Card, Badge, Pagination } from "react-bootstrap";

// Persian datetime formatter
const formatTimestamp = (ts) => {
  if (!ts) return "-";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tehran",
  }).format(new Date(ts));
};

const EnergyTable = ({ predictions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // You can change this number

  if (!predictions || predictions.length === 0) {
    return <div className="text-center py-4">پیش‌بینی انرژی موجود نیست</div>;
  }

  // Group predictions by asset name (each row = 1 asset)
  const grouped = predictions.reduce((acc, p) => {
    if (!acc[p.asset_name]) acc[p.asset_name] = [];
    acc[p.asset_name].push(p);
    return acc;
  }, {});

  // Convert grouped object to array for pagination
  const assetEntries = Object.entries(grouped);

  // Calculate pagination
  const totalPages = Math.ceil(assetEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssets = assetEntries.slice(startIndex, startIndex + itemsPerPage);

  // Pagination items
  const getPaginationItems = () => {
    let items = [];

    // Previous button (قبلی)
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="pagination-item"
      >
        قبلی
      </Pagination.Prev>
    );

    // Page numbers
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
          className="pagination-item"
        >
          {number}
        </Pagination.Item>
      );
    }

    // Next button (بعدی)
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="pagination-item"
      >
        بعدی
      </Pagination.Next>
    );

    return items;
  };

  return (
    <div className="modern-table-card">
      <div className="table-header">
        <div className="table-title">
          <i className="fas fa-table"></i>
          <h5>جدول پیش‌بینی انرژی تجهیزات</h5>
        </div>
        <div className="table-subtitle">
          نمایش {startIndex + 1} تا {Math.min(startIndex + itemsPerPage, assetEntries.length)} از {assetEntries.length} تجهیز
        </div>
      </div>

      <div className="table-container">
        <Table hover responsive className="modern-table">
          <thead>
            <tr>
              <th className="table-header-cell">
                <i className="fas fa-industry me-2"></i>
                نام تجهیز
              </th>
              <th className="table-header-cell">
                <i className="fas fa-bolt me-2"></i>
                انرژی پیش‌بینی‌شده
              </th>
              <th className="table-header-cell">
                <i className="fas fa-clock me-2"></i>
                ساعت آینده
              </th>
              <th className="table-header-cell">
                <i className="fas fa-calendar me-2"></i>
                زمان پیش‌بینی
              </th>
              <th className="table-header-cell">
                <i className="fas fa-info-circle me-2"></i>
                وضعیت
              </th>
            </tr>
          </thead>
          <tbody>
            {currentAssets.map(([assetName, preds]) => {
              const latest = preds[preds.length - 1]; // latest prediction
              const energy = latest?.predicted_energy ?? null;
              const status =
                energy == null
                  ? "نامشخص"
                  : energy < 50
                  ? "بهینه"
                  : energy < 100
                  ? "متوسط"
                  : "بالا";

              const statusConfig = {
                "بهینه": { color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)", icon: "fas fa-check-circle" },
                "متوسط": { color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)", icon: "fas fa-exclamation-triangle" },
                "بالا": { color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)", icon: "fas fa-exclamation-circle" },
                "نامشخص": { color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)", icon: "fas fa-question-circle" }
              };

              const config = statusConfig[status];

              return (
                <tr key={assetName} className="table-row">
                  <td className="asset-name-cell">
                    <div className="asset-info">
                      <i className="fas fa-industry"></i>
                      <span className="fw-bold">{assetName}</span>
                    </div>
                  </td>
                  <td className="energy-cell">
                    <div className="energy-value">
                      <span className="energy-number">
                        {energy != null ? energy.toFixed(2) : "-"}
                      </span>
                      <span className="energy-unit">kWh</span>
                    </div>
                  </td>
                  <td className="time-cell">
                    <div className="time-info">
                      <i className="fas fa-clock"></i>
                      <span>{latest?.hours_ahead ?? "-"} ساعت</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <i className="fas fa-calendar"></i>
                      <span>{formatTimestamp(latest?.timestamp)}</span>
                    </div>
                  </td>
                  <td className="status-cell">
                    <div
                      className="status-badge"
                      style={{
                        backgroundColor: config.bgColor,
                        color: config.color,
                        borderColor: config.color
                      }}
                    >
                      <i className={config.icon}></i>
                      <span>{status}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <Pagination className="modern-pagination">
            {getPaginationItems()}
          </Pagination>

          {/* Page info */}
          <div className="pagination-info">
            <span className="page-info">
              صفحه {currentPage} از {totalPages}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .modern-table-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .table-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .table-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .table-title i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .table-title h5 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .table-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .table-container {
          flex: 1;
          overflow: auto;
          border-radius: 12px;
          border: 1px solid #f3f4f6;
          margin-bottom: 1.5rem;
        }

        .modern-table {
          margin: 0;
          border-collapse: separate;
          border-spacing: 0;
        }

        .modern-table thead th {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: none;
          padding: 1rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .modern-table tbody tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #f3f4f6;
        }

        .modern-table tbody tr:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .modern-table tbody td {
          padding: 1rem;
          border: none;
          vertical-align: middle;
          text-align: center;
        }

        .asset-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .asset-info i {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .energy-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .energy-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
        }

        .energy-unit {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .time-info, .date-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .time-info i, .date-info i {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid;
          font-size: 0.875rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .status-badge i {
          font-size: 0.75rem;
        }

        /* Pagination Styles */
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-top: 1px solid #f3f4f6;
          direction: rtl; /* RTL for Farsi */
        }

        .modern-pagination {
          margin: 0;
          direction: ltr; /* Keep numbers LTR */
        }

        .pagination-item {
          margin: 0 0.25rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
        }

        .pagination-item:hover {
          background-color: #f3f4f6;
          border-color: #d1d5db;
        }

        .pagination-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .pagination-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-info {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .modern-table-card {
            padding: 1.5rem;
          }

          .table-title {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modern-table thead th,
          .modern-table tbody td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }

          .asset-info, .time-info, .date-info {
            flex-direction: column;
            gap: 0.25rem;
          }

          .energy-value {
            gap: 0.125rem;
          }

          .energy-number {
            font-size: 1rem;
          }

          .pagination-container {
            flex-direction: column-reverse; /* Reverse for better mobile layout */
            gap: 1rem;
            text-align: center;
          }

          .modern-pagination {
            flex-wrap: wrap;
            justify-content: center;
          }

          .page-info {
            order: -1; /* Move page info to top on mobile */
          }
        }

        /* RTL specific adjustments */
        .pagination-container .page-info {
          direction: rtl;
        }
      `}</style>
    </div>
  );
};

export default EnergyTable;