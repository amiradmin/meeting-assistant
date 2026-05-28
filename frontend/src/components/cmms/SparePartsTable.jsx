// src/components/cmms/SparePartsTable.jsx
import React, { useState } from "react";
import { deleteSparePart } from "../../services/cmmsService";
import {
  FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown,
  FaMapMarkerAlt, FaHashtag, FaBox,
  FaChevronRight, FaChevronLeft, FaEllipsisH
} from "react-icons/fa";

export default function SparePartsTable({ spareParts, loading, onEdit, onDelete }) {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("آیا از حذف این قطعه مطمئن هستید؟")) return;
    try {
      await deleteSparePart(id);
      onDelete();
    } catch (err) {
      alert("خطا در حذف قطعه: " + err.message);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStockConfig = (quantity) => {
    if (quantity === 0) {
      return {
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        text: 'اتمام موجودی',
        icon: '❌'
      };
    } else if (quantity <= 5) {
      return {
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
        text: 'موجودی کم',
        icon: '⚠️'
      };
    } else {
      return {
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        text: 'موجود',
        icon: '✅'
      };
    }
  };

  const formatPrice = (price) => {
    if (!price) return "-";
    return price.toLocaleString() + " ریال";
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Sort spare parts
  const sortedSpareParts = [...spareParts].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalItems = sortedSpareParts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedSpareParts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
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

  if (loading) {
    return (
      <div className="modern-table-container">
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری قطعات یدکی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-table-container">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-title-section">
          <h3 className="table-title">لیست قطعات یدکی</h3>
          <div className="table-stats">
            <span className="stat-badge">
              {spareParts.length} قطعه
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-content">
        {sortedSpareParts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBox size={64} />
            </div>
            <h4>قطعه‌ای یافت نشد</h4>
            <p>هنوز هیچ قطعه‌ای ثبت نشده است.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSort("name")}
                    >
                      <div className="th-content">
                        <span>نام قطعه</span>
                        {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("part_number")}
                    >
                      <div className="th-content">
                        <FaHashtag className="th-icon" />
                        <span>شماره قطعه</span>
                        {getSortIcon("part_number")}
                      </div>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("quantity_in_stock")}
                    >
                      <div className="th-content">
                        <span>موجودی</span>
                        {getSortIcon("quantity_in_stock")}
                      </div>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("unit_price")}
                    >
                      <div className="th-content">
                        <span>قیمت واحد</span>
                        {getSortIcon("unit_price")}
                      </div>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("location")}
                    >
                      <div className="th-content">
                        <FaMapMarkerAlt className="th-icon" />
                        <span>محل نگهداری</span>
                        {getSortIcon("location")}
                      </div>
                    </th>
                    <th className="actions-header">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((part) => {
                    const stock = getStockConfig(part.quantity_in_stock);

                    return (
                      <tr key={part.id} className="table-row">
                        <td className="name-cell">
                          <div className="name-content">
                            <div className="name-text" style={{ color: "black" }}>
                              {part.name}
                            </div>
                          </div>
                        </td>
                        <td className="part-number-cell">
                          <div className="part-number-info">
                            <FaHashtag className="part-number-icon" />
                            <span>{part.part_number}</span>
                          </div>
                        </td>
                        <td className="stock-cell">
                          <div className="stock-info">
                            <div
                              className="stock-badge"
                              style={{
                                backgroundColor: stock.bg,
                                color: stock.color,
                                borderColor: stock.color
                              }}
                            >
                              <span className="stock-icon">{stock.icon}</span>
                              <span>{stock.text}</span>
                            </div>
                            <div className="quantity-text">
                              ({part.quantity_in_stock} عدد)
                            </div>
                          </div>
                        </td>
                        <td className="price-cell">
                          <div className="price-info">
                            <span>{formatPrice(part.unit_price)}</span>
                          </div>
                        </td>
                        <td className="location-cell">
                          <div className="location-info">
                            <FaMapMarkerAlt className="location-icon" />
                            <span>{part.location || "-"}</span>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <div className="actions-buttons">
                            <button
                              className="btn-action btn-edit"
                              onClick={() => onEdit(part)}
                              title="ویرایش"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={(e) => handleDelete(part.id, e)}
                              title="حذف"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>
                    نمایش {startIndex + 1} تا {Math.min(endIndex, totalItems)} از {totalItems} مورد
                  </span>
                </div>

                <div className="pagination-controls">
                  <div className="items-per-page">
                    <label>تعداد در صفحه:</label>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="page-select"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <div className="pagination-buttons">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaChevronRight />
                    </button>

                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="pagination-ellipsis">
                        <FaEllipsisH />
                      </span>
                    )}

                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FaChevronLeft />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .modern-table-container {
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
          backdrop-filter: blur(20px);
        }

        .table-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .table-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }

        .table-stats {
          display: flex;
          gap: 0.5rem;
        }

        .stat-badge {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .table-content {
          min-height: 400px;
        }

        .table-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f1f5f9;
          border-top: 3px solid #059669;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .empty-state h4 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: #475569;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .modern-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .modern-table thead {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }

        .modern-table th {
          padding: 1rem 1.5rem;
          text-align: right;
          font-weight: 600;
          color: #475569;
          font-size: 0.875rem;
          border-bottom: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .th-icon {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .sortable:hover {
          background: #f1f5f9;
        }

        .actions-header {
          cursor: default !important;
        }

        .actions-header:hover {
          background: #f8fafc !important;
        }

        .table-row {
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .table-row:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .modern-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .name-cell {
          min-width: 200px;
        }

        .name-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .name-text {
          font-weight: 600;
          color: #475569;
          font-size: 0.95rem;
        }

        .part-number-cell {
          min-width: 150px;
        }

        .part-number-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #475569;
          font-weight: 500;
        }

        .part-number-icon {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .stock-cell {
          min-width: 140px;
        }

        .stock-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stock-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          border-radius: 20px;
          border: 1px solid;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          width: fit-content;
        }

        .stock-icon {
          font-size: 0.7rem;
        }

        .quantity-text {
          font-size: 0.8rem;
          color: #64748b;
        }

        .price-cell {
          min-width: 120px;
        }

        .price-info {
          color: #475569;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .location-cell {
          min-width: 150px;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .location-icon {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .actions-cell {
          min-width: 100px;
        }

        .actions-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-action {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .btn-edit {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .btn-edit:hover {
          background: #3b82f6;
          color: white;
          transform: scale(1.1);
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .btn-delete:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
        }

        /* Pagination Styles */
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #64748b;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .items-per-page {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .page-select {
          padding: 0.4rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-btn.active {
          background: #059669;
          color: white;
          border-color: #059669;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: #9ca3af;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .modern-table {
            min-width: 800px;
          }

          .table-header {
            padding: 1.25rem 1.5rem;
          }

          .modern-table th,
          .modern-table td {
            padding: 1rem 1.25rem;
          }

          .pagination-container {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .pagination-controls {
            justify-content: space-between;
          }
        }

        @media (max-width: 768px) {
          .modern-table-container {
            border-radius: 16px;
            margin: 0 -0.5rem;
          }

          .table-title-section {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .items-per-page {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .table-header {
            padding: 1rem;
          }

          .modern-table th,
          .modern-table td {
            padding: 0.75rem 1rem;
          }

          .actions-buttons {
            flex-direction: column;
            gap: 0.25rem;
          }

          .btn-action {
            width: 32px;
            height: 32px;
          }

          .pagination-container {
            padding: 1rem;
          }

          .pagination-buttons {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}