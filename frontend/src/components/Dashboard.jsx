// pages/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  // Example KPI data
  const kpis = [
    { title: "درصد خرابی تجهیزات", value: "5%", color: "danger", subtitle: "هفته جاری" },
    { title: "ماشین‌آلات فعال", value: 12, color: "success", subtitle: "از 15 موجود" },
    { title: "تعمیرات برنامه‌ریزی شده", value: 3, color: "warning", subtitle: "هفته جاری" },
    { title: "میانگین زمان خرابی", value: "2h 15m", color: "info", subtitle: "MTTR" },
  ];

  return (
    <div className="dashboard-container" style={{ padding: "20px" }}>

      {/* KPI Row */}
      <div className="row mb-3">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="col-md-3 mb-3">
            <div className={`card border-${kpi.color} shadow-sm`}>
              <div className="card-body text-center">
                <h5 className={`text-${kpi.color}`}>{kpi.value}</h5>
                <p className="mb-0">{kpi.title}</p>
                <small className="text-muted">{kpi.subtitle}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-header">عملکرد تجهیزات</div>
            <div className="card-body">
              <canvas id="myChart2" style={{ height: "250px" }}></canvas>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-header">مصرف انرژی</div>
            <div className="card-body">
              <canvas id="myChart4" style={{ height: "250px" }}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Row */}
      <div className="row mb-3">
        <div className="col-md-12 mb-3">
          <div className="card shadow-sm">
            <div className="card-header">آمار کلی</div>
            <div className="card-body">
              <canvas id="myChart5" style={{ height: "300px" }}></canvas>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
