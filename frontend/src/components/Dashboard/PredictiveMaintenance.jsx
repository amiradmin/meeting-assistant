// components/Dashboard/PredictiveMaintenance.jsx
import React from 'react';

const PredictiveMaintenance = ({ kpis }) => {
  const predictions = [
    {
      asset: 'کمپرسور A1',
      prediction: 'خرابی در 72 ساعت آینده',
      confidence: 87,
      severity: 'high',
      remainingLife: 45
    },
    {
      asset: 'پمپ هیدرولیک B2',
      prediction: 'سرویس دوره‌ای',
      confidence: 92,
      severity: 'medium',
      remainingLife: 120
    },
    {
      asset: 'دستگاه برش C3',
      prediction: 'عملکرد نرمال',
      confidence: 95,
      severity: 'low',
      remainingLife: 480
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="card modern-card"  style={{height:"658px"}}>
      <div className="card-header modern-card-header" >
        <div className="d-flex align-items-center">
          <div className="header-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h5 className="card-title mb-0">تعمیرات پیش‌بینانه</h5>
            <p className="card-subtitle">پیش‌بینی‌های هوش مصنوعی</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="prediction-stats mb-4">
          <div className="stat-item">
            <div className="stat-value">{kpis.predicted_failures_next_7_days || 0}</div>
            <div className="stat-label">پیش‌بینی خرابی هفته آینده</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{kpis.assets_with_predictions || 7}</div>
            <div className="stat-label">تجهیزات تحت پوشش</div>
          </div>
        </div>

        <div className="predictions-list">
          <h6 className="section-title">پیش‌بینی‌های اخیر</h6>
          {predictions.map((pred, index) => (
            <div key={index} style={{marginTop:"10px"}} className={`prediction-item border-${getSeverityColor(pred.severity)}`}>
              <div className="prediction-header">
                <h6 className="asset-name">{pred.asset}</h6>
                <span className={`badge bg-${getSeverityColor(pred.severity)}`}>
                  {pred.confidence}% اطمینان
                </span>
              </div>
              <p className="prediction-text">{pred.prediction}</p>
              <div className="prediction-footer">
                <span className="life-indicator">
                  <i className="fas fa-clock"></i>
                  عمر باقی‌مانده: {pred.remainingLife} ساعت
                </span>
                <button className="btn-action">بررسی جزئیات</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .prediction-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          text-align: center;
        }

        .stat-item {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin: 0;
        }

        .section-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .predictions-list {
          space-y: 1rem;
        }

        .prediction-item {
          background: white;
          border-radius: 10px;
          padding: 1rem;
          border-right: 4px solid;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .prediction-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .asset-name {
          font-weight: 600;
          margin: 0;
          font-size: 0.9rem;
        }

        .prediction-text {
          font-size: 0.85rem;
          color: #5a6c7d;
          margin-bottom: 0.75rem;
        }

        .prediction-footer {
          display: flex;
          justify-content: between;
          align-items: center;
        }

        .life-indicator {
          font-size: 0.8rem;
          color: #6c757d;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-action {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .prediction-stats {
            grid-template-columns: 1fr;
          }

          .prediction-footer {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default PredictiveMaintenance;