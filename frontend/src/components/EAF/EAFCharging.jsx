// src/components/EAF/EAFCharging.jsx
import React, { useState } from 'react';
import {
  FaTruck,
  FaPlus,
  FaTrashAlt,
  FaSpinner,
  FaSave,
  FaTimes,
  FaDollarSign,
  FaEdit,
  FaExclamationTriangle,
} from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/eaf';

const EAFCharging = ({ eafData }) => {
  const { heatData, chargingData, recordCharging, refreshData } = eafData;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [newCharge, setNewCharge] = useState({
    charging_type: 'bucket',
    material: '',
    weight: 0,
    operator_name: ''
  });

  const handleAddCharge = async () => {
    if (!newCharge.material || !newCharge.weight || newCharge.weight <= 0) {
      setErrorMessage('Please fill all required fields with valid values');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await recordCharging(newCharge);

    if (result.success) {
      setShowAddModal(false);
      setNewCharge({
        charging_type: 'bucket',
        material: '',
        weight: 0,
        operator_name: ''
      });
      alert('Charge recorded successfully!');
    } else {
      setErrorMessage(result.error || 'Failed to record charge');
      setTimeout(() => setErrorMessage(null), 3000);
    }
    setIsSubmitting(false);
  };

  const handleDeleteCharge = async (chargeId) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/chargings/${chargeId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshData();
        setShowDeleteConfirm(null);
        alert('Charge record deleted successfully!');
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Failed to delete charge');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting charge:', error);
      setErrorMessage('Network error. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateTotalWeight = () => {
    return chargingData.reduce((sum, charge) => sum + (charge.weight || 0), 0);
  };

  const calculateScrapWeight = () => {
    return chargingData
      .filter(charge => charge.charging_type === 'bucket')
      .reduce((sum, charge) => sum + (charge.weight || 0), 0);
  };

  const calculateDRIWeight = () => {
    return chargingData
      .filter(charge => charge.charging_type === 'continuous')
      .reduce((sum, charge) => sum + (charge.weight || 0), 0);
  };

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat. Please select a heat.</p>
      </div>
    );
  }

  const totalWeight = calculateTotalWeight();
  const scrapWeight = calculateScrapWeight();
  const driWeight = calculateDRIWeight();
  const targetProgress = heatData.target_weight > 0 ? (totalWeight / heatData.target_weight) * 100 : 0;

  return (
    <div className="eaf-charging">
      {/* Error Message */}
      {errorMessage && (
        <div className="error-toast">
          <FaExclamationTriangle />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Charging Summary Cards */}
      <div className="charging-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <FaTruck />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Charged</span>
            <span className="summary-value">{totalWeight.toFixed(1)} <small>tons</small></span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon scrap">
            <FaDollarSign />
          </div>
          <div className="summary-info">
            <span className="summary-label">Scrap (Bucket)</span>
            <span className="summary-value">{scrapWeight.toFixed(1)} <small>tons</small></span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon dri">
            <FaDollarSign />
          </div>
          <div className="summary-info">
            <span className="summary-label">DRI (Continuous)</span>
            <span className="summary-value">{driWeight.toFixed(1)} <small>tons</small></span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon target">
            <FaDollarSign />
          </div>
          <div className="summary-info">
            <span className="summary-label">Target Progress</span>
            <div className="progress-bar-small">
              <div className="progress-fill-small" style={{ width: `${Math.min(targetProgress, 100)}%` }}></div>
            </div>
            <span className="summary-value-small">{targetProgress.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Charging Records Table */}
      <div className="card">
        <div className="card-header">
          <h3>
            <FaTruck />
            Charging Records
          </h3>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Charge
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Material</th>
                  <th>Weight (tons)</th>
                  <th>Time</th>
                  <th>Operator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chargingData.length > 0 ? (
                  chargingData.map((charge) => (
                    <tr key={charge.id}>
                      <td>
                        <span className={`charge-type-badge ${charge.charging_type}`}>
                          {charge.charging_type === 'bucket' ? 'Bucket' : 'Continuous'}
                        </span>
                      </td>
                      <td><strong>{charge.material}</strong></td>
                      <td className="weight-cell">{charge.weight} tons</td>
                      <td className="time-cell">{new Date(charge.charging_time).toLocaleString()}</td>
                      <td>{charge.operator_name || '—'}</td>
                      <td className="action-buttons">
                        <button
                          className="btn-delete-charge"
                          onClick={() => setShowDeleteConfirm(charge)}
                          title="Delete charge record"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      <FaTruck />
                      <p>No charging records yet</p>
                      <small>Click "Add Charge" to record the first charge</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Charge Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPlus /> Add Charging Record</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Charging Type</label>
                <select
                  value={newCharge.charging_type}
                  onChange={(e) => setNewCharge({ ...newCharge, charging_type: e.target.value })}
                >
                  <option value="bucket">Bucket Charging (Scrap)</option>
                  <option value="continuous">Continuous Charging (DRI)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Material *</label>
                <input
                  type="text"
                  value={newCharge.material}
                  onChange={(e) => setNewCharge({ ...newCharge, material: e.target.value })}
                  placeholder="e.g., Heavy Scrap, Light Scrap, DRI, Pig Iron"
                />
              </div>
              <div className="form-group">
                <label>Weight (tons) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={newCharge.weight}
                  onChange={(e) => setNewCharge({ ...newCharge, weight: parseFloat(e.target.value) })}
                  placeholder="Weight in tons"
                />
                <small>Target weight: {heatData.target_weight || 120} tons</small>
              </div>
              <div className="form-group">
                <label>Operator Name</label>
                <input
                  type="text"
                  value={newCharge.operator_name}
                  onChange={(e) => setNewCharge({ ...newCharge, operator_name: e.target.value })}
                  placeholder="Operator name"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddCharge} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Add Charge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header warning">
              <FaExclamationTriangle />
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this charging record?</p>
              <p><strong>Material:</strong> {showDeleteConfirm.material}</p>
              <p><strong>Weight:</strong> {showDeleteConfirm.weight} tons</p>
              <p><strong>Time:</strong> {new Date(showDeleteConfirm.charging_time).toLocaleString()}</p>
              <p className="warning-text">This action cannot be undone!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteCharge(showDeleteConfirm.id)} disabled={isDeleting}>
                {isDeleting ? <FaSpinner className="spin" /> : <FaTrashAlt />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EAFCharging;