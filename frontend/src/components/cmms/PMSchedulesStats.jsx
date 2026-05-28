// src/components/cmms/PMSchedulesStats.jsx
import React from "react";
import { FaCalendarCheck, FaPlayCircle, FaExclamationTriangle, FaCalendarDay } from "react-icons/fa";

export default function PMSchedulesStats({ stats }) {
  const statCards = [
    {
      key: 'total',
      icon: FaCalendarCheck,
      number: stats.total,
      label: 'کل برنامه‌ها',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      key: 'active',
      icon: FaPlayCircle,
      number: stats.active,
      label: 'فعال',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      key: 'overdue',
      icon: FaExclamationTriangle,
      number: stats.overdue,
      label: 'معوقه',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      key: 'dueThisWeek',
      icon: FaCalendarDay,
      number: stats.dueThisWeek,
      label: 'تا پایان هفته',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
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
          max-width: 1000px;
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