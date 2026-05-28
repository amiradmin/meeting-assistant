// components/Dashboard/EnergyMonitoring.jsx
import React from 'react';

const EnergyMonitoring = ({ kpis }) => {
  const energyData = {
    current: kpis.current_energy_consumption_kwh || 55223,
    dailyAvg: kpis.daily_average || 52100,
    peak: kpis.peak_consumption || 61200,
    efficiency: kpis.energy_efficiency_score_avg || 88.3
  };

  return (
    <div className="card modern-card">
      <div className="card-header modern-card-header">
        <div className="d-flex align-items-center">
          <div className="header-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div>
            <h5 className="card-title mb-0">مانیتورینگ انرژی</h5>
            <p className="card-subtitle">مصرف و بهینه‌سازی انرژی</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="energy-stats">
          <div className="energy-stat">
            <div className="stat-icon bg-primary-light">
              <i className="fas fa-plug text-primary"></i>
            </div>
            <div className="stat-content">
              <h4 className="stat-value">
                {(energyData.current / 1000).toLocaleString('fa-IR')} ک.وات
              </h4>
              <p className="stat-label">مصرف فعلی</p>
            </div>
          </div>

          <div className="energy-stat">
            <div className="stat-icon bg-success-light">
              <i className="fas fa-chart-line text-success"></i>
            </div>
            <div className="stat-content">
              <h4 className="stat-value">{energyData.efficiency}%</h4>
              <p className="stat-label">کارایی انرژی</p>
            </div>
          </div>
        </div>

        <div className="energy-comparison">
          <div className="comparison-item">
            <span>میانگین روزانه</span>
            <span>{(energyData.dailyAvg / 1000).toLocaleString('fa-IR')} ک.وات</span>
          </div>
          <div className="comparison-item">
            <span>پیک مصرف</span>
            <span>{(energyData.peak / 1000).toLocaleString('fa-IR')} ک.وات</span>
          </div>
        </div>

        <div className="energy-trend">
          <div className="trend-indicator positive">
            <i className="fas fa-arrow-down"></i>
            <span>کاهش ۵٪ نسبت به دیروز</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .energy-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .energy-stat {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1rem;
          font-size: 1.2rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6c757d;
          margin: 0;
        }

        .energy-comparison {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .comparison-item {
          display: flex;
          justify-content: between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .comparison-item:last-child {
          border-bottom: none;
        }

        .energy-trend {
          text-align: center;
        }

        .trend-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .trend-indicator.positive {
          background: rgba(46, 204, 113, 0.1);
          color: #27ae60;
        }

        .trend-indicator.negative {
          background: rgba(231, 76, 60, 0.1);
          color: #c0392b;
        }

        @media (max-width: 768px) {
          .energy-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergyMonitoring;