// src/components/anomaly/AnomalyRecordsStats.jsx
import React from "react";
import { FaDatabase, FaExclamationTriangle, FaBell, FaCheckCircle, FaChartLine, FaCalendarAlt } from "react-icons/fa";

export default function AnomalyRecordsStats({ stats }) {
  const statCards = [
    {
      key: 'total',
      icon: FaDatabase,
      number: stats.total,
      label: 'کل رکوردها',
      gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
    },
    {
      key: 'critical',
      icon: FaExclamationTriangle,
      number: stats.critical,
      label: 'آنومالی بحرانی',
      gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)'
    },
    {
      key: 'warning',
      icon: FaBell,
      number: stats.warning,
      label: 'هشدار',
      gradient: 'linear-gradient(135deg, #ea580c, #c2410c)'
    },
    {
      key: 'normal',
      icon: FaCheckCircle,
      number: stats.normal,
      label: 'عادی',
      gradient: 'linear-gradient(135deg, #059669, #047857)'
    },
    {
      key: 'assets',
      icon: FaChartLine,
      number: stats.assetsWithAnomalies,
      label: 'تجهیزات فعال',
      gradient: 'linear-gradient(135deg, #d97706, #b45309)'
    }
  ];

  return (
    <div className="stats-section">
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.key} className="stat-card">
            <div className="stat-icon" style={{ background: stat.gradient }}>
              <stat.icon />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .stats-section {
          margin: -100px 0 2rem 0;
          position: relative;
          z-index: 15;
          padding: 0 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
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
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}