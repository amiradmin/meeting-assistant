import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { Card } from "react-bootstrap";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EnergyChart = ({ predictions }) => {
  if (!predictions || predictions.length === 0) {
    return <div className="text-center py-4">پیش‌بینی انرژی موجود نیست</div>;
  }

  const assets = predictions.map(p => p.asset_name);
  const energies = predictions.map(p => p.predicted_energy);

  const chartData = {
    labels: assets,
    datasets: [
      {
        label: "پیش‌بینی مصرف انرژی (kWh)",
        data: energies,
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: "دارایی‌ها" } },
      y: { title: { display: true, text: "مصرف انرژی (kWh)" } },
    },
  };

  return (
    <div className="modern-chart-card">
      <div className="chart-header">
        <div className="chart-title">
          <i className="fas fa-chart-bar"></i>
          <h5>نمودار پیش‌بینی انرژی دارایی‌ها</h5>
        </div>
        <div className="chart-subtitle">مقایسه مصرف انرژی پیش‌بینی شده</div>
      </div>
      
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="chart-footer">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#007bff' }}></div>
            <span>مصرف انرژی (kWh)</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modern-chart-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .chart-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .chart-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .chart-title i {
          font-size: 1.5rem;
          color: #667eea;
        }
        
        .chart-title h5 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .chart-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .chart-container {
          flex: 1;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chart-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f3f4f6;
        }
        
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }
        
        .legend-item span {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .modern-chart-card {
            padding: 1.5rem;
          }
          
          .chart-title {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .chart-container {
            min-height: 250px;
          }
          
          .chart-legend {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnergyChart;
