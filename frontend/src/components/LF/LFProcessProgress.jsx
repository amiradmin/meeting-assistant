// src/components/LF/LFProcessProgress.jsx
import React, { useState } from 'react';
import {
  FaChartLine,
  FaChartBar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaFlask,
  FaCubes,
  FaWater,
  FaThermometerHalf,
  FaTachometerAlt,
  FaFire,
  FaClock
} from 'react-icons/fa';

const LFProcessProgress = ({ lfData }) => {
  const { heatData, temperatures, analyses, currentPhase } = lfData;
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  // محاسبه پیشرفت فرآیند به صورت درصد
  const getPhaseProgress = () => {
    const currentTemp = temperatures[0]?.temperature || 1560;
    const targetTemp = heatData?.targetTemp || 1600;
    const minTemp = heatData?.tempMin || 1560;

    let progress = 0;

    switch (currentPhase) {
      case 'heating':
        progress = ((currentTemp - minTemp) / (targetTemp - minTemp)) * 100;
        break;
      case 'alloying':
        progress = (analyses?.length || 0) * 33;
        break;
      case 'holding':
        progress = 50;
        break;
      case 'trimming':
        progress = 25;
        break;
      default:
        progress = 0;
    }

    return Math.min(100, Math.max(0, progress));
  };

  // محاسبه درصد پیشرفت دما
  const getTemperatureProgress = () => {
    const currentTemp = temperatures[0]?.temperature || 1560;
    const targetTemp = heatData?.targetTemp || 1600;
    const minTemp = heatData?.tempMin || 1560;

    if (currentTemp >= targetTemp) return 100;
    if (currentTemp <= minTemp) return 0;

    return ((currentTemp - minTemp) / (targetTemp - minTemp)) * 100;
  };

  const phaseProgress = getPhaseProgress();
  const temperatureProgress = getTemperatureProgress();

  return (
    <div className="lf-process-progress">
      {/* Main Progress Circle */}
      <div className="card progress-circle-card">
        <h3>
          <FaChartLine />
          Overall Process Progress
        </h3>
        <div className="circle-progress-container">
          <div className="circle-progress">
            <svg viewBox="0 0 200 200" width="200" height="200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="var(--info)"
                strokeWidth="12"
                strokeDasharray={`${phaseProgress * 5.654} 565.4`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="circle-percent">
              {Math.floor(phaseProgress)}%
            </div>
          </div>
          <div className="circle-label">Process Completion</div>
        </div>
      </div>

      {/* Metric Progress Bars */}
      <div className="card metrics-card">
        <h3>
          <FaChartBar />
          Key Performance Indicators
        </h3>

        <div className="metric-progress">
          <div className="metric-header">
            <span>
              <FaThermometerHalf style={{ marginRight: '8px', color: 'var(--warning)' }} />
              Temperature Progress
            </span>
            <span>
              {temperatures[0]?.temperature || 0} / {heatData?.targetTemp || 1600}°C
              <span style={{ marginLeft: '8px', color: 'var(--warning)', fontWeight: 'bold' }}>
                ({Math.floor(temperatureProgress)}%)
              </span>
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${temperatureProgress}%`,
                backgroundColor: 'var(--warning)'
              }}
            />
          </div>
        </div>

        <div className="metric-progress">
          <div className="metric-header">
            <span>
              <FaFlask style={{ marginRight: '8px', color: 'var(--success)' }} />
              Chemical Analysis (Target Achievement)
            </span>
            <span>65%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '65%', backgroundColor: 'var(--success)' }} />
          </div>
        </div>

        <div className="metric-progress">
          <div className="metric-header">
            <span>
              <FaCubes style={{ marginRight: '8px', color: '#8b5cf6' }} />
              Alloy Addition Completion
            </span>
            <span>80%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '80%', backgroundColor: '#8b5cf6' }} />
          </div>
        </div>

        <div className="metric-progress">
          <div className="metric-header">
            <span>
              <FaWater style={{ marginRight: '8px', color: '#06b6d4' }} />
              Argon Stirring Effectiveness
            </span>
            <span>92%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '92%', backgroundColor: '#ec4899' }} />
          </div>
        </div>

        <div className="metric-progress">
          <div className="metric-header">
            <span>
              <FaTachometerAlt style={{ marginRight: '8px', color: 'var(--danger)' }} />
              Power Efficiency
            </span>
            <span>78%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '78%', backgroundColor: 'var(--danger)' }} />
          </div>
        </div>

        <div className="metric-progress">
          <div className="metric-header">
            <span>
              <FaClock style={{ marginRight: '8px', color: 'var(--info)' }} />
              Phase Completion
            </span>
            <span>{Math.floor(phaseProgress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${phaseProgress}%`, backgroundColor: 'var(--info)' }} />
          </div>
        </div>
      </div>

      {/* Quality Status */}
      <div className="card quality-card">
        <h3>
          <FaCheckCircle />
          Quality Status
        </h3>
        <div className="quality-grid">
          <div className="quality-item good">
            <FaCheckCircle />
            <div>
              <strong>Temperature</strong>
              <span>Within tolerance</span>
            </div>
          </div>
          <div className="quality-item good">
            <FaCheckCircle />
            <div>
              <strong>Chemical Composition</strong>
              <span>Mn, Si within spec</span>
            </div>
          </div>
          <div className="quality-item warning">
            <FaExclamationTriangle />
            <div>
              <strong>Sulfur Content</strong>
              <span>Near upper limit (0.032%)</span>
            </div>
          </div>
          <div className="quality-item good">
            <FaCheckCircle />
            <div>
              <strong>Inclusion Rating</strong>
              <span>Acceptable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card recommendations-card">
        <h3>
          <FaLightbulb />
          Process Recommendations
        </h3>
        <ul className="recommendations-list">
          <li>
            <FaFire />
            <span>Increase heating power by 2 MW to reach target temperature faster</span>
          </li>
          <li>
            <FaFlask />
            <span>Take new sample for sulfur check</span>
          </li>
          <li>
            <FaCubes />
            <span>Prepare calcium silicon for final deoxidation</span>
          </li>
          <li>
            <FaWater />
            <span>Adjust argon flow to 180 L/min for better homogenization</span>
          </li>
          <li>
            <FaChartLine />
            <span>Monitor temperature trends closely in final stage</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LFProcessProgress;