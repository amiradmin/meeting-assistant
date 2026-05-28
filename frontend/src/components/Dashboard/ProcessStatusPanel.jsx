// src/components/dashboard/ProcessStatusPanel.jsx
import React from 'react';
import './ProcessStatusPanel.css';

const ProcessStatusPanel = ({ data }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return 'fas fa-play-circle';
      case 'idle': return 'fas fa-pause-circle';
      case 'alarm': return 'fas fa-exclamation-circle';
      case 'maintenance': return 'fas fa-tools';
      default: return 'fas fa-question-circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'Running';
      case 'idle': return 'Idle';
      case 'alarm': return 'Alarm';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  // Helper to format percentage with color indicator
  const getPercentageColor = (value) => {
    if (value >= 80) return '#ef4444';
    if (value >= 60) return '#f59e0b';
    return '#10b981';
  };

  // Helper to get temperature color
  const getTemperatureColor = (temp) => {
    if (temp > 1650) return '#ef4444';
    if (temp > 1600) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="process-status-grid" dir="ltr">
      {/* EAF Card */}
      <div className="unit-card">
        <div className="unit-header">
          <div className="unit-title">
            <i className="fas fa-fire"></i>
            <span>Electric Arc Furnace (EAF)</span>
          </div>
          <span className={`status-badge status-${data.eaf?.status || 'idle'}`}>
            <i className={getStatusIcon(data.eaf?.status)}></i>
            <span>{getStatusText(data.eaf?.status)}</span>
          </span>
        </div>
        <div className="unit-metrics">
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-barcode"></i> Heat ID
            </span>
            <span className="metric-value-small">{data.eaf?.currentHeat || '---'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-thermometer-half"></i> Temperature
            </span>
            <span
              className="metric-value-small"
              style={{ color: getTemperatureColor(data.eaf?.temperature || 0) }}
            >
              {data.eaf?.temperature || 0}°C
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-bolt"></i> Power
            </span>
            <span
              className="metric-value-small"
              style={{ color: getPercentageColor(data.eaf?.power || 0) }}
            >
              {data.eaf?.power || 0}%
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-chart-line"></i> Phase
            </span>
            <span className="metric-value-small">{data.eaf?.phase || '---'}</span>
          </div>
        </div>
      </div>

      {/* LF Card */}
      <div className="unit-card">
        <div className="unit-header">
          <div className="unit-title">
            <i className="fas fa-flask"></i>
            <span>Ladle Furnace (LF)</span>
          </div>
          <span className={`status-badge status-${data.lf?.status || 'idle'}`}>
            <i className={getStatusIcon(data.lf?.status)}></i>
            <span>{getStatusText(data.lf?.status)}</span>
          </span>
        </div>
        <div className="unit-metrics">
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-thermometer-half"></i> Temperature
            </span>
            <span
              className="metric-value-small"
              style={{ color: getTemperatureColor(data.lf?.temperature || 0) }}
            >
              {data.lf?.temperature || 0}°C
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-wind"></i> Argon Flow
            </span>
            <span className="metric-value-small">{data.lf?.argonFlow || 0} L/min</span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-microchip"></i> Status
            </span>
            <span className="metric-value-small">{data.lf?.processStatus || 'Standby'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-clock"></i> Treatment Time
            </span>
            <span className="metric-value-small">{data.lf?.treatmentTime || '00:00'}</span>
          </div>
        </div>
      </div>

      {/* CCM Card */}
      <div className="unit-card">
        <div className="unit-header">
          <div className="unit-title">
            <i className="fas fa-stream"></i>
            <span>Continuous Casting Machine (CCM)</span>
          </div>
          <span className={`status-badge status-${data.ccm?.status || 'idle'}`}>
            <i className={getStatusIcon(data.ccm?.status)}></i>
            <span>{getStatusText(data.ccm?.status)}</span>
          </span>
        </div>
        <div className="unit-metrics">
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-tachometer-alt"></i> Casting Speed
            </span>
            <span className="metric-value-small">{data.ccm?.castingSpeed || 0} m/min</span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-water"></i> Mold Level
            </span>
            <span
              className="metric-value-small"
              style={{ color: getPercentageColor(data.ccm?.moldLevel || 0) }}
            >
              {data.ccm?.moldLevel || 0}%
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-temperature-low"></i> Cooling Water
            </span>
            <span className="metric-value-small">{data.ccm?.coolingWaterTemp || 42}°C</span>
          </div>
          <div className="metric-item">
            <span className="metric-label-small">
              <i className="fas fa-cut"></i> Cutting Status
            </span>
            <span className="metric-value-small">{data.ccm?.cuttingStatus || 'Normal'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessStatusPanel;