import React from "react";
import { Table, Card, Badge } from "react-bootstrap";

// 🕒 Formatter for Persian date/time
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(new Date(dateStr));
};

const AssetFailureTable = ({ assets }) => {
  if (!assets || assets.length === 0) {
    return <div className="text-center py-4">هیچ داده‌ای برای خرابی تجهیزات یافت نشد</div>;
  }

  return (
    <div className="modern-failure-table-card">
      <div className="table-header">
        <div className="table-title">
          <i className="fas fa-table"></i>
          <h5>جدول پیش‌بینی خرابی تجهیزات</h5>
        </div>
        <div className="table-subtitle">جزئیات کامل پیش‌بینی‌های خرابی و وضعیت تجهیزات</div>
      </div>
      
      <div className="table-container">
        <Table hover responsive className="modern-table">
          <thead>
            <tr>
              <th className="table-header-cell">
                <i className="fas fa-industry me-2"></i>
                شناسه تجهیز
              </th>
              <th className="table-header-cell">
                <i className="fas fa-percentage me-2"></i>
                احتمال خرابی
              </th>
              <th className="table-header-cell">
                <i className="fas fa-heartbeat me-2"></i>
                وضعیت سلامت
              </th>
              <th className="table-header-cell">
                <i className="fas fa-calendar me-2"></i>
                تاریخ پیش‌بینی خرابی
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => {
              const probability = a.failure_probability !== null ? a.failure_probability * 100 : null;
              const formattedProb = probability !== null ? probability.toFixed(1) + "%" : "N/A";

              const statusConfig = {
                high: { color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)", icon: "fas fa-exclamation-triangle", text: "بحرانی" },
                medium: { color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)", icon: "fas fa-exclamation-circle", text: "متوسط" },
                low: { color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)", icon: "fas fa-check-circle", text: "پایدار" },
                unknown: { color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)", icon: "fas fa-question-circle", text: "نامشخص" }
              };

              let statusKey = "unknown";
              if (probability >= 70) statusKey = "high";
              else if (probability >= 40) statusKey = "medium";
              else if (probability >= 0) statusKey = "low";

              const config = statusConfig[statusKey];

              return (
                <tr key={a.asset_id} className="table-row">
                  <td className="asset-id-cell">
                    <div className="asset-info">
                      <i className="fas fa-industry"></i>
                      <span className="fw-bold">{a.asset_id}</span>
                    </div>
                  </td>
                  <td className="probability-cell">
                    <div className="probability-value">
                      <span className="probability-number">
                        {probability !== null ? probability.toFixed(1) : "N/A"}
                      </span>
                      <span className="probability-unit">%</span>
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
                      <span>{config.text}</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-info">
                      <i className="fas fa-calendar"></i>
                      <span>{formatDate(a.predicted_failure_date)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <style jsx>{`
        .modern-failure-table-card {
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
          color: #ef4444;
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
        }
        
        .modern-table {
          margin: 0;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .modern-table thead th {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
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
          background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);
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
        
        .probability-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .probability-number {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .probability-unit {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .date-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }
        
        .date-info i {
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
        
        @media (max-width: 768px) {
          .modern-failure-table-card {
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
          
          .asset-info, .date-info {
            flex-direction: column;
            gap: 0.25rem;
          }
          
          .probability-value {
            gap: 0.125rem;
          }
          
          .probability-number {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AssetFailureTable;
