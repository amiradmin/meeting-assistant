// components/Dashboard/ChartsSection.jsx
import React from 'react';
import { MyChart2, MyChart5 } from '../../components/Charts';
import Alerts from '../../components/Alerts';

const ChartsSection = ({ alerts, charts }) => {
  return (
    <>


      {/* Performance Chart */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="card-title fw-bold mb-0">تحلیل عملکرد تجهیزات</h5>
        </div>
        <div className="card-body">
          <MyChart5 data={charts.performance} />
        </div>
      </div>

      {/* Utilization Chart */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 py-3">
          <h5 className="card-title fw-bold mb-0">نرخ استفاده از تجهیزات</h5>
        </div>
        <div className="card-body">
          <MyChart2 data={charts.utilization} />
        </div>
      </div>
    </>
  );
};

export default ChartsSection;