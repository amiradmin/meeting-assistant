// src/components/EAF/EAFMeltingControl.jsx
import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaChartLine,
  FaBolt,
  FaTachometerAlt,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaExclamationTriangle,
  FaSyncAlt,
} from 'react-icons/fa';

const EAFMeltingControl = ({ eafData }) => {
  const { heatData, startMelting, changePhase, completeHeat, refreshData, loading } = eafData;
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const phases = [
    { id: 'preparation', name: 'Preparation', icon: 'fa-clock', color: '#8b5cf6' },
    { id: 'charging', name: 'Charging', icon: 'fa-truck', color: '#f59e0b' },
    { id: 'melting', name: 'Melting', icon: 'fa-fire', color: '#ef4444' },
    { id: 'foaming_slag', name: 'Foaming Slag', icon: 'fa-bubble', color: '#ec4899' },
    { id: 'refining', name: 'Refining', icon: 'fa-filter', color: '#3b82f6' },
    { id: 'tapping', name: 'Tapping', icon: 'fa-tint', color: '#10b981' },
  ];

  const handleStartMelting = async () => {
    setIsStarting(true);
    const result = await startMelting();
    if (result.success) {
      alert('Melting started successfully!');
      await refreshData();
    } else {
      alert(result.error || 'Failed to start melting');
    }
    setIsStarting(false);
  };

  const handleChangePhase = async (phaseId) => {
    const result = await changePhase(phaseId);
    if (result.success) {
      await refreshData();
    } else {
      alert(result.error || 'Failed to change phase');
    }
  };

  const handleComplete = async () => {
    if (window.confirm('Complete this heat?')) {
      setIsCompleting(true);
      const result = await completeHeat();
      if (result.success) {
        alert('Heat completed successfully!');
      } else {
        alert(result.error || 'Failed to complete heat');
      }
      setIsCompleting(false);
    }
  };

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat. Please select or create a heat.</p>
      </div>
    );
  }

  const currentPhase = heatData.current_phase || 'preparation';
  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  const progress = ((currentPhaseIndex + 1) / phases.length) * 100;

  return (
    <div className="eaf-melting-control">
      {/* Progress Section */}
      <div className="card">
        <h3>
          <FaChartLine />
          Melting Progress
        </h3>
        <div className="progress-container">
          <div className="progress-steps">
            {phases.map((phase, idx) => (
              <div
                key={phase.id}
                className={`progress-step ${idx <= currentPhaseIndex ? 'completed' : ''} ${phase.id === currentPhase ? 'active' : ''}`}
                onClick={() => handleChangePhase(phase.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="step-dot" style={{ background: phase.color }}></div>
                <div className="step-name">{phase.name}</div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-percent">{Math.round(progress)}% Complete</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="card">
        <h3>
          <FaBolt />
          Melting Control
        </h3>
        <div className="control-buttons">
          {heatData.status === 'planned' && (
            <button className="btn-start" onClick={handleStartMelting} disabled={isStarting}>
              {isStarting ? <FaSpinner className="spin" /> : <FaPlay />}
              Start Melting
            </button>
          )}
          {(heatData.status === 'melting' || heatData.status === 'refining') && (
            <button className="btn-complete" onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? <FaSpinner className="spin" /> : <FaCheckCircle />}
              Complete Heat
            </button>
          )}
          <button className="btn-refresh" onClick={refreshData}>
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {/* Heat Information */}
      <div className="card">
        <h3>Heat Information</h3>
        <div className="heat-info-grid">
          <div className="info-item">
            <label>Heat Number:</label>
            <span>#{heatData.heat_number}</span>
          </div>
          <div className="info-item">
            <label>Steel Grade:</label>
            <span>{heatData.steel_grade_detail?.code || heatData.steel_grade}</span>
          </div>
          <div className="info-item">
            <label>Scrap Weight:</label>
            <span>{heatData.scrap_weight || 0} tons</span>
          </div>
          <div className="info-item">
            <label>DRI Weight:</label>
            <span>{heatData.dri_weight || 0} tons</span>
          </div>
          <div className="info-item">
            <label>Liquid Steel:</label>
            <span>{heatData.liquid_weight || 0} tons</span>
          </div>
          <div className="info-item">
            <label>Target Weight:</label>
            <span>{heatData.target_weight || 0} tons</span>
          </div>
          <div className="info-item">
            <label>Target Temp:</label>
            <span>{heatData.temp_target}°C</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span className={`status-${heatData.status}`}>{heatData.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EAFMeltingControl;