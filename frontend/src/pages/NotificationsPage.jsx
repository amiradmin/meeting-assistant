// src/pages/NotificationsPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { FaSearch, FaFilter, FaSync, FaEnvelope, FaEnvelopeOpen, FaCheckDouble, FaChevronRight, FaChevronLeft } from "react-icons/fa";

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
    setCurrentPage(1); // Reset to first page after refresh
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setShowModal(true);
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
  };

  // Filter notifications based on search and filter
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch =
      notif.title?.toLowerCase().includes(search.toLowerCase()) ||
      notif.message?.toLowerCase().includes(search.toLowerCase());

    if (filter === 'unread') return !notif.is_read && matchesSearch;
    if (filter === 'read') return notif.is_read && matchesSearch;
    return matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredNotifications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      success: { color: '#10b981', label: 'موفقیت' },
      error: { color: '#ef4444', label: 'خطا' },
      warning: { color: '#f59e0b', label: 'هشدار' },
      info: { color: '#3b82f6', label: 'اطلاعیه' }
    };
    const config = typeConfig[type] || typeConfig.info;
    return config;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notifications-page-container">
      {/* Modern Header Section */}
      <div className="modern-header">
        <div className="header-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <div className="header-content">
          <div className="container-fluid">
            {/* Main Title Area */}
            <div className="title-section">
              <div className="icon-wrapper">
                <div className="main-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="icon-glow"></div>
              </div>
              <div className="title-text">
                <h1 className="page-title">مدیریت اطلاعیه‌ها</h1>
                <p className="page-subtitle">
                  پیگیری و مدیریت تمامی اطلاعیه‌ها و اعلان‌های سیستم
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon total">
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{notifications.length}</span>
                    <span className="stat-label">کل اطلاعیه‌ها</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon unread">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{unreadCount}</span>
                    <span className="stat-label">خوانده نشده</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon read">
                    <i className="fas fa-envelope-open"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{readCount}</span>
                    <span className="stat-label">خوانده شده</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon success">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">
                      {notifications.filter(n => n.notif_type === 'success').length}
                    </span>
                    <span className="stat-label">موفقیت‌ها</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
              <div className="search-filters-section">
                <div className="search-container">
                  <div className="search-icon">
                    <FaSearch />
                  </div>
                  <input
                    type="text"
                    placeholder="جستجو در عنوان و متن اطلاعیه‌ها..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filters-container">
                  <div className="filter-group">
                    <div className="filter-icon">
                      <FaFilter />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">همه اطلاعیه‌ها</option>
                      <option value="unread">خوانده نشده</option>
                      <option value="read">خوانده شده</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="actions-section">
                <button
                  className="refresh-btn"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <FaSync className={refreshing ? "spinning" : ""} />
                  <span>بروزرسانی</span>
                </button>

                {unreadCount > 0 && (
                  <button
                    className="mark-all-btn"
                    onClick={handleMarkAllAsRead}
                  >
                    <FaCheckDouble />
                    <span>خواندن همه</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="container-fluid">
          <div className="notifications-table-container">
            {/* Pagination Controls - Top */}
            {filteredNotifications.length > 0 && (
              <div className="pagination-controls top">
                <div className="pagination-info">
                  <span>
                    نمایش {startIndex + 1}-{Math.min(endIndex, totalItems)} از {totalItems} اطلاعیه
                  </span>
                </div>
                <div className="pagination-items-per-page">
                  <label>تعداد در هر صفحه:</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="items-per-page-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}

            {currentNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="far fa-bell"></i>
                </div>
                <h3>هیچ اطلاعیه‌ای یافت نشد</h3>
                <p>وقتی اطلاعیه جدیدی داشته باشید، اینجا نمایش داده می‌شود</p>
              </div>
            ) : (
              <div className="notifications-list">
                {currentNotifications.map((notification) => {
                  const typeConfig = getTypeBadge(notification.notif_type);
                  return (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon">
                        {!notification.is_read ? <FaEnvelope /> : <FaEnvelopeOpen />}
                      </div>
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4 className="notification-title">
                            {notification.title}
                          </h4>
                          <div className="notification-meta">
                            <span
                              className="type-badge"
                              style={{ backgroundColor: typeConfig.color }}
                            >
                              {typeConfig.label}
                            </span>
                            <span className="notification-time">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="notification-message">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="unread-indicator"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls - Bottom */}
            {totalPages > 1 && (
              <div className="pagination-controls bottom">
                <div className="pagination-info">
                  <span>
                    صفحه {currentPage} از {totalPages}
                  </span>
                </div>

                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronRight />
                    <span>قبلی</span>
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

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <span>بعدی</span>
                    <FaChevronLeft />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {showModal && selectedNotification && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>جزئیات اطلاعیه</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="notification-detail">
                <div className="detail-header">
                  <h2>{selectedNotification.title}</h2>
                  <span
                    className="type-badge large"
                    style={{ backgroundColor: getTypeBadge(selectedNotification.notif_type).color }}
                  >
                    {getTypeBadge(selectedNotification.notif_type).label}
                  </span>
                </div>
                <div className="detail-message">
                  {selectedNotification.message}
                </div>
                <div className="detail-footer">
                  <span className="detail-time">
                    <i className="far fa-clock"></i>
                    {formatDate(selectedNotification.created_at)}
                  </span>
                  <span className="detail-status">
                    {selectedNotification.is_read ? 'خوانده شده' : 'خوانده نشده'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Layout Styles */}
      <style jsx>{`
        .notifications-page-container {

          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .modern-header {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
          position: relative;
          overflow: hidden;
          padding-bottom: 2rem;
          height: 600px;
        }

        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .floating-shapes {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .header-content {
          position: relative;
          z-index: 10;
          padding-top: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .title-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .icon-wrapper {
          position: relative;
        }

        .main-icon {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 2;
        }

        .main-icon i {
          font-size: 2.5rem;
          color: white;
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
        }

        .title-text {
          color: white;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .page-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          max-width: 500px;
          line-height: 1.6;
        }

        .stats-section {
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .stat-icon.unread {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .stat-icon.read {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stat-icon.success {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-icon i {
          color: white;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 0.25rem;
        }

        .action-bar {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
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
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          color: #1f2937;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
          color: rgba(255, 255, 255, 0.8);
        }

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .actions-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
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
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mark-all-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .mark-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #059669, #047857);
        }

        .content-section {
          margin-top: -80px;
          position: relative;
          z-index: 20;
          padding: 0 1rem 2rem;
        }

        .notifications-table-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          min-height: 400px;
        }

        /* Pagination Styles */
        .pagination-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .pagination-controls.bottom {
          border-bottom: none;
          border-top: 1px solid #f3f4f6;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .pagination-items-per-page {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .items-per-page-select {
          padding: 0.25rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 0.875rem;
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
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

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .notifications-list {
          padding: 1rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .notification-item.unread {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
        }

        .notification-icon {
          color: #6b7280;
          font-size: 1.25rem;
          margin-top: 0.25rem;
        }

        .notification-item.unread .notification-icon {
          color: #3b82f6;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .notification-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          flex: 1;
        }

        .notification-item.unread .notification-title {
          color: #111827;
        }

        .notification-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .type-badge.large {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .notification-time {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .notification-message {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .unread-indicator {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          margin-top: 0.5rem;
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
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .modal-header h3 {
          margin: 0;
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
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
        }

        .notification-detail {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .detail-header h2 {
          margin: 0;
          color: #1f2937;
          flex: 1;
        }

        .detail-message {
          color: #4b5563;
          line-height: 1.8;
          font-size: 1.1rem;
          white-space: pre-wrap;
        }

        .detail-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid #f3f4f6;
          color: #6b7280;
        }

        .detail-time, .detail-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid #f3f4f6;
          display: flex;
          justify-content: flex-end;
        }

        .close-modal-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-modal-btn:hover {
          background: #4b5563;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
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
          .title-section {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .page-title {
            font-size: 2.25rem;
          }

          .main-icon {
            width: 80px;
            height: 80px;
          }

          .main-icon i {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .search-filters-section {
            flex-direction: column;
            gap: 1rem;
          }

          .search-container {
            max-width: 100%;
          }

          .notification-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .notification-meta {
            width: 100%;
            justify-content: space-between;
          }

          .detail-header {
            flex-direction: column;
            gap: 1rem;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .pagination-buttons {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1rem;
          }

          .actions-section {
            flex-direction: column;
            width: 100%;
          }

          .refresh-btn, .mark-all-btn {
            width: 100%;
            justify-content: center;
          }

          .modal-content {
            margin: 1rem;
          }

          .modal-header, .modal-body, .modal-footer {
            padding: 1rem;
          }

          .pagination-buttons {
            gap: 0.25rem;
          }

          .pagination-btn {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
        }

      `}</style>
    </div>
  );
};

export default NotificationsPage;