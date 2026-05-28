// src/pages/anomaly/AnomalyDetectPage.jsx
import React, { useState, useEffect } from "react";
import { getLatestAnomalies, getAssets, getAnomalyStats } from "../services/cmmsService";
import { FaExclamationTriangle, FaChartLine, FaSync, FaFilter, FaSearch, FaBell, FaCalendarAlt } from "react-icons/fa";
import AnomalyRecordsTable from "../components/anomaly/AnomalyRecordsTable";

export default function AnomalyDetectPage() {
  const [anomalies, setAnomalies] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [assetFilter, setAssetFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    assetsWithAnomalies: 0,
    latestAnomaly: null
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setError(null);
      console.log("Fetching anomalies data...");

      const anomaliesData = await getLatestAnomalies();
      console.log("Fetched anomalies:", anomaliesData);

      let assetsData = [];
      try {
        assetsData = await getAssets();
        console.log("Fetched assets:", assetsData);
      } catch (assetsError) {
        console.warn("Could not fetch assets:", assetsError);
        // Continue without assets data
      }

      // Calculate stats from anomalies data
      const calculatedStats = {
        total: anomaliesData.length,
        critical: anomaliesData.filter(a => a.anomaly === -1).length,
        assetsWithAnomalies: [...new Set(anomaliesData.map(a => a.asset?.id))].length,
        latestAnomaly: anomaliesData.length > 0 ? anomaliesData[0].timestamp : null
      };

      console.log("Calculated stats:", calculatedStats);
      setStats(calculatedStats);
      setAnomalies(anomaliesData);
      setAssets(assetsData);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("خطا در بارگذاری داده‌های ناهنجاری: " + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter anomalies based on search and filters
  const filteredAnomalies = anomalies.filter(anomaly => {
    // Asset filter
    const matchesAsset = assetFilter === "all" || anomaly.asset?.id.toString() === assetFilter;

    // Search filter
    const matchesSearch = searchTerm === "" ||
      anomaly.asset?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.asset?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.id.toString().includes(searchTerm);

    return matchesAsset && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="text-lg">در حال بارگذاری داده‌های ناهنجاری...</div>
      </div>
    );
  }

  return (
    <div className="anomaly-page-container">
      {/* Header Section */}
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
                  <FaExclamationTriangle />
                </div>
                <div className="icon-glow"></div>
              </div>
              <div className="title-text">
                <h1 className="page-title">سیستم تشخیص ناهنجاری</h1>
                <p className="page-subtitle">
                  نظارت هوشمند بر عملکرد تجهیزات و تشخیص ناهنجاری‌ها
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon total">
                    <FaExclamationTriangle />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">کل ناهنجاری‌ها</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon critical">
                    <FaBell />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.critical}</span>
                    <span className="stat-label">ناهنجاری بحرانی</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon assets">
                    <FaChartLine />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">{stats.assetsWithAnomalies}</span>
                    <span className="stat-label">تجهیزات دارای ناهنجاری</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon latest">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-info">
                    <span className="stat-number">
                      {stats.latestAnomaly ? new Date(stats.latestAnomaly).toLocaleTimeString('fa-IR') : '---'}
                    </span>
                    <span className="stat-label">آخرین ناهنجاری</span>
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
                    placeholder="جستجو در ناهنجاری‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      onChange={(e) => setAssetFilter(e.target.value)}
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
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="24h">۲۴ ساعت گذشته</option>
                      <option value="7d">۷ روز گذشته</option>
                      <option value="30d">۳۰ روز گذشته</option>
                      <option value="all">همه زمان‌ها</option>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="container-fluid">
          {/* Anomaly Records Table */}
          <AnomalyRecordsTable
            records={filteredAnomalies}
            loading={loading}
            error={error}
            onRefresh={handleRefresh}
            stats={stats}
            assets={assets}
          />
        </div>
      </div>

      {/* Page Styles */}
      <style jsx>{`
        .anomaly-page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .modern-header {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
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

        .container-fluid {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
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
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }

        .stat-icon.critical {
          background: linear-gradient(135deg, #ea580c, #c2410c);
        }

        .stat-icon.assets {
          background: linear-gradient(135deg, #d97706, #b45309);
        }

        .stat-icon.latest {
          background: linear-gradient(135deg, #059669, #047857);
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

        .content-section {
          margin-top: -80px;
          position: relative;
          z-index: 20;
          padding: 0 1rem 2rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
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

          .refresh-btn {
            width: 100%;
            justify-content: center;
          }

          .modern-header {
            height: 700px;
          }
        }
      `}</style>
    </div>
  );
}