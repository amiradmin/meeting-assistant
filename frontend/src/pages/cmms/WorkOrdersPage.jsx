// src/pages/cmms/WorkOrdersPage.jsx
import React, { useState, useEffect } from "react";
import { getAssets, getUsers, getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder } from "../../services/cmmsService";
import WorkOrdersTable from "../../components/cmms/WorkOrdersTable";
import WorkOrdersCalendar from "../../components/cmms/WorkOrdersCalendar";
import WorkOrderFormModal from "../../components/cmms/WorkOrderFormModal";
import { FaPlus, FaSearch, FaFilter, FaSync, FaClipboardList, FaExclamationTriangle, FaClock, FaCheckCircle, FaTable, FaCalendarAlt } from "react-icons/fa";

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState("calendar"); // "table" or "calendar"

  // Fetch all data
  const fetchData = async () => {
    try {
      setError(null);
      setLoading(true);

      const [workOrdersData, assetsData, usersData] = await Promise.all([
        getWorkOrders(),
        getAssets(),
        getUsers().catch(error => {
          console.warn("Could not fetch users:", error);
          return [];
        })
      ]);

      console.log("Fetched data:", {
        workOrders: workOrdersData,
        assets: assetsData,
        users: usersData
      });

      // Filter to only include valid users (ID = 1 and any other active users)
      const validUsers = usersData.filter(user =>
        user && user.id && user.is_active !== false
      );

      setWorkOrders(workOrdersData);
      setAssets(assetsData);
      setUsers(validUsers);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("خطا در بارگذاری داده‌ها: " + (err.message || "خطای ناشناخته"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWorkOrderSaved = () => {
    setShowFormModal(false);
    setSelectedWorkOrder(null);
    fetchData();
  };

const handleWorkOrderUpdate = async (updatedWorkOrder) => {
  try {
    await updateWorkOrder(updatedWorkOrder.id, updatedWorkOrder);
    fetchData(); // Refresh the data
  } catch (err) {
    setError("خطا در به‌روزرسانی تاریخ دستور کار: " + err.message);
  }
};



  const handleEdit = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowFormModal(true);
  };

  const handleCreateNew = () => {
    setSelectedWorkOrder(null);
    setShowFormModal(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = async (workOrderId) => {
    if (window.confirm("آیا از حذف این دستور کار اطمینان دارید؟")) {
      try {
        await deleteWorkOrder(workOrderId);
        fetchData();
      } catch (err) {
        setError("خطا در حذف دستور کار: " + err.message);
      }
    }
  };

  const handleWorkOrderClick = (workOrder) => {
    handleEdit(workOrder);
  };

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch =
      workOrder.title?.toLowerCase().includes(search.toLowerCase()) ||
      workOrder.work_order_number?.toLowerCase().includes(search.toLowerCase()) ||
      workOrder.asset?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || workOrder.priority === priorityFilter;
    const matchesType = typeFilter === "all" || workOrder.work_order_type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    overdue: workOrders.filter(wo => {
      if (!wo.due_date || wo.status === 'completed' || wo.status === 'cancelled') return false;
      const dueDate = new Date(wo.due_date);
      const today = new Date();
      return dueDate < today;
    }).length,
    urgent: workOrders.filter(wo => wo.priority === 'urgent' && wo.status !== 'completed').length,
  };

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'assigned', label: 'واگذار شده' },
    { value: 'in_progress', label: 'در حال انجام' },
    { value: 'completed', label: 'تکمیل شده' },
    { value: 'cancelled', label: 'لغو شده' },
    { value: 'on_hold', label: 'در انتظار' },
  ];

  // Priority options for filter
  const priorityOptions = [
    { value: 'all', label: 'همه اولویت‌ها' },
    { value: 'low', label: 'کم' },
    { value: 'medium', label: 'متوسط' },
    { value: 'high', label: 'بالا' },
    { value: 'urgent', label: 'فوری' },
  ];

  // Type options for filter
  const typeOptions = [
    { value: 'all', label: 'همه انواع' },
    { value: 'maintenance', label: 'نگهداری' },
    { value: 'repair', label: 'تعمیر' },
    { value: 'inspection', label: 'بازرسی' },
    { value: 'installation', label: 'نصب' },
    { value: 'emergency', label: 'اضطراری' },
    { value: 'other', label: 'سایر' },
  ];

  return (
    <div className="workorders-page-container">
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
                  <FaClipboardList />
                </div>
                <div className="icon-glow"></div>
              </div>
              <div className="title-text">
                <h1 className="page-title">مدیریت دستورهای کار</h1>
                <p className="page-subtitle">
                  ایجاد، مدیریت و پیگیری دستورهای کار نگهداری و تعمیرات
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon total">
                    <FaClipboardList />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">کل دستورهای کار</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon pending">
                    <FaClock />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.pending}</span>
                    <span className="stat-label">در انتظار</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon overdue">
                    <FaExclamationTriangle />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.overdue}</span>
                    <span className="stat-label">معوقه</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon urgent">
                    <FaExclamationTriangle />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.urgent}</span>
                    <span className="stat-label">فوری</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon in-progress">
                    <FaSync className={refreshing ? "spinning" : ""} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.inProgress}</span>
                    <span className="stat-label">در حال انجام</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon completed">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.completed}</span>
                    <span className="stat-label">تکمیل شده</span>
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
                    placeholder="جستجو در شماره دستور کار، عنوان و تجهیز..."
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
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="filter-select"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="filter-select"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="filter-select"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="actions-section">
                {/* View Switcher */}
                <div className="view-switcher">
                  <button
                    className={`view-btn ${activeView === "table" ? "active" : ""}`}
                    onClick={() => setActiveView("table")}
                  >
                    <FaTable />
                    <span>جدول</span>
                  </button>
                  <button
                    className={`view-btn ${activeView === "calendar" ? "active" : ""}`}
                    onClick={() => setActiveView("calendar")}
                  >
                    <FaCalendarAlt />
                    <span>تقویم</span>
                  </button>
                </div>

                <button
                  className="refresh-btn"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <FaSync className={refreshing ? "spinning" : ""} />
                  <span>بروزرسانی</span>
                </button>

                <button
                  className="create-btn"
                  onClick={handleCreateNew}
                >
                  <FaPlus />
                  <span>دستور کار جدید</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="container-fluid">
          {/* Work Orders View */}
          {activeView === "table" ? (
            <WorkOrdersTable
              workOrders={filteredWorkOrders}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              error={error}
            />
          ) : (
            <WorkOrdersCalendar
  workOrders={filteredWorkOrders}
  onWorkOrderClick={handleWorkOrderClick}
  onWorkOrderUpdate={handleWorkOrderUpdate}
/>
          )}
        </div>
      </div>

      {/* Work Order Form Modal */}
      <WorkOrderFormModal
        show={showFormModal}
        onHide={() => {
          setShowFormModal(false);
          setSelectedWorkOrder(null);
        }}
        workOrder={selectedWorkOrder}
        assets={assets}
        users={users}
        onSave={handleWorkOrderSaved}
      />

      {/* Page Layout Styles */}
      <style jsx>{`
        .workorders-page-container {
          min-height: 140vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .modern-header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
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

        .main-icon svg {
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
          max-width: 1200px;
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
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-icon.overdue {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .stat-icon.urgent {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }

        .stat-icon.in-progress {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .stat-icon.completed {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stat-icon svg {
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
          max-width: 1400px;
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

        .view-switcher {
          display: flex;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 4px;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-btn.active {
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

        .create-btn {
          background: linear-gradient(135deg, #059669, #047857);
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

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #047857, #065f46);
        }

        .content-section {
          margin-top: -80px;
          position: relative;
          z-index: 20;
          padding: 0 1rem 2rem;
           min-height: 140vh;
        }

        .container-fluid {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
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

          .main-icon svg {
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

          .filters-container {
            width: 100%;
            justify-content: space-between;
          }

          .actions-section {
            flex-wrap: wrap;
          }

          .view-switcher {
            order: -1;
            width: 100%;
            justify-content: center;
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

          .view-switcher,
          .refresh-btn,
          .create-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}