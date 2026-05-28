// components/Dashboard/KPICards.jsx
import React from 'react';

const KPICards = ({ employees, kpis, assetHealth }) => {
  // Use data directly from asset-health API endpoint
  const getAssetStats = () => {
    if (assetHealth && assetHealth.total_assets !== undefined) {
      // Data from asset-health endpoint
      return {
        total: assetHealth.total_assets || 10,
        operational: assetHealth.healthy_assets || 0,
        warning: assetHealth.warning_assets || 0,
        critical: assetHealth.critical_assets || 0,
        healthScore: assetHealth.average_health_score || 0
      };
    } else {
      // Fallback to kpis data if assetHealth is not available
      return {
        total: kpis.total_active_assets || 0,
        operational: kpis.healthy_assets || 0,
        warning: kpis.warning_assets || 0,
        critical: kpis.critical_assets || 0,
        healthScore: kpis.asset_health_index_avg || 0
      };
    }
  };

  const assetStats = getAssetStats();

  // Get work order data from CMMS overview
  const getWorkOrderData = () => {
    // Try multiple possible data sources
    const openWorkOrders =
      kpis.open_work_orders ||
      kpis.openWorkOrders ||
      kpis.work_order_summary?.open ||
      0;

    const overdueWorkOrders =
      kpis.overdue_work_orders ||
      kpis.maintenance_backlog ||
      kpis.work_order_summary?.overdue ||
      0;

    const totalWorkOrders =
      kpis.total_work_orders ||
      kpis.work_order_summary?.total ||
      0;

    return {
      open: openWorkOrders,
      overdue: overdueWorkOrders,
      total: totalWorkOrders
    };
  };

  const workOrderData = getWorkOrderData();

  const kpiData = [
    {
      title: "کارکنان",
      value: employees.total_employees || 0,
      subtitle: `${employees.active_employees || 0} فعال / ${employees.inactive_employees || 0} غیرفعال`,
      icon: "fas fa-users",
      gradient: "gradient-purple",
      badge: true
    },
    {
      title: "تجهیزات فعال",
      value: assetStats.total,
      subtitle: `${assetStats.operational} عملیاتی / ${assetStats.warning + assetStats.critical} نیاز توجه`,
      icon: "fas fa-cogs",
      gradient: "gradient-blue"
    },
    {
      title: "سلامت تجهیزات",
      value: `${assetStats.healthScore}%`,
      subtitle: getHealthStatus(assetStats.healthScore),
      icon: "fas fa-heartbeat",
      gradient: getHealthGradient(assetStats.healthScore)
    },
    {
      title: "دستورکارهای باز",
      value: workOrderData.total,
      subtitle: `${workOrderData.overdue} مورد معوق / ${workOrderData.total} کل`,
      icon: "fas fa-tools",
      gradient: workOrderData.overdue > 0 ? "gradient-red" : "gradient-orange"
    }
  ];

  // Helper function to get health status text
  function getHealthStatus(score) {
    if (score >= 80) return 'پایدار / بدون هشدار';
    if (score >= 60) return 'نیاز به بررسی';
    return 'نیاز به اقدام فوری';
  }

  // Helper function to get gradient based on health score
  function getHealthGradient(score) {
    if (score >= 80) return 'gradient-green';
    if (score >= 60) return 'gradient-orange';
    return 'gradient-red';
  }

  return (
    <div className="row mb-4">
      {kpiData.map((kpi, index) => (
        <div key={index} className="col-xl-3 col-md-6 mb-3">
          <div className={`kpi-card ${kpi.gradient}`}>
            <div className="kpi-icon">
              <i className={kpi.icon}></i>
            </div>
            <div className="kpi-content">
              <h6 className="kpi-title">{kpi.title}</h6>
              <h3 className="kpi-value">{kpi.value}</h3>
              {kpi.badge ? (
                <div className="kpi-details">
                  <span className="badge bg-light text-dark">
                    {employees.active_employees || 0} فعال
                  </span>
                  <span className="text-light opacity-75">
                    {employees.inactive_employees || 0} غیرفعال
                  </span>
                </div>
              ) : (
                <p className="kpi-subtitle">{kpi.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .kpi-card {
          display: flex;
          align-items: center;
          border-radius: 16px;
          padding: 24px;
          color: #fff;
          gap: 20px;
          transition: all 0.3s ease;
          height: 100%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .kpi-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .kpi-icon {
          font-size: 2.5rem;
          opacity: 0.9;
          flex-shrink: 0;
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-title {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .kpi-value {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1;
        }

        .kpi-subtitle {
          font-size: 0.85rem;
          margin-bottom: 0;
          opacity: 0.8;
        }

        .kpi-details {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .gradient-purple {
          background: linear-gradient(135deg, #8e44ad, #9b59b6);
        }
        .gradient-blue {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }
        .gradient-red {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        .gradient-orange {
          background: linear-gradient(135deg, #e67e22, #d35400);
        }
        .gradient-green {
          background: linear-gradient(135deg, #27ae60, #229954);
        }

        @media (max-width: 768px) {
          .kpi-card {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .kpi-icon {
            font-size: 2rem;
          }

          .kpi-value {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default KPICards;