// src/components/cmms/EmployeesTable.jsx
import React, { useState } from "react";
import { deleteEmployee } from "../../services/cmmsService";
import EmployeeProfileModal from "./EmployeeProfileModal";
import {
  FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown,
  FaPhone, FaEnvelope, FaBuilding, FaUserTag,
  FaChevronRight, FaChevronLeft, FaEllipsisH,
  FaUserCheck, FaUserTimes, FaEye
} from "react-icons/fa";

export default function EmployeesTable({ employees, loading, onEdit, onDelete }) {

  const [sortField, setSortField] = useState("full_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("آیا از حذف این پرسنل مطمئن هستید؟")) return;
    try {
      await deleteEmployee(id);
      onDelete();
    } catch (err) {
      alert("خطا در حذف پرسنل: " + err.message);
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getRoleConfig = (role) => {
    const config = {
      'Worker': {
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
        text: 'کارگر',
        icon: '👷'
      },
      'Engineer': {
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.1)',
        text: 'مهندس',
        icon: '🔧'
      },
      'Expert': {
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.1)',
        text: 'کارشناس',
        icon: '📊'
      },
      'Manager': {
        color: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.1)',
        text: 'مدیر',
        icon: '👔'
      },
      'Other': {
        color: '#6b7280',
        bg: 'rgba(107, 114, 128, 0.1)',
        text: 'سایر',
        icon: '👤'
      }
    };
    return config[role] || config['Other'];
  };

  const getStatusConfig = (isActive) => {
    return isActive ? {
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      text: 'فعال',
      icon: <FaUserCheck />
    } : {
      color: '#6b7280',
      bg: 'rgba(107, 114, 128, 0.1)',
      text: 'غیرفعال',
      icon: <FaUserTimes />
    };
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    if (mediaPath.includes(':8000')) return mediaPath;
    if (mediaPath.includes('localhost')) {
      return mediaPath.replace('http://localhost', 'http://192.168.150.10:8000');
    }
    return mediaPath;
  };

  // Sort employees
  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalItems = sortedEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedEmployees.slice(startIndex, endIndex);

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
          <p>در حال بارگذاری پرسنل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-table-container">
      {/* Table Header */}
      <div className="table-header">
        <div className="table-title-section">
          <h3 className="table-title">لیست پرسنل</h3>
          <div className="table-stats">
            <span className="stat-badge">
              {employees.length} پرسنل
            </span>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="table-content">
        {sortedEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaUsers size={64} />
            </div>
            <h4>پرسنلی یافت نشد</h4>
            <p>هنوز هیچ پرسنلی ثبت نشده است.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th
                      className="sortable"
                      onClick={() => handleSort("full_name")}
                    >
                      <div className="th-content">
                        <span>نام کامل</span>
                        {getSortIcon("full_name")}
                      </div>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("role")}
                    >
                      <div className="th-content">
                        <FaUserTag className="th-icon" />
                        <span>نقش</span>
                        {getSortIcon("role")}
                      </div>
                    </th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("department")}
                    >
                      <div className="th-content">
                        <FaBuilding className="th-icon" />
                        <span>دپارتمان</span>
                        {getSortIcon("department")}
                      </div>
                    </th>
                    <th>اطلاعات تماس</th>
                    <th
                      className="sortable"
                      onClick={() => handleSort("is_active")}
                    >
                      <div className="th-content">
                        <span>وضعیت</span>
                        {getSortIcon("is_active")}
                      </div>
                    </th>
                    <th className="actions-header">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((employee) => {
                    const role = getRoleConfig(employee.role);
                    const status = getStatusConfig(employee.is_active);

                    return (
                      <tr key={employee.id} className="table-row">
                        <td className="name-cell">
                          <div className="name-content">
                            {employee.profile_picture && (
                              <div className="profile-preview">
                                <img
                                  src={getMediaUrl(employee.profile_picture)}
                                  alt={employee.full_name}
                                  className="profile-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            <div className="name-text" style={{ color: "black" }}>
                              {employee.full_name}
                            </div>
                          </div>
                        </td>
                        <td className="role-cell">
                          <div
                            className="role-badge"
                            style={{
                              backgroundColor: role.bg,
                              color: role.color,
                              borderColor: role.color
                            }}
                          >
                            <span className="role-icon">{role.icon}</span>
                            <span>{role.text}</span>
                          </div>
                        </td>
                        <td className="department-cell">
                          <div className="department-info">
                            <FaBuilding className="department-icon" />
                            <span>{employee.department || "-"}</span>
                          </div>
                        </td>
                        <td className="contact-cell">
                          <div className="contact-info">
                            {employee.mobile && (
                              <div className="contact-item">
                                <FaPhone className="contact-icon" />
                                <span>{employee.mobile}</span>
                              </div>
                            )}
                            {employee.email && (
                              <div className="contact-item">
                                <FaEnvelope className="contact-icon" />
                                <span>{employee.email}</span>
                              </div>
                            )}
                            {employee.ext && (
                              <div className="contact-item">
                                <span className="ext-badge">داخلی: {employee.ext}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="status-cell">
                          <div
                            className="status-badge"
                            style={{
                              backgroundColor: status.bg,
                              color: status.color,
                              borderColor: status.color
                            }}
                          >
                            <span className="status-icon">{status.icon}</span>
                            <span>{status.text}</span>
                          </div>
                        </td>
                        <td className="actions-cell">
                          <div className="actions-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleView(employee)}
                              title="مشاهده جزئیات"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => onEdit(employee)}
                              title="ویرایش"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={(e) => handleDelete(employee.id, e)}
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

      {/* Employee Profile Modal */}
      <EmployeeProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        employee={selectedEmployee}
      />

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
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          border-top: 3px solid #3b82f6;
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
          align-items: center;
          gap: 1rem;
        }

        .name-text {
          font-weight: 600;
          color: #475569;
          font-size: 0.95rem;
        }

        .profile-preview {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .role-cell, .status-cell {
          min-width: 120px;
        }

        .role-badge, .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          border: 1px solid;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .role-icon, .status-icon {
          font-size: 0.7rem;
        }

        .department-cell {
          min-width: 150px;
        }

        .department-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .department-icon {
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .contact-cell {
          min-width: 200px;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
        }

        .contact-icon {
          color: #94a3b8;
          font-size: 0.7rem;
        }

        .ext-badge {
          background: #f3f4f6;
          color: #6b7280;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
        }

        .actions-cell {
          min-width: 140px;
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

        .btn-view {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .btn-view:hover {
          background: #3b82f6;
          color: white;
          transform: scale(1.1);
        }

        .btn-edit {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .btn-edit:hover {
          background: #10b981;
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
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
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
            min-width: 900px;
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

          .actions-buttons {
            flex-direction: column;
            gap: 0.25rem;
          }

          .btn-action {
            width: 32px;
            height: 32px;
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

// Helper component for empty state
const FaUsers = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);