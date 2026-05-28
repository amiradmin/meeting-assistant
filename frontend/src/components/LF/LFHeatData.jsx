// src/components/LF/LFHeatData.jsx
import React, { useState, useEffect } from 'react';
import { STEEL_TEMP_REFERENCES, STEEL_ANALYSIS_LIMITS, LFService } from '../../services/lfService';
import {
  FaInfoCircle,
  FaPen,
  FaTimes,
  FaSave,
  FaChartLine,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const LFHeatData = ({ lfData }) => {
  const { heatData, refreshData, steelGrades, loading } = lfData;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState(heatData);
  const [saveMessage, setSaveMessage] = useState(null);
  const [selectedSteel, setSelectedSteel] = useState('');

  // Update edited data when heatData changes (from different heat selection)
  useEffect(() => {
    if (heatData) {
      setEditedData(heatData);
      // Set selected steel from heatData
      const steelCode = heatData?.steel_grade_detail?.code ||
                        heatData?.steel_grade?.code ||
                        heatData?.steelGrade ||
                        'ST52-3';
      setSelectedSteel(steelCode);
    }
  }, [heatData]);

  // تطبیق با فرمت داده‌های بک‌اند (snake_case)
  const currentSteelGrade = heatData?.steel_grade_detail?.code ||
                           heatData?.steel_grade?.code ||
                           heatData?.steelGrade ||
                           'ST52-3';

  // استفاده از steelGrades از بک‌اند اگر موجود باشد، در غیر این صورت از ثابت‌ها استفاده کن
  const steelGradesList = steelGrades?.length > 0
    ? steelGrades.map(g => g.code)
    : Object.keys(STEEL_TEMP_REFERENCES);

  // تابع برای دریافت دماهای مرجع از گرید انتخاب شده
  const getTempReference = (steelCode) => {
    const gradeFromBackend = steelGrades?.find(g => g.code === steelCode);
    if (gradeFromBackend) {
      return {
        min: gradeFromBackend.temp_min,
        target: gradeFromBackend.temp_target,
        max: gradeFromBackend.temp_max
      };
    }
    return STEEL_TEMP_REFERENCES[steelCode] || { min: 1570, target: 1600, max: 1620 };
  };

  const handleSave = async () => {
    if (!heatData?.id) {
      setSaveMessage({ type: 'error', text: 'No active heat to save' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // آماده سازی داده برای ارسال
      const updateData = {
        heat_number: editedData?.heat_number || editedData?.heatNumber,
        steel_grade: selectedSteel,
        liquid_weight: editedData?.liquid_weight || editedData?.liquidWeight,
        target_liquid_weight: editedData?.target_liquid_weight || editedData?.targetLiquidWeight,
        production_standard: editedData?.production_standard || editedData?.productionStandard,
        shift_id: editedData?.shift_id || editedData?.shiftId,
        operator_name: editedData?.operator_name || editedData?.operatorName,
        notes: editedData?.notes
      };

      // ارسال به API
      const response = await fetch(`/api/lf/heats/${heatData.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Heat data saved successfully!' });
        setIsEditing(false);
        setTimeout(() => setSaveMessage(null), 3000);
        refreshData();
      } else {
        const error = await response.json();
        setSaveMessage({ type: 'error', text: error.message || 'Error saving data' });
      }
    } catch (error) {
      console.error('Error saving heat data:', error);
      setSaveMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">
          <FaSpinner className="spin" />
          <p>Loading heat data...</p>
        </div>
      </div>
    );
  }

  if (!heatData) {
    return (
      <div className="card">
        <p>No heat data available. Please select a heat from the dashboard or start a new heat.</p>
      </div>
    );
  }

  // استخراج مقادیر از heatData
  const heatNumber = heatData.heat_number || heatData.heatNumber;
  const liquidWeight = heatData.liquid_weight || heatData.liquidWeight || 0;
  const targetLiquidWeight = heatData.target_liquid_weight || heatData.targetLiquidWeight || 120;
  const tempMin = heatData.temp_min || heatData.tempMin || 1580;
  const tempTarget = heatData.temp_target || heatData.tempTarget || 1600;
  const tempMax = heatData.temp_max || heatData.tempMax || 1620;
  const productionStandard = heatData.production_standard || heatData.productionStandard || 'LF_STD_FAST';
  const shiftId = heatData.shift_id || heatData.shiftId || 'SHIFT_A';
  const operatorName = heatData.operator_name || heatData.operatorName || '';
  const startTime = heatData.start_time || heatData.startTime;
  const notes = heatData.notes || '';

  return (
    <div className="lf-heat-data">
      <div className="card">
        <div className="card-header">
          <h3>
            <FaInfoCircle />
            Heat Data Configuration
            {heatData.heat_number && <span className="heat-id-badge">Heat #{heatData.heat_number}</span>}
          </h3>
          <div className="header-actions">
            {saveMessage && (
              <span className={`save-message ${saveMessage.type}`}>
                {saveMessage.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
                {saveMessage.text}
              </span>
            )}
            <button
              className="btn-edit"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSaving}
            >
              {isEditing ? <FaTimes /> : <FaPen />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="data-grid">
            {/* Heat Number */}
            <div className="data-field">
              <label>Heat Number:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.heat_number || editedData?.heatNumber || heatNumber}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    heat_number: e.target.value,
                    heatNumber: e.target.value
                  })}
                />
              ) : (
                <span className="value">{heatNumber}</span>
              )}
            </div>

            {/* Steel Grade */}
            <div className="data-field">
              <label>Steel Grade:</label>
              {isEditing ? (
                <select
                  value={selectedSteel}
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setSelectedSteel(newGrade);
                    const tempRef = getTempReference(newGrade);
                    setEditedData({
                      ...editedData,
                      steel_grade: newGrade,
                      steelGrade: newGrade,
                      temp_min: tempRef.min,
                      tempMin: tempRef.min,
                      temp_target: tempRef.target,
                      tempTarget: tempRef.target,
                      temp_max: tempRef.max,
                      tempMax: tempRef.max
                    });
                  }}
                >
                  {steelGradesList.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              ) : (
                <span className="value steel-grade">{currentSteelGrade}</span>
              )}
            </div>

            {/* Liquid Weight */}
            <div className="data-field">
              <label>Liquid Weight (tons):</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.5"
                  value={editedData?.liquid_weight || editedData?.liquidWeight || liquidWeight}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    liquid_weight: parseFloat(e.target.value),
                    liquidWeight: parseFloat(e.target.value)
                  })}
                />
              ) : (
                <span className="value">{liquidWeight.toFixed(1)} tons</span>
              )}
            </div>

            {/* Target Liquid Weight */}
            <div className="data-field">
              <label>Target to Tap (tons):</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.5"
                  value={editedData?.target_liquid_weight || editedData?.targetLiquidWeight || targetLiquidWeight}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    target_liquid_weight: parseFloat(e.target.value),
                    targetLiquidWeight: parseFloat(e.target.value)
                  })}
                />
              ) : (
                <span className="value">{targetLiquidWeight.toFixed(1)} tons</span>
              )}
            </div>

            {/* Temperature Range - Read Only */}
            <div className="data-field full-width">
              <label>Temperature Reference:</label>
              <div className="temp-range-display">
                <span className="min">Min: {tempMin}°C</span>
                <span className="target">Target: {tempTarget}°C</span>
                <span className="max">Max: {tempMax}°C</span>
              </div>
            </div>

            {/* Status - Read Only */}
            <div className="data-field">
              <label>Status:</label>
              <span className="value status-value">
                <span className={`status-badge-small ${heatData.status}`}>
                  {heatData.status === 'running' ? 'Running' :
                   heatData.status === 'ready_to_tap' ? 'Ready to Tap' :
                   heatData.status === 'completed' ? 'Completed' :
                   heatData.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                </span>
              </span>
            </div>

            {/* Current Phase - Read Only */}
            <div className="data-field">
              <label>Current Phase:</label>
              <span className="value phase-value">
                {heatData.current_phase || heatData.currentPhase || '—'}
              </span>
            </div>

            {/* Production Standard */}
            <div className="data-field">
              <label>Production Standard:</label>
              {isEditing ? (
                <select
                  value={editedData?.production_standard || editedData?.productionStandard || productionStandard}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    production_standard: e.target.value,
                    productionStandard: e.target.value
                  })}
                >
                  <option value="LF_STD_FAST">LF_STD_FAST (Fast Treatment)</option>
                  <option value="LF_STD_STANDARD">LF_STD_STANDARD (Standard)</option>
                  <option value="LF_STD_PRECISE">LF_STD_PRECISE (Precise)</option>
                </select>
              ) : (
                <span className="value">{productionStandard}</span>
              )}
            </div>

            {/* Shift & Operator */}
            <div className="data-field">
              <label>Shift / Operator:</label>
              {isEditing ? (
                <div className="inline-group">
                  <select
                    value={editedData?.shift_id || editedData?.shiftId || shiftId}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      shift_id: e.target.value,
                      shiftId: e.target.value
                    })}
                  >
                    <option value="SHIFT_A">Shift A (06:00-14:00)</option>
                    <option value="SHIFT_B">Shift B (14:00-22:00)</option>
                    <option value="SHIFT_C">Shift C (22:00-06:00)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Operator Name"
                    value={editedData?.operator_name || editedData?.operatorName || operatorName}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      operator_name: e.target.value,
                      operatorName: e.target.value
                    })}
                  />
                </div>
              ) : (
                <span className="value">{shiftId} / {operatorName || '—'}</span>
              )}
            </div>

            {/* Start Time - Read Only */}
            <div className="data-field">
              <label>Heat Start Time:</label>
              <span className="value">
                {startTime ? new Date(startTime).toLocaleString() : '—'}
              </span>
            </div>

            {/* Notes */}
            <div className="data-field full-width">
              <label>Notes:</label>
              {isEditing ? (
                <textarea
                  rows="3"
                  value={editedData?.notes || notes}
                  onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                  placeholder="Any remarks or special instructions..."
                />
              ) : (
                <span className="value notes">{notes || '—'}</span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <FaSpinner className="spin" /> : <FaSave />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Temperature Reference Chart - Read Only */}
      <div className="card">
        <h3>
          <FaChartLine />
          Temperature Reference by Steel Grade
        </h3>
        <div className="temp-chart">
          {steelGradesList.map(grade => {
            const tempRef = getTempReference(grade);
            return (
              <div key={grade} className="temp-row">
                <span className="grade">{grade}</span>
                <div className="temp-bar-container">
                  <div
                    className="temp-bar"
                    style={{
                      left: `${(tempRef.min - 1550) / 100 * 100}%`,
                      width: `${(tempRef.max - tempRef.min) / 100 * 100}%`
                    }}
                  >
                    <span className="temp-target">
                      {tempRef.target}°C
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LFHeatData;