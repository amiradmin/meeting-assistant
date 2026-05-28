// src/components/anomaly/AnomalyRecordsActionBar.jsx
import React from "react";
import { FaSearch, FaFilter, FaSync } from "react-icons/fa";

export default function AnomalyRecordsActionBar({
  searchTerm,
  onSearchChange,
  assetFilter,
  onAssetFilterChange,
  anomalyFilter,
  onAnomalyFilterChange,
  assets,
  refreshing,
  onRefresh
}) {
  return (
    <div className="action-bar">
      <div className="search-filters-section">
        <div className="search-container">
          <div className="search-icon">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="جستجو در رکوردها..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <div className="filter-icon">
              <FaFilter />
            </div>
            <select
              value={assetFilter}
              onChange={(e) => onAssetFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">همه تجهیزات</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={anomalyFilter}
              onChange={(e) => onAnomalyFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="critical">آنومالی بحرانی</option>
              <option value="warning">هشدار</option>
              <option value="normal">عادی</option>
            </select>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <button
          className="refresh-btn"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <FaSync className={refreshing ? "spinning" : ""} />
          <span>بروزرسانی</span>
        </button>
      </div>

      <style jsx>{`
        .action-bar {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .search-filters-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          z-index: 2;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          font-size: 1rem;
          color: #1f2937;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #7c3aed;
          background: white;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .filters-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          color: #6b7280;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #7c3aed;
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .refresh-btn {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .action-bar {
            flex-direction: column;
            gap: 1.5rem;
          }

          .search-filters-section {
            width: 100%;
          }

          .actions-section {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .search-filters-section {
            flex-direction: column;
            gap: 1rem;
          }

          .search-container {
            max-width: 100%;
          }

          .filters-container {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 480px) {
          .actions-section {
            flex-direction: column;
            width: 100%;
          }

          .refresh-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}