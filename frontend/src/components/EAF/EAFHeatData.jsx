// src/components/EAF/EAFHeatData.jsx
import React, { useState, useEffect } from 'react';
import {
  FaInfoCircle,
  FaPen,
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';

const EAFHeatData = ({ eafData }) => {
  const { heatData, refreshData, loading } = eafData;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState(heatData);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (heatData) {
      setEditedData(heatData);
    }
  }, [heatData]);

  const handleSave = async () => {
    if (!heatData?.id) {
      setSaveMessage({ type: 'error', text: 'No active heat to save' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updateData = {
        scrap_weight: editedData?.scrap_weight,
        dri_weight: editedData?.dri_weight,
        target_weight: editedData?.target_weight,
        temp_target: editedData?.temp_target,
        temp_min: editedData?.temp_min,
        temp_max: editedData?.temp_max,
        operator_name: editedData?.operator_name,
        shift_id: editedData?.shift_id,
        notes: editedData?.notes
      };

      const response = await fetch(`/api/eaf/heats/${heatData.id}/`, {
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
        <p>No heat data available. Please select a heat.</p>
      </div>
    );
  }

  return (
    <div className="eaf-heat-data">
      <div className="card">
        <div className="card-header">
          <h3>
            <FaInfoCircle />
            EAF Heat Data Configuration
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
            <div className="data-field">
              <label>Heat Number:</label>
              <span className="value">{heatData.heat_number}</span>
            </div>

            <div className="data-field">
              <label>Steel Grade:</label>
              <span className="value steel-grade">{heatData.steel_grade_code}</span>
            </div>

            <div className="data-field">
              <label>Scrap Weight (tons):</label>
              {isEditing ? (
                <input
                  type="number"
                  step="5"
                  value={editedData?.scrap_weight || 0}
                  onChange={(e) => setEditedData({ ...editedData, scrap_weight: parseFloat(e.target.value) })}
                />
              ) : (
                <span className="value">{heatData.scrap_weight || 0} tons</span>
              )}
            </div>

            <div className="data-field">
              <label>DRI Weight (tons):</label>
              {isEditing ? (
                <input
                  type="number"
                  step="5"
                  value={editedData?.dri_weight || 0}
                  onChange={(e) => setEditedData({ ...editedData, dri_weight: parseFloat(e.target.value) })}
                />
              ) : (
                <span className="value">{heatData.dri_weight || 0} tons</span>
              )}
            </div>

            <div className="data-field">
              <label>Target Weight (tons):</label>
              {isEditing ? (
                <input
                  type="number"
                  step="5"
                  value={editedData?.target_weight || 120}
                  onChange={(e) => setEditedData({ ...editedData, target_weight: parseFloat(e.target.value) })}
                />
              ) : (
                <span className="value">{heatData.target_weight || 120} tons</span>
              )}
            </div>

            <div className="data-field">
              <label>Current Liquid (tons):</label>
              <span className="value">{heatData.liquid_weight || 0} tons</span>
            </div>

            <div className="data-field full-width">
              <label>Temperature Reference:</label>
              <div className="temp-range-display">
                <span className="min">Min: {heatData.temp_min || 1600}°C</span>
                <span className="target">Target: {heatData.temp_target || 1620}°C</span>
                <span className="max">Max: ${heatData.temp_max || 1640}°C</span>
              </div>
            </div>

            <div className="data-field">
              <label>Status:</label>
              <span className="value status-value">
                <span className={`status-badge-small ${heatData.status}`}>
                  {heatData.status}
                </span>
              </span>
            </div>

            <div className="data-field">
              <label>Current Phase:</label>
              <span className="value phase-value">
                {heatData.current_phase || 'Preparation'}
              </span>
            </div>

            <div className="data-field">
              <label>Operator:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData?.operator_name || ''}
                  onChange={(e) => setEditedData({ ...editedData, operator_name: e.target.value })}
                />
              ) : (
                <span className="value">{heatData.operator_name || '—'}</span>
              )}
            </div>

            <div className="data-field">
              <label>Shift:</label>
              {isEditing ? (
                <select
                  value={editedData?.shift_id || 'A'}
                  onChange={(e) => setEditedData({ ...editedData, shift_id: e.target.value })}
                >
                  <option value="A">Shift A (06:00-14:00)</option>
                  <option value="B">Shift B (14:00-22:00)</option>
                  <option value="C">Shift C (22:00-06:00)</option>
                </select>
              ) : (
                <span className="value">{heatData.shift_id || '—'}</span>
              )}
            </div>

            <div className="data-field full-width">
              <label>Notes:</label>
              {isEditing ? (
                <textarea
                  rows="3"
                  value={editedData?.notes || ''}
                  onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                />
              ) : (
                <span className="value notes">{heatData.notes || '—'}</span>
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
    </div>
  );
};

export default EAFHeatData;