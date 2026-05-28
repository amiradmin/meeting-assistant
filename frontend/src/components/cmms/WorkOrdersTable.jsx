// src/components/cmms/WorkOrdersTable.jsx
import React from "react";
import { FaEdit, FaTrash, FaClock, FaExclamationTriangle, FaCheckCircle, FaPauseCircle, FaRobot } from "react-icons/fa";

const WorkOrdersTable = ({ workOrders, loading, error, onEdit, onDelete }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'in_progress':
        return <FaClock className="text-blue-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'on_hold':
        return <FaPauseCircle className="text-orange-500" />;
      case 'cancelled':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'در انتظار',
      'assigned': 'واگذار شده',
      'in_progress': 'در حال انجام',
      'completed': 'تکمیل شده',
      'cancelled': 'لغو شده',
      'on_hold': 'در انتظار'
    };
    return statusMap[status] || status;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'low': { color: 'bg-gray-100 text-gray-800', text: 'کم' },
      'medium': { color: 'bg-blue-100 text-blue-800', text: 'متوسط' },
      'high': { color: 'bg-orange-100 text-orange-800', text: 'بالا' },
      'urgent': { color: 'bg-red-100 text-red-800', text: 'فوری' }
    };
    const priorityInfo = priorityMap[priority] || { color: 'bg-gray-100 text-gray-800', text: priority };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
        {priorityInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('fa-IR');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری دستورهای کار...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-error">
        <div className="error-icon">خطا</div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="workorders-table-container" >
      <div className="table-wrapper">
        <table className="workorders-table">
          <thead>
            <tr>
              <th>شماره دستور کار</th>
              <th>عنوان</th>
              <th>تجهیز</th>
              <th>وضعیت</th>
              <th>اولویت</th>
              <th>تاریخ ایجاد</th>
              <th>تاریخ سررسید</th>
              <th>اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((workOrder) => (
              <tr key={workOrder.id} className="table-row">
                <td>
                  <div className="wo-number">
                    {workOrder.work_order_number}
                    {workOrder.is_ai_created && (
                      <div className="ai-badge" title="ایجاد شده توسط هوش مصنوعی">
                        <FaRobot className="ai-icon" />
                        <span className="ai-tooltip">AI</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="wo-title">
                    {workOrder.title}
                    {workOrder.is_ai_created && (
                      <span className="ai-indicator">(هوش مصنوعی)</span>
                    )}
                  </div>
                  <div className="wo-type">
                    {workOrder.work_order_type}
                  </div>
                </td>
                <td>
                  <div className="wo-asset">
                    {workOrder.asset?.name || '-'}
                  </div>
                </td>
                <td>
                  <div className="status-cell">
                    {getStatusIcon(workOrder.status)}
                    <span className="status-text">
                      {getStatusText(workOrder.status)}
                    </span>
                  </div>
                </td>
                <td>
                  {getPriorityBadge(workOrder.priority)}
                </td>
                <td>
                  <div className="date-cell">
                    {formatDate(workOrder.date_created)}
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    {formatDate(workOrder.due_date)}
                  </div>
                </td>
                <td>
                  <div className="actions-cell">
                    <button
                      onClick={() => onEdit(workOrder)}
                      className="edit-btn"
                      title="ویرایش"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(workOrder.id)}
                      className="delete-btn"
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {workOrders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">دستور کاری یافت نشد</div>
            <div className="empty-description">هیچ دستور کاری با معیارهای جستجوی شما مطابقت ندارد</div>
          </div>
        )}
      </div>
<style jsx>{`
  .workorders-table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-top:100px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .workorders-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
  }

  .workorders-table th {
    background: #f8fafc;
    padding: 12px 16px;
    text-align: right;
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e5e7eb;
  }

  .workorders-table td {
    padding: 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .table-row {
    transition: background-color 0.2s ease;
  }

  .table-row:hover {
    background-color: #f9fafb;
  }

  .table-row:last-child td {
    border-bottom: none;
  }

  .wo-number {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    direction: ltr;
    text-align: right;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-badge {
    position: relative;
    display: flex;
    align-items: center;

    cursor: help;
  }

  .ai-icon {
    font-size: 14px;
  }

  .ai-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
  }

  .ai-badge:hover .ai-tooltip {
    opacity: 1;
    visibility: visible;
  }

  .wo-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ai-indicator {
    font-size: 0.7rem;
    color: #8b5cf6;
    /* Remove background and padding */
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-weight: normal;
  }

  .wo-type {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .wo-asset {
    font-size: 0.875rem;
    color: #374151;
  }

  .status-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-text {
    font-size: 0.875rem;
    color: #374151;
  }

  .date-cell {
    font-size: 0.875rem;
    color: #6b7280;
    direction: ltr;
    text-align: right;
  }

  .actions-cell {
    display: flex;
    gap: 8px;
  }

  .edit-btn, .delete-btn {
    background: none;
    border: none;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .edit-btn {
    color: #3b82f6;
  }

  .edit-btn:hover {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .delete-btn {
    color: #ef4444;
  }

  .delete-btn:hover {
    background: #fef2f2;
    color: #dc2626;
  }

  .table-loading {
    padding: 3rem;
    text-align: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .table-error {
    padding: 3rem;
    text-align: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .error-icon {
    color: #dc2626;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .empty-state {
    padding: 3rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .empty-description {
    color: #6b7280;
    font-size: 0.875rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .workorders-table-container {
      margin: 0 -1rem;
      border-radius: 0;
    }

    .workorders-table th,
    .workorders-table td {
      padding: 12px 8px;
    }

    .wo-number {
      font-size: 0.8rem;
    }

    .wo-title {
      font-size: 0.8rem;
    }

    .wo-type {
      font-size: 0.7rem;
    }

    .ai-indicator {
      font-size: 0.65rem;
    }

    .status-text {
      font-size: 0.8rem;
    }

    .date-cell {
      font-size: 0.8rem;
    }

    .actions-cell {
      gap: 4px;
    }

    .edit-btn, .delete-btn {
      padding: 4px;
    }
  }

  @media (max-width: 480px) {
    .workorders-table th {
      font-size: 0.7rem;
      padding: 8px 6px;
    }

    .workorders-table td {
      padding: 10px 6px;
    }

    .empty-state {
      padding: 2rem 1rem;
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .empty-title {
      font-size: 1rem;
    }

    .ai-badge {
      display: none;
    }

    .ai-indicator {
      display: inline-block;
    }
  }
`}</style>
    </div>
  );
};

export default WorkOrdersTable;