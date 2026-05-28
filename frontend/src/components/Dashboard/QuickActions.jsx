// components/Dashboard/QuickActions.jsx
import React from 'react';

const QuickActions = () => {
  const actions = [
    {
      label: "کارمند جدید",
      icon: "fas fa-plus",
      color: "btn-outline-primary"
    },
    {
      label: "مشاهده همه",
      icon: "fas fa-list",
      color: "btn-outline-success"
    },
    {
      label: "گزارش‌گیری",
      icon: "fas fa-chart-bar",
      color: "btn-outline-warning"
    },
    {
      label: "تنظیمات",
      icon: "fas fa-cog",
      color: "btn-outline-info"
    }
  ];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-0 py-3">
        <h5 className="card-title fw-bold mb-0">اقدامات سریع</h5>
      </div>
      <div className="card-body">
        <div className="row g-2">
          {actions.map((action, index) => (
            <div key={index} className="col-6">
              <button className={`btn ${action.color} w-100 d-flex align-items-center justify-content-center gap-2`}>
                <i className={action.icon}></i>
                <span>{action.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;