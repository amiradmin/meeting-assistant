// components/Dashboard/BottomStats.jsx
import React from 'react';
import TehranClock from './TehranClock';

const BottomStats = ({ kpis }) => {
  const stats = [
    {
      title: "بازدید نگهداری انجام‌شده",
      value: kpis.maintenanceCount || '27',
      icon: "fas fa-wrench",
      color: "text-primary",
      buttonColor: "btn-primary",
      buttonText: "مشاهده جزئیات"
    },
    {
      title: "مصرف انرژی ماهانه",
      value: kpis.energyConsumption || '55,223 kWh',
      icon: "fas fa-bolt",
      color: "text-warning",
      buttonColor: "btn-warning text-white",
      buttonText: "تحلیل مصرف"
    }
  ];

  return (
    <div className="row mt-4">
      {stats.map((stat, index) => (
        <div key={index} className="col-md-4 mb-3">
          <div className="card shadow-sm border-0 text-center h-100">
            <div className="card-body py-4">
              <i className={`${stat.icon} ${stat.color} mb-3`} style={{fontSize: '2.5rem'}}></i>
              <h3 className="fw-bold mb-2">{stat.value}</h3>
              <p className="text-muted mb-3">{stat.title}</p>
              <button className={`btn btn-sm ${stat.buttonColor}`}>
                {stat.buttonText} <i className="fas fa-arrow-left ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Replace iframe with custom clock component */}
      <div className="col-md-4 mb-3">
        <TehranClock />
      </div>
    </div>
  );
};

export default BottomStats;