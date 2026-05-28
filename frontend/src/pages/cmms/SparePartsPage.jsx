// src/pages/cmms/SparePartsPage.jsx
import React, { useState, useEffect } from "react";
import { getSpareParts, createSparePart, updateSparePart, deleteSparePart ,getLocations} from "../../services/cmmsService";
import SparePartsTable from "../../components/cmms/SparePartsTable";
import SparePartFormModal from "../../components/cmms/SparePartFormModal";
import { FaPlus, FaSearch, FaFilter, FaSync, FaBox, FaExclamationTriangle } from "react-icons/fa";

export default function SparePartsPage() {
  const [spareParts, setSpareParts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSparePart, setSelectedSparePart] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all"); // Make sure this is defined
  const [refreshing, setRefreshing] = useState(false);

  // Fetch spare parts
  const fetchSpareParts = async () => {
    try {
      const data = await getSpareParts();
      setSpareParts(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  useEffect(() => {
    fetchSpareParts();
    fetchLocations();
  }, []);

  const handleSparePartSaved = () => {
    setShowFormModal(false);
    setSelectedSparePart(null);
    fetchSpareParts();
  };

  const handleEdit = (sparePart) => {
    setSelectedSparePart(sparePart);
    setShowFormModal(true);
  };

  const handleCreateNew = () => {
    setSelectedSparePart(null);
    setShowFormModal(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSpareParts();
    fetchLocations();
  };

  // Filter spare parts based on search and filters
  const filteredSpareParts = spareParts.filter(part => {
    const matchesSearch =
      part.name?.toLowerCase().includes(search.toLowerCase()) ||
      part.part_number?.toLowerCase().includes(search.toLowerCase()) ||
      part.location?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && part.quantity_in_stock <= 5 && part.quantity_in_stock > 0) ||
      (stockFilter === "out" && part.quantity_in_stock === 0) ||
      (stockFilter === "in" && part.quantity_in_stock > 0);

    const matchesLocation =
      locationFilter === "all" ||
      part.location?.id?.toString() === locationFilter;

    return matchesSearch && matchesStock && matchesLocation;
  });

  // Calculate statistics
  const stats = {
    total: spareParts.length,
    lowStock: spareParts.filter(part => part.quantity_in_stock <= 5 && part.quantity_in_stock > 0).length,
    outOfStock: spareParts.filter(part => part.quantity_in_stock === 0).length,
    inStock: spareParts.filter(part => part.quantity_in_stock > 0).length,
    totalValue: spareParts.reduce((sum, part) =>
      sum + (part.quantity_in_stock * (part.unit_price || 0)), 0
    ),
    locationsCount: [...new Set(spareParts.map(part => part.location?.id).filter(Boolean))].length
  };

  return (
    <div className="spareparts-page-container">
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
                  <FaBox />
                </div>
                <div className="icon-glow"></div>
              </div>
              <div className="title-text">
                <h1 className="page-title">مدیریت قطعات یدکی</h1>
                <p className="page-subtitle">
                  مدیریت موجودی و اطلاعات قطعات یدکی سیستم
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon total">
                    <FaBox />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">کل قطعات</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon in-stock">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.inStock}</span>
                    <span className="stat-label">موجود در انبار</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon low-stock">
                    <FaExclamationTriangle />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.lowStock}</span>
                    <span className="stat-label">موجودی کم</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon locations">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.locationsCount}</span>
                    <span className="stat-label">موقعیت‌ها</span>
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
                    placeholder="جستجو در نام، شماره قطعه و موقعیت..."
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
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="in">موجود در انبار</option>
                      <option value="low">موجودی کم</option>
                      <option value="out">اتمام موجودی</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">همه موقعیت‌ها</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
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

                <button
                  className="create-btn"
                  onClick={handleCreateNew}
                >
                  <FaPlus />
                  <span>قطعه جدید</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="container-fluid">
          <SparePartsTable
            spareParts={filteredSpareParts}
            loading={loading}
            onEdit={handleEdit}
            onDelete={fetchSpareParts}
          />
        </div>
      </div>

      {/* Spare Part Form Modal */}
      <SparePartFormModal
        show={showFormModal}
        onHide={() => {
          setShowFormModal(false);
          setSelectedSparePart(null);
        }}
        sparePart={selectedSparePart}
        locations={locations}
        onSave={handleSparePartSaved}
      />

      {/* Page Layout Styles */}
      <style jsx>{`
        .spareparts-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .modern-header {
          background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
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
          background: linear-gradient(135deg, #059669, #047857);
        }

        .stat-icon.in-stock {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .stat-icon.low-stock {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-icon.locations {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .stat-icon svg, .stat-icon i {
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

        .create-btn {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
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
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
          background: linear-gradient(135deg, #6d28d9, #5b21b6);
        }

        .content-section {
          margin-top: -80px;
          position: relative;
          z-index: 20;
          padding: 0 1rem 2rem;
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

          .refresh-btn, .create-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}