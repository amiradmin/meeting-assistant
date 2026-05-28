// src/components/LF/LFTemperatureControl.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaBolt,
  FaClock,
  FaChargingStation,
  FaTachometerAlt,
  FaPlay,
  FaPause,
  FaThermometerHalf,
  FaHistory,
  FaTimes,
  FaSave,
  FaSpinner,
  FaTrashAlt,
  FaExclamationTriangle,
  FaSyncAlt
} from 'react-icons/fa';

const LFTemperatureControl = ({ lfData }) => {
  const {
    heatData,
    temperatures,
    recordTemperature,
    readyToTap,
    refreshData,
    deleteTemperature,  // ✅ ADD THIS - get deleteTemperature from hook
    loading,
    error,
    currentPhase
  } = lfData;

  const [currentTemp, setCurrentTemp] = useState(null);
  const [oxygenActivity, setOxygenActivity] = useState(null);
  const [heatingPower, setHeatingPower] = useState(15);
  const [powerOnTime, setPowerOnTime] = useState(0);
  const [isHeating, setIsHeating] = useState(false);
  const [tempDelta, setTempDelta] = useState(0);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [estimatedTemp, setEstimatedTemp] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUpdatingPower, setIsUpdatingPower] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [lastTemperature, setLastTemperature] = useState(null);

  // Get temperature targets from heatData
  const targetTemp = heatData?.temp_target || heatData?.targetTemp || 1600;
  const tempMin = heatData?.temp_min || heatData?.tempMin || 1580;
  const tempMax = heatData?.temp_max || heatData?.tempMax || 1620;
  const heatId = heatData?.id;

  // Update heating power from heatData when it changes
  useEffect(() => {
    if (heatData?.heating_power || heatData?.heatingPower) {
      setHeatingPower(heatData.heating_power || heatData.heatingPower);
    }
  }, [heatData]);

  // Get the latest temperature from temperatures array
  useEffect(() => {
    if (temperatures && temperatures.length > 0) {
      const latestTemp = temperatures[0]?.temperature;
      if (latestTemp) {
        setCurrentTemp(latestTemp);
        setTempDelta(targetTemp - latestTemp);
        setLastTemperature(temperatures[0]);
      }
    }
  }, [temperatures, targetTemp]);

  // Temperature estimation simulation
  useEffect(() => {
    if (!currentTemp) return;

    let interval;
    if (isHeating && heatingPower > 0) {
      interval = setInterval(() => {
        setEstimatedTemp(prev => {
          const heatingRate = heatingPower * 0.005; // 0.5°C per minute per MW
          const newTemp = (prev || currentTemp) + heatingRate;
          return Math.min(newTemp, currentTemp + 50);
        });
        setPowerOnTime(t => t + 1);
      }, 1000);
    } else if (!isHeating) {
      // Cooling simulation
      interval = setInterval(() => {
        setEstimatedTemp(prev => {
          if (!prev || prev <= currentTemp) return currentTemp;
          const coolingRate = 0.1; // 0.1°C per second cooling
          const newTemp = prev - coolingRate;
          return Math.max(newTemp, currentTemp);
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isHeating, heatingPower, currentTemp]);

  // Update heating power on backend
  const updateHeatingPower = useCallback(async (newPower) => {
    if (!heatId) return;

    setIsUpdatingPower(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/lf/heats/${heatId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          heating_power: newPower
        })
      });

      if (response.ok) {
        console.log('Heating power updated successfully');
        // Refresh data to get updated values
        await refreshData();
      } else {
        console.error('Failed to update heating power');
      }
    } catch (error) {
      console.error('Error updating heating power:', error);
    } finally {
      setIsUpdatingPower(false);
    }
  }, [heatId, refreshData]);

  const handlePowerChange = async (e) => {
    const newPower = parseFloat(e.target.value);
    setHeatingPower(newPower);
    await updateHeatingPower(newPower);
  };

  const getTempColor = (temp) => {
    if (!temp) return '#6c757d';
    if (temp < tempMin) return '#0d6efd'; // Blue - too cold
    if (temp > tempMax) return '#dc3545'; // Red - too hot
    return '#28a745'; // Green - good
  };

  const getTempStatusMessage = () => {
    if (!currentTemp) return null;
    if (currentTemp < tempMin) {
      return { type: 'low', message: `Temperature is ${(tempMin - currentTemp).toFixed(0)}°C below target. Heating required.` };
    }
    if (currentTemp > tempMax) {
      return { type: 'high', message: `Temperature is ${(currentTemp - tempMax).toFixed(0)}°C above target. Cooling required.` };
    }
    return { type: 'good', message: 'Temperature is within optimal range.' };
  };

  const handleMeasure = async () => {
    if (!currentTemp) {
      alert('Please enter a temperature value');
      return;
    }

    setIsRecording(true);
    const result = await recordTemperature(currentTemp, oxygenActivity);
    setIsRecording(false);

    if (result.success) {
      setShowMeasurementModal(false);
      setCurrentTemp(null);
      setOxygenActivity(null);
      await refreshData();
    } else {
      alert('Error recording temperature: ' + (result.error || 'Unknown error'));
    }
  };

  const handleReadyToTap = async () => {
    if (!currentTemp) {
      alert('Please record a temperature measurement first');
      return;
    }

    const confirmMessage = `Ready to tap?\n\nFinal Temperature: ${currentTemp}°C\nTarget: ${targetTemp}°C\n\nConfirm to mark heat as ready for tapping.`;

    if (window.confirm(confirmMessage)) {
      const result = await readyToTap(currentTemp, {});
      if (result.success) {
        alert('Heat marked as ready to tap!');
        await refreshData();
      } else {
        alert('Error: ' + (result.error || 'Failed to mark as ready to tap'));
      }
    }
  };

  // ✅ UPDATED: Use deleteTemperature from hook instead of direct fetch
  const handleDeleteTemperature = async (temperatureId) => {
    setDeletingId(temperatureId);
    const result = await deleteTemperature(temperatureId);

    if (result.success) {
      setShowDeleteConfirm(null);
      // No need to call refreshData as the hook already updated the state
      // Optional: Show success message
      console.log('Temperature record deleted successfully');
    } else {
      alert('Failed to delete: ' + (result.error || 'Unknown error'));
    }

    setDeletingId(null);
  };

  const getEstimatedTimeToTarget = () => {
    if (!isHeating || currentTemp >= targetTemp || heatingPower === 0) return null;
    const tempDiff = targetTemp - currentTemp;
    const heatingRate = heatingPower * 0.005; // °C per second
    const secondsNeeded = tempDiff / heatingRate;
    if (!isFinite(secondsNeeded) || secondsNeeded < 0) return null;
    const minutes = Math.floor(secondsNeeded / 60);
    const seconds = Math.floor(secondsNeeded % 60);
    return { minutes, seconds };
  };

  const estimatedTime = getEstimatedTimeToTarget();
  const tempStatus = getTempStatusMessage();

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Confirm Delete Modal Component
  const ConfirmDeleteModal = ({ record, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header warning">
          <FaExclamationTriangle />
          <h3>Confirm Delete</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete this temperature record?</p>
          <p><strong>Temperature:</strong> {record.temperature}°C</p>
          <p><strong>Time:</strong> {formatDateTime(record.measured_at || record.time)}</p>
          <p className="warning-text">This action cannot be undone!</p>
        </div>
        <div className="modal-footer">
          <button className="btn-danger" onClick={onConfirm} disabled={deletingId === record.id}>
            {deletingId === record.id ? <FaSpinner className="spin" /> : <FaTrashAlt />}
            Delete
          </button>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">
          <FaSpinner className="spin" />
          <p>Loading temperature data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card error-card">
        <FaExclamationTriangle />
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={refreshData}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat selected. Please select a heat from the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="lf-temperature-control">
      {/* Main Temperature Display */}
      <div className="card temp-main-card">
        <div className="temp-header">
          <h3>
            <FaThermometerHalf />
            Temperature Control
            <span className="heat-badge">Heat #{heatData.heat_number || heatData.heatNumber}</span>
          </h3>
          <button className="btn-refresh-small" onClick={refreshData} title="Refresh data">
            <FaSyncAlt />
          </button>
        </div>

        <div className="temp-circle-container">
          <div
            className="temp-circle"
            style={{ borderColor: getTempColor(currentTemp) }}
          >
            <div className="temp-value">
              {currentTemp ? `${Math.round(currentTemp)}°C` : '---'}
            </div>
            <div className="temp-label">Current Temperature</div>
          </div>

          {isHeating && estimatedTemp && (
            <div className="temp-estimated">
              <div className="est-value">
                {Math.round(estimatedTemp)}°C
              </div>
              <div className="est-label">Estimated</div>
            </div>
          )}
        </div>

        <div className="temp-target-info">
          <div className="target-range">
            <div className="range-min" style={{ color: currentTemp < tempMin ? '#ff6b6b' : '#6c757d' }}>
              Min: {tempMin}°C
            </div>
            <div className="range-target">Target: {targetTemp}°C</div>
            <div className="range-max" style={{ color: currentTemp > tempMax ? '#ff6b6b' : '#6c757d' }}>
              Max: {tempMax}°C
            </div>
          </div>

          <div className="temp-delta">
            <span className={`delta-value ${tempDelta > 0 ? 'positive' : 'negative'}`}>
              {tempDelta > 0 ? `+${Math.round(tempDelta)}°C` : `${Math.round(tempDelta)}°C`}
            </span>
            <span className="delta-label">to target</span>
          </div>

          {tempStatus && (
            <div className={`temp-status temp-status-${tempStatus.type}`}>
              {tempStatus.type === 'low' && <FaArrowUp />}
              {tempStatus.type === 'high' && <FaArrowDown />}
              {tempStatus.type === 'good' && <FaCheckCircle />}
              <span>{tempStatus.message}</span>
            </div>
          )}

          {estimatedTime && isHeating && (
            <div className="estimated-time">
              <FaClock />
              <span>Est. time to target: {estimatedTime.minutes}m {estimatedTime.seconds}s</span>
            </div>
          )}
        </div>

        <div className="temp-buttons">
          <button
            className="btn-measure"
            onClick={() => setShowMeasurementModal(true)}
          >
            <FaThermometerHalf />
            New Measurement
          </button>
        </div>
      </div>

      {/* Power Control */}
      <div className="card power-control-card">
        <h3>
          <FaBolt />
          Arc Heating Control
        </h3>

        <div className="power-slider-container">
          <label>Power Set Point: {heatingPower.toFixed(1)} MW</label>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={heatingPower}
            onChange={handlePowerChange}
            disabled={isUpdatingPower}
          />
          {isUpdatingPower && <FaSpinner className="spin" style={{ marginLeft: '10px' }} />}
          <div className="power-scale">
            <span>0</span>
            <span>10</span>
            <span>20</span>
            <span>30 MW</span>
          </div>
        </div>

        <div className="power-stats">
          <div className="stat">
            <FaClock />
            <span>Power ON: {Math.floor(powerOnTime / 60)}m {powerOnTime % 60}s</span>
          </div>
          <div className="stat">
            <FaChargingStation />
            <span>Energy: {((heatingPower * powerOnTime) / 3600).toFixed(1)} MWh</span>
          </div>
          <div className="stat">
            <FaTachometerAlt />
            <span>Current Phase: {currentPhase || '—'}</span>
          </div>
        </div>

        <div className="power-buttons">
          <button
            className={`btn-heating ${isHeating ? 'active' : ''}`}
            onClick={() => setIsHeating(!isHeating)}
            disabled={!heatData}
          >
            {isHeating ? <FaPause /> : <FaPlay />}
            {isHeating ? 'Pause Heating' : 'Start Heating'}
          </button>
        </div>
      </div>

      {/* Temperature History */}
      <div className="card history-card">
        <h3>
          <FaHistory />
          Temperature History
          <span className="history-count">({temperatures?.length || 0} records)</span>
        </h3>

        <div className="history-list">
          {temperatures && temperatures.length > 0 ? (
            temperatures.slice(0, 10).map((temp, idx) => (
              <div key={temp.id || idx} className="history-item">
                <div className="history-info">
                  <div className="history-time">
                    {formatDateTime(temp.measured_at || temp.time)}
                  </div>
                  <div
                    className="history-temp"
                    style={{ color: getTempColor(temp.temperature) }}
                  >
                    {Math.round(temp.temperature)}°C
                  </div>
                  {temp.oxygen_activity && (
                    <div className="history-oxygen">
                      O₂: {Math.round(temp.oxygen_activity)} ppm
                    </div>
                  )}
                  <div className="history-phase">
                    Phase: {temp.phase || currentPhase || '—'}
                  </div>
                </div>
                <button
                  className="btn-delete-history"
                  onClick={() => setShowDeleteConfirm(temp)}
                  title="Delete record"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))
          ) : (
            <div className="no-data-message">
              <FaThermometerHalf />
              <p>No temperature records yet</p>
              <small>Click "New Measurement" to record the first temperature</small>
            </div>
          )}
        </div>
      </div>

      {/* Ready to Tap Button */}
      {currentTemp && currentTemp >= tempMin && currentTemp <= tempMax && (
        <div className="ready-to-tap">
          <button className="btn-ready" onClick={handleReadyToTap}>
            <FaCheckCircle />
            Ready to Tap
          </button>
        </div>
      )}

      {/* Measurement Modal */}
      {showMeasurementModal && (
        <div className="modal-overlay" onClick={() => setShowMeasurementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Temperature Measurement</h3>
              <button className="modal-close" onClick={() => setShowMeasurementModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Temperature (°C):</label>
                <input
                  type="number"
                  value={currentTemp || ''}
                  onChange={(e) => setCurrentTemp(parseFloat(e.target.value))}
                  placeholder="e.g., 1595"
                  autoFocus
                  step="0.5"
                />
                <small>Target: {targetTemp}°C (Range: {tempMin}-{tempMax}°C)</small>
              </div>
              <div className="input-group">
                <label>Oxygen Activity (ppm):</label>
                <input
                  type="number"
                  value={oxygenActivity || ''}
                  onChange={(e) => setOxygenActivity(parseFloat(e.target.value))}
                  placeholder="Optional"
                  step="0.1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={handleMeasure}
                disabled={isRecording || !currentTemp}
              >
                {isRecording ? <FaSpinner className="spin" /> : <FaSave />}
                {isRecording ? 'Saving...' : 'Save Measurement'}
              </button>
              <button className="btn-secondary" onClick={() => setShowMeasurementModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ UPDATED: Use handleDeleteTemperature instead of deleteTemperatureRecord */}
      {showDeleteConfirm && (
        <ConfirmDeleteModal
          record={showDeleteConfirm}
          onConfirm={() => handleDeleteTemperature(showDeleteConfirm.id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default LFTemperatureControl;