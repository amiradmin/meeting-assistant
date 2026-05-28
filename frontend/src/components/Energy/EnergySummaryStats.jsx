// components/Energy/EnergySummaryStats.jsx
import React from "react";
import { calculateEnergySummary } from "../../utils/energyHelpers";

const EnergySummaryStats = ({ assets }) => {
  const stats = calculateEnergySummary(assets);

  const statsData = [
    {
      icon: "fas fa-bolt",
      title: "مصرف بهینه",
      value: `${stats.efficiencyPercent}%`,
      status: stats.efficiencyPercent >= 80 ? "عالی" : stats.efficiencyPercent >= 60 ? "پایدار" : "نیازمند بهینه‌سازی",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      iconBg: "rgba(16, 185, 129, 0.2)",
      trend: stats.efficiencyPercent >= 80 ? "up" : "neutral",
      progressWidth: `${Math.min(stats.efficiencyPercent, 100)}%`
    },
    {
      icon: "fas fa-fire",
      title: "مصرف متوسط",
      value: stats.medium,
      status: stats.medium > 0 ? "نیاز به بررسی" : "بدون مشکل",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      iconBg: "rgba(245, 158, 11, 0.2)",
      trend: stats.medium > 0 ? "warning" : "neutral",
      progressWidth: `${Math.min((stats.medium / stats.totalAssets) * 100, 100)}%`
    },
    {
      icon: "fas fa-battery-empty",
      title: "مصرف بالا",
      value: stats.high,
      status: stats.high > 0 ? "نیاز به اقدام" : "بدون هشدار",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      iconBg: "rgba(239, 68, 68, 0.2)",
      trend: stats.high > 0 ? "critical" : "neutral",
      progressWidth: `${Math.min((stats.high / stats.totalAssets) * 100, 100)}%`
    },
    {
      icon: "fas fa-industry",
      title: "کل تجهیزات",
      value: stats.totalAssets,
      status: "تحت نظارت",
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
      iconBg: "rgba(59, 130, 246, 0.2)",
      trend: "neutral",
      progressWidth: "100%"
    }
  ];

  return (
    <div className="modern-stats-container">
      <div className="container-fluid">
        <div className="row g-4">
          {statsData.map((stat, index) => (
            <div key={index} className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div
                className="modern-stat-card"
                style={{
                  '--stat-color': stat.color,
                  '--stat-bg': stat.bgColor,
                  '--stat-icon-bg': stat.iconBg
                }}
              >
                <div className="stat-header">
                  <div className="stat-icon">
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-trend">
                    {stat.trend === 'up' && <i className="fas fa-arrow-up"></i>}
                    {stat.trend === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
                    {stat.trend === 'critical' && <i className="fas fa-exclamation-circle"></i>}
                    {stat.trend === 'neutral' && <i className="fas fa-minus"></i>}
                  </div>
                </div>

                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-title">{stat.title}</p>
                  <div className="stat-status">
                    <span className="status-indicator"></span>
                    <span className="status-text">{stat.status}</span>
                  </div>
                </div>

                <div className="stat-footer">
                  <div className="stat-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: stat.progressWidth,
                        backgroundColor: stat.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .modern-stats-container {
          margin: 2rem 0;
          padding: 0 1rem;
          height:320px;
        }

        .modern-stat-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .modern-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--stat-color), var(--stat-color)80);
        }

        .modern-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: var(--stat-icon-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--stat-color);
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .modern-stat-card:hover .stat-icon {
          transform: scale(1.1);
        }

        .stat-trend {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--stat-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--stat-color);
          font-size: 0.875rem;
        }

        .stat-content {
          margin-bottom: 1.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1;
        }

        .stat-title {
          font-size: 1rem;
          font-weight: 600;
          color: #6b7280;
          margin: 0 0 1rem 0;
        }

        .stat-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--stat-color);
        }

        .status-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-footer {
          margin-top: auto;
        }

        .stat-progress {
          width: 100%;
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        @media (max-width: 768px) {
          .modern-stat-card {
            padding: 1.5rem;
          }

          .stat-value {
            font-size: 2rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergySummaryStats;