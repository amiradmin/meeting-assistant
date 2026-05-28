// src/components/EAF/EAFElectricalProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FaChartLine,
  FaBolt,
  FaTachometerAlt,
  FaCheckCircle,
  FaPlug,
  FaInfoCircle,
} from 'react-icons/fa';
import {
  HiTrendingUp,
  HiTrendingDown
} from 'react-icons/hi';

const EAFElectricalProfile = ({ eafData }) => {
  const { heatData, electricalProfiles, changePhase } = eafData;
  const [selectedProfile, setSelectedProfile] = useState(heatData?.electrical_profile || 'STANDARD');
  const [workingPoint, setWorkingPoint] = useState(heatData?.working_point || 1);

  // Refs for canvases
  const powerCanvasRef = useRef(null);
  const voltageCanvasRef = useRef(null);
  const currentCanvasRef = useRef(null);

  const profiles = {
    STANDARD: {
      name: 'Standard Profile',
      description: 'Balanced power consumption for regular melting',
      workingPoints: [1, 2, 3, 4, 5],
      icon: '⚖️',
      efficiency: 85,
    },
    FAST: {
      name: 'Fast Melting',
      description: 'High power for faster melting, higher energy consumption',
      workingPoints: [3, 4, 5, 6, 7],
      icon: '⚡',
      efficiency: 75,
    },
    ECONOMY: {
      name: 'Economy Mode',
      description: 'Lower power consumption for cost efficiency',
      workingPoints: [1, 2, 3],
      icon: '💰',
      efficiency: 92,
    },
    PRECISE: {
      name: 'Precise Control',
      description: 'Fine-tuned control for special steel grades',
      workingPoints: [4, 5, 6],
      icon: '🎯',
      efficiency: 88,
    },
  };

  const getWorkingPointData = (wp) => {
    const data = {
      1: { voltage: 550, current: 45, tapPos: 1, power: 35, energyCost: 42 },
      2: { voltage: 600, current: 50, tapPos: 2, power: 42, energyCost: 50 },
      3: { voltage: 650, current: 55, tapPos: 3, power: 50, energyCost: 60 },
      4: { voltage: 700, current: 60, tapPos: 4, power: 58, energyCost: 70 },
      5: { voltage: 750, current: 65, tapPos: 5, power: 65, energyCost: 78 },
      6: { voltage: 800, current: 70, tapPos: 6, power: 72, energyCost: 86 },
      7: { voltage: 850, current: 75, tapPos: 7, power: 78, energyCost: 94 },
      8: { voltage: 900, current: 80, tapPos: 8, power: 85, energyCost: 102 },
      9: { voltage: 950, current: 85, tapPos: 9, power: 92, energyCost: 110 },
      10: { voltage: 1000, current: 90, tapPos: 10, power: 100, energyCost: 120 },
    };
    return data[wp] || data[1];
  };

  const currentWPData = getWorkingPointData(workingPoint);
  const profile = profiles[selectedProfile] || profiles.STANDARD;

  // Draw gauge with needle
  const drawGauge = (canvas, value, minValue, maxValue, unit, label, color) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height - 30;
    const radius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gauge background arc
    const startAngle = -Math.PI;
    const endAngle = 0;
    const angleRange = Math.PI;

    // Draw background arc (light gray)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw value arc with gradient
    const percentage = (value - minValue) / (maxValue - minValue);
    const valueAngle = startAngle + (angleRange * percentage);

    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(1, color || '#ef4444');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw tick marks
    for (let i = 0; i <= 10; i++) {
      const tickAngle = startAngle + (angleRange * (i / 10));
      const tickValue = minValue + (maxValue - minValue) * (i / 10);
      const innerRadius = radius - 10;
      const outerRadius = radius + 5;

      const x1 = centerX + innerRadius * Math.cos(tickAngle);
      const y1 = centerY + innerRadius * Math.sin(tickAngle);
      const x2 = centerX + outerRadius * Math.cos(tickAngle);
      const y2 = centerY + outerRadius * Math.sin(tickAngle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw tick labels
      if (i % 2 === 0) {
        const labelX = centerX + (radius + 15) * Math.cos(tickAngle);
        const labelY = centerY + (radius + 15) * Math.sin(tickAngle);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText(Math.round(tickValue), labelX - 8, labelY - 5);
      }
    }

    // Draw needle
    const needleAngle = startAngle + (angleRange * percentage);
    const needleLength = radius - 15;
    const needleX = centerX + needleLength * Math.cos(needleAngle);
    const needleY = centerY + needleLength * Math.sin(needleAngle);

    // Draw needle shadow
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.lineTo(centerX + 5, centerY - 5);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // Draw value text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText(value, centerX, centerY - 40);

    ctx.font = '12px Arial';
    ctx.fillStyle = '#64748b';
    ctx.fillText(unit, centerX, centerY - 20);

    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#475569';
    ctx.fillText(label, centerX, centerY + 15);
  };

  // Draw gauges when data changes
  useEffect(() => {
    drawGauge(powerCanvasRef.current, currentWPData.power, 0, 120, 'MW', 'Power', '#ef4444');
    drawGauge(voltageCanvasRef.current, currentWPData.voltage, 400, 1200, 'V', 'Voltage', '#3b82f6');
    drawGauge(currentCanvasRef.current, currentWPData.current, 0, 120, 'kA', 'Current', '#10b981');
  }, [currentWPData]);

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat. Please select a heat.</p>
      </div>
    );
  }

  return (
    <div className="eaf-electrical-profile">
      {/* Gauges Section */}
      <div className="gauges-section">
        <div className="gauge-card">
          <div className="gauge-header">
            <FaBolt className="gauge-icon" />
            <span>Power Output</span>
          </div>
          <canvas
            ref={powerCanvasRef}
            width={300}
            height={200}
            style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
          />
        </div>

        <div className="gauge-card">
          <div className="gauge-header">
            <FaChartLine className="gauge-icon" />
            <span>Voltage</span>
          </div>
          <canvas
            ref={voltageCanvasRef}
            width={300}
            height={200}
            style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
          />
        </div>

        <div className="gauge-card">
          <div className="gauge-header">
            <FaPlug className="gauge-icon" />
            <span>Current</span>
          </div>
          <canvas
            ref={currentCanvasRef}
            width={300}
            height={200}
            style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
          />
        </div>
      </div>

      {/* Profile Cards */}
      <div className="card">
        <h3>
          <FaChartLine />
          Electrical Profile
        </h3>
        <div className="profile-selector">
          <div className="profile-cards">
            {Object.entries(profiles).map(([key, prof]) => (
              <div
                key={key}
                className={`profile-card ${selectedProfile === key ? 'active' : ''}`}
                onClick={() => setSelectedProfile(key)}
              >
                <div className="profile-icon">{prof.icon}</div>
                <div className="profile-name">{prof.name}</div>
                <div className="profile-desc">{prof.description}</div>
                <div className="profile-efficiency">
                  <div className="efficiency-bar">
                    <div className="efficiency-fill" style={{ width: `${prof.efficiency}%` }}></div>
                  </div>
                  <span className="efficiency-text">{prof.efficiency}% efficiency</span>
                </div>
                {selectedProfile === key && <FaCheckCircle className="check-icon" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Working Point Selection */}
      <div className="card">
        <h3>
          <FaTachometerAlt />
          Working Point Selection
        </h3>
        <div className="working-points">
          {profile.workingPoints.map((wp) => (
            <button
              key={wp}
              className={`wp-btn ${workingPoint === wp ? 'active' : ''}`}
              onClick={() => setWorkingPoint(wp)}
            >
              <span className="wp-number">WP {wp}</span>
              <span className="wp-power">{getWorkingPointData(wp).power} MW</span>
            </button>
          ))}
        </div>

        {/* Real-time Parameters Dashboard */}
        <div className="wp-dashboard">
          <div className="dashboard-title">
            <FaInfoCircle />
            <span>Current Parameters</span>
          </div>
          <div className="wp-details">
            <div className="detail-card">
              <label>Voltage</label>
              <span className="detail-value">{currentWPData.voltage} V</span>
              <div className="detail-trend trend-stable">
                <HiTrendingUp />
                <span>Optimal</span>
              </div>
            </div>
            <div className="detail-card">
              <label>Current</label>
              <span className="detail-value">{currentWPData.current} kA</span>
              <div className="detail-trend trend-up">
                <HiTrendingUp />
                <span>+5%</span>
              </div>
            </div>
            <div className="detail-card">
              <label>Tap Position</label>
              <span className="detail-value">{currentWPData.tapPos}</span>
              <div className="detail-trend trend-stable">
                <span>Set</span>
              </div>
            </div>
            <div className="detail-card">
              <label>Power</label>
              <span className="detail-value">{currentWPData.power} MW</span>
              <div className="detail-trend trend-up">
                <HiTrendingUp />
                <span>+12%</span>
              </div>
            </div>
            <div className="detail-card">
              <label>Energy Cost</label>
              <span className="detail-value">${currentWPData.energyCost}/MWh</span>
              <div className="detail-trend trend-down">
                <HiTrendingDown />
                <span>Market rate</span>
              </div>
            </div>
            <div className="detail-card">
              <label>Efficiency</label>
              <span className="detail-value">{profile.efficiency}%</span>
              <div className="detail-trend trend-stable">
                <span>{selectedProfile}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="profile-recommendation">
          <div className="recommendation-icon">💡</div>
          <div className="recommendation-content">
            <div className="recommendation-title">Recommendation</div>
            <div className="recommendation-text">
              {selectedProfile === 'FAST' && "Fast Melting profile selected. Monitor electrode consumption closely."}
              {selectedProfile === 'ECONOMY' && "Economy mode active. Power consumption optimized for cost savings."}
              {selectedProfile === 'PRECISE' && "Precise control mode. Ideal for special steel grades."}
              {selectedProfile === 'STANDARD' && "Standard profile provides balanced performance for regular operations."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EAFElectricalProfile;