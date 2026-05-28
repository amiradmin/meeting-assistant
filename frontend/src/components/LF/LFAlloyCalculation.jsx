// src/components/LF/LFAlloyCalculation.jsx
import React, { useState, useEffect } from 'react';
import { ALLOYS_REFERENCE } from '../../services/lfService';
import {
  FaCalculator,
  FaCubes,
  FaBook,
  FaCheck,
  FaPaperPlane,
  FaChartLine,
  FaWeightHanging,
  FaArrowUp,
  FaEdit,
  FaTrashAlt,
  FaSave,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaPlus,
  FaSyncAlt,
  FaFlask,
  FaInfoCircle
} from 'react-icons/fa';

const LFAlloyCalculation = ({ lfData }) => {
  const {
    heatData,
    analyses,
    additions,
    confirmAddition,
    refreshData,
    loading,
    error
  } = lfData;

  const [calculationResult, setCalculationResult] = useState(null);
  const [localAdditions, setLocalAdditions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAlloy, setEditingAlloy] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlloy, setNewAlloy] = useState({
    material: '',
    material_code: '',
    required_amount: 0,
    element: '',
    target_value: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Get the latest analysis from the analyses array (first item in results)
  const getLatestAnalysis = () => {
    if (!analyses) return null;

    // If analyses is an array with results property (paginated response)
    let analysisList = analyses;
    if (analyses.results && Array.isArray(analyses.results)) {
      analysisList = analyses.results;
    }

    // If analyses is directly an array
    if (Array.isArray(analysisList) && analysisList.length > 0) {
      // Return the first item (latest analysis)
      return analysisList[0];
    }

    return null;
  };

  const latestAnalysis = getLatestAnalysis();
  const currentElements = latestAnalysis?.elements || null;

  // Calculate required alloys based on current analysis and target steel grade
  const calculateRequiredAlloys = () => {
    if (!heatData || !currentElements) return null;

    // Get target composition based on steel grade
    const steelGradeCode = heatData.steel_grade_detail?.code ||
                          heatData.steel_grade?.code ||
                          heatData.steel_grade ||
                          'CK45';

    // Target composition for different steel grades (based on standard specifications)
    const targetComposition = {
      'ST52-3': {
        C: 0.20, Mn: 1.40, Si: 0.55, P: 0.025, S: 0.025, Cr: 0.10, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si']
      },
      'CK45': {
        C: 0.45, Mn: 0.65, Si: 0.25, P: 0.025, S: 0.025, Cr: 0.10, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si']
      },
      '42CrMo4': {
        C: 0.42, Mn: 0.70, Si: 0.25, P: 0.025, S: 0.025, Cr: 1.05, Ni: 0.10, Mo: 0.20, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si', 'Cr', 'Mo']
      },
      'S355J2': {
        C: 0.20, Mn: 1.40, Si: 0.55, P: 0.025, S: 0.025, Cr: 0.10, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si']
      },
      '100Cr6': {
        C: 0.98, Mn: 0.35, Si: 0.25, P: 0.025, S: 0.015, Cr: 1.50, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Cr']
      },
      'ST37-2': {
        C: 0.17, Mn: 1.40, Si: 0.55, P: 0.045, S: 0.045, Cr: 0.10, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si']
      },
      '16MnCr5': {
        C: 0.16, Mn: 1.20, Si: 0.25, P: 0.025, S: 0.025, Cr: 1.00, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si', 'Cr']
      },
      'C22': {
        C: 0.22, Mn: 0.55, Si: 0.25, P: 0.025, S: 0.025, Cr: 0.10, Ni: 0.10, Mo: 0.05, Al: 0.020,
        requiredElements: ['C', 'Mn', 'Si']
      }
    };

    const target = targetComposition[steelGradeCode] || targetComposition['CK45'];
    const requiredElements = target.requiredElements || ['C', 'Mn', 'Si'];

    // Alloy calculation logic
    const liquidWeight = heatData.liquid_weight || 120; // tons
    const alloys = [];

    // Alloy specifications (recovery rates and composition)
    const alloySpecs = {
      'C': {
        name: 'Carbon (Graphite)',
        key: 'C',
        recovery: 0.85,
        composition: 1.0, // 100% carbon
        costPerKg: 1.5
      },
      'Mn': {
        name: 'Ferro Manganese (FeMn)',
        key: 'FeMn',
        recovery: 0.90,
        composition: 0.75, // 75% Mn
        costPerKg: 2.0
      },
      'Si': {
        name: 'Ferro Silicon (FeSi)',
        key: 'FeSi',
        recovery: 0.85,
        composition: 0.75, // 75% Si
        costPerKg: 1.8
      },
      'Cr': {
        name: 'Ferro Chrome (FeCr)',
        key: 'FeCr',
        recovery: 0.88,
        composition: 0.65, // 65% Cr
        costPerKg: 3.5
      },
      'Mo': {
        name: 'Ferro Molybdenum (FeMo)',
        key: 'FeMo',
        recovery: 0.92,
        composition: 0.60, // 60% Mo
        costPerKg: 12.0
      },
      'Al': {
        name: 'Aluminum (Al)',
        key: 'Al',
        recovery: 0.70,
        composition: 1.0, // 100% Al
        costPerKg: 2.5
      }
    };

    // Calculate for all required elements
    for (const element of requiredElements) {
      const current = currentElements[element] || 0;
      const targetValue = target[element] || 0;
      const deficit = targetValue - current;
      const spec = alloySpecs[element];

      if (spec) {
        let requiredAmount = 0;
        let status = 'optimal';
        let statusMessage = '';

        if (deficit > 0.005) {
          // Need to add this element
          requiredAmount = (deficit / 100) * liquidWeight * 1000 / (spec.composition * spec.recovery);
          status = 'needs_addition';
          statusMessage = `Need +${deficit.toFixed(3)}%`;
        } else if (deficit < -0.005) {
          // Excess of this element
          status = 'excess';
          statusMessage = `Excess ${Math.abs(deficit).toFixed(3)}%`;
          requiredAmount = 0;
        } else {
          // Within tolerance
          status = 'optimal';
          statusMessage = 'Within target';
          requiredAmount = 0;
        }

        alloys.push({
          alloy: spec.name,
          alloyKey: spec.key,
          element: element,
          currentValue: current.toFixed(3),
          targetValue: targetValue.toFixed(3),
          deficit: deficit.toFixed(3),
          requiredAmount: Math.round(requiredAmount),
          recovery: spec.recovery,
          composition: spec.composition,
          status: status,
          statusMessage: statusMessage
        });
      }
    }

    // Sort alloys by status (needs_addition first, then optimal, then excess)
    alloys.sort((a, b) => {
      const statusOrder = { 'needs_addition': 0, 'optimal': 1, 'excess': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    const totalWeightIncrease = alloys.reduce((sum, a) => sum + (a.requiredAmount / 1000), 0);
    const finalLiquidWeight = (heatData.liquid_weight || 0) + totalWeightIncrease;

    return {
      calculations: alloys,
      totalWeightIncrease: totalWeightIncrease,
      finalLiquidWeight: finalLiquidWeight,
      steelGrade: steelGradeCode,
      analysisTime: latestAnalysis?.analysis_time || latestAnalysis?.sample_time,
      analysisSample: latestAnalysis?.sample_id,
      analysisElements: currentElements,
      isComplete: alloys.every(a => a.status === 'optimal')
    };
  };

  // Calculate alloys whenever heatData or analyses change
  useEffect(() => {
    if (heatData && currentElements) {
      const result = calculateRequiredAlloys();
      setCalculationResult(result);
    }
  }, [heatData, currentElements]);

  // Sync with additions from server
  useEffect(() => {
    if (additions && Array.isArray(additions)) {
      setLocalAdditions(additions);
    } else if (additions?.results && Array.isArray(additions.results)) {
      setLocalAdditions(additions.results);
    }
  }, [additions]);

  // Confirm addition
  const handleConfirm = async (additionId, calculatedQty) => {
    const confirmedQty = prompt(`Enter confirmed quantity for this addition (kg):`, calculatedQty);
    if (confirmedQty && !isNaN(confirmedQty)) {
      const result = await confirmAddition(additionId, parseFloat(confirmedQty));
      if (result && result.success) {
        setLocalAdditions(prev =>
          prev.map(addition =>
            addition.id === additionId
              ? { ...addition, confirmed_qty: parseFloat(confirmedQty), status: 'confirmed' }
              : addition
          )
        );
        await refreshData();
      } else {
        setErrorMessage(result?.error || 'Failed to confirm addition');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  };

  // Edit alloy
  const handleEditClick = (alloy) => {
    setEditingAlloy(alloy);
    setEditFormData({
      required_amount: alloy.required_amount || alloy.requiredAmount || 0,
      confirmed_qty: alloy.confirmed_qty || alloy.confirmedQty || 0,
      status: alloy.status || 'pending'
    });
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!editingAlloy?.id) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/lf/additions/${editingAlloy.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          confirmed_qty: editFormData.confirmed_qty,
          status: editFormData.status,
          required_amount: editFormData.required_amount
        })
      });

      if (response.ok) {
        await refreshData();
        setIsEditing(false);
        setEditingAlloy(null);
        alert('Alloy updated successfully!');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to update alloy');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating alloy:', error);
      setErrorMessage('Network error. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete alloy
  const handleDeleteAlloy = async (alloyId) => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/lf/additions/${alloyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await refreshData();
        setShowDeleteConfirm(null);
        alert('Alloy deleted successfully!');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to delete alloy');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting alloy:', error);
      setErrorMessage('Network error. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add new alloy
  const handleAddAlloy = async () => {
    if (!newAlloy.material || !newAlloy.required_amount) {
      setErrorMessage('Please fill required fields');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/lf/additions/${heatData.id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          material: newAlloy.material,
          material_code: newAlloy.material_code,
          required_amount: newAlloy.required_amount,
          element: newAlloy.element,
          target_value: newAlloy.target_value,
          status: 'pending'
        })
      });

      if (response.ok) {
        await refreshData();
        setShowAddModal(false);
        setNewAlloy({
          material: '',
          material_code: '',
          required_amount: 0,
          element: '',
          target_value: 0
        });
        alert('Alloy added successfully!');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to add alloy');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error adding alloy:', error);
      setErrorMessage('Network error. Please try again.');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send to weighing system
  const sendToWeighing = (addition) => {
    console.log('Sending to weighing system:', addition);
    alert(`Alloy ${addition.material_name || addition.material} sent to weighing system.`);
  };

  // Edit Modal Component
  const EditModal = ({ alloy, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Alloy: {alloy.material || alloy.alloy}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Required Amount (kg):</label>
            <input
              type="number"
              value={editFormData.required_amount}
              onChange={(e) => setEditFormData({ ...editFormData, required_amount: parseFloat(e.target.value) })}
              step="10"
            />
          </div>
          <div className="form-group">
            <label>Confirmed Quantity (kg):</label>
            <input
              type="number"
              value={editFormData.confirmed_qty}
              onChange={(e) => setEditFormData({ ...editFormData, confirmed_qty: parseFloat(e.target.value) })}
              step="10"
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleEditSave} disabled={isSubmitting}>
            {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  // Add Alloy Modal
  const AddAlloyModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FaPlus /> Add New Alloy</h3>
          <button className="modal-close" onClick={() => setShowAddModal(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Alloy Name *</label>
            <input
              type="text"
              value={newAlloy.material}
              onChange={(e) => setNewAlloy({ ...newAlloy, material: e.target.value })}
              placeholder="e.g., Ferro Manganese"
            />
          </div>
          <div className="form-group">
            <label>Material Code</label>
            <input
              type="text"
              value={newAlloy.material_code}
              onChange={(e) => setNewAlloy({ ...newAlloy, material_code: e.target.value })}
              placeholder="e.g., FeMn"
            />
          </div>
          <div className="form-group">
            <label>Required Amount (kg) *</label>
            <input
              type="number"
              value={newAlloy.required_amount}
              onChange={(e) => setNewAlloy({ ...newAlloy, required_amount: parseFloat(e.target.value) })}
              step="10"
            />
          </div>
          <div className="form-group">
            <label>Element</label>
            <input
              type="text"
              value={newAlloy.element}
              onChange={(e) => setNewAlloy({ ...newAlloy, element: e.target.value })}
              placeholder="e.g., Mn"
            />
          </div>
          <div className="form-group">
            <label>Target Value (%)</label>
            <input
              type="number"
              value={newAlloy.target_value}
              onChange={(e) => setNewAlloy({ ...newAlloy, target_value: parseFloat(e.target.value) })}
              step="0.01"
              placeholder="e.g., 1.5"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAddAlloy} disabled={isSubmitting}>
            {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
            Add Alloy
          </button>
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ alloy, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header warning">
          <FaExclamationTriangle />
          <h3>Confirm Delete</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete this alloy addition?</p>
          <p><strong>Alloy:</strong> {alloy.material || alloy.alloy}</p>
          <p><strong>Required Amount:</strong> {alloy.required_amount || alloy.requiredAmount} kg</p>
          <p className="warning-text">This action cannot be undone!</p>
        </div>
        <div className="modal-footer">
          <button className="btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <FaSpinner className="spin" /> : <FaTrashAlt />}
            Delete
          </button>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">
          <FaSpinner className="spin" />
          <p>Loading alloy data...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // No heat data
  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat selected. Please select a heat from the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="lf-alloy-calculation">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="error-toast">
          <FaExclamationTriangle />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="card summary-card">
        <div className="card-header">
          <h3>
            <FaCalculator />
            Alloy Calculation Summary
            <span className="heat-badge">Heat #{heatData.heat_number || heatData.heatNumber}</span>
          </h3>
          <div className="header-actions">
            <button className="btn-refresh-small" onClick={refreshData} title="Refresh data">
              <FaSyncAlt />
            </button>
          </div>
        </div>
        <div className="summary-stats">
          <div className="stat">
            <label><FaWeightHanging /> Steel Grade:</label>
            <span>{calculationResult?.steelGrade || heatData.steel_grade_detail?.code || '—'}</span>
          </div>
          <div className="stat">
            <label><FaWeightHanging /> Current Liquid Weight:</label>
            <span>{heatData?.liquid_weight?.toFixed(1) || '0'} tons</span>
          </div>
          <div className="stat">
            <label><FaArrowUp /> Weight Increase:</label>
            <span className="highlight">+{(calculationResult?.totalWeightIncrease || 0).toFixed(2)} tons</span>
          </div>
          <div className="stat">
            <label>Final Weight:</label>
            <span className="highlight">{(calculationResult?.finalLiquidWeight || heatData?.liquid_weight || 0).toFixed(1)} tons</span>
          </div>
        </div>
      </div>

      {/* Alloys Table */}
      <div className="card alloys-table">
        <div className="card-header">
          <h3>
            <FaCubes />
            Required Alloys (based on latest analysis)
          </h3>
          <button
            className="btn-measure"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Alloy
          </button>
        </div>

        {latestAnalysis && (
          <div className="analysis-ref">
            <strong><FaFlask /> Latest Analysis:</strong>
            <span className="analysis-badge">
              Sample: {latestAnalysis.sample_id} | Time: {latestAnalysis.analysis_time || latestAnalysis.sample_time}
            </span>
            {currentElements && Object.entries(currentElements).map(([element, value]) => (
              <span key={element} className="element-badge">
                {element.toUpperCase()}: {value}%
              </span>
            ))}
          </div>
        )}

        {!latestAnalysis && (
          <div className="analysis-ref warning">
            <FaExclamationTriangle />
            <span>No analysis data available. Please record an analysis first.</span>
          </div>
        )}

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alloy</th>
                <th>Element</th>
                <th>Current (%)</th>
                <th>Target (%)</th>
                <th>Deficit (%)</th>
                <th>Required (kg)</th>
                <th>Confirmed (kg)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Show calculated alloys */}
              {calculationResult?.calculations && calculationResult.calculations.length > 0 ? (
                calculationResult.calculations.map((calc, idx) => {
                  const addition = localAdditions.find(a =>
                    (a.material_code && a.material_code === calc.alloyKey) ||
                    a.material === calc.alloyKey ||
                    a.alloy === calc.alloy ||
                    a.element === calc.element
                  );
                  const confirmedQty = addition?.confirmed_qty || addition?.confirmedQty || 0;
                  const isConfirmed = confirmedQty > 0;

                  // Determine row styling based on status
                  let rowClass = '';
                  if (calc.status === 'excess') rowClass = 'excess-row';
                  if (calc.status === 'optimal') rowClass = 'optimal-row';

                  return (
                    <tr key={idx} className={rowClass}>
                      <td className="alloy-cell">
                        <strong>{calc.alloy}</strong>
                        <span className="alloy-code">{calc.alloyKey}</span>
                        {calc.recovery && (
                          <span className="recovery-badge">Recovery: {(calc.recovery * 100)}%</span>
                        )}
                      </td>
                      <td>{calc.element?.toUpperCase()}</td>
                      <td className={parseFloat(calc.currentValue) < parseFloat(calc.targetValue) ? 'low-value' : parseFloat(calc.currentValue) > parseFloat(calc.targetValue) ? 'high-value' : ''}>
                        {calc.currentValue}%
                        {calc.statusMessage && <span className="status-message">{calc.statusMessage}</span>}
                      </td>
                      <td className="target-value">{calc.targetValue}%</td>
                      <td className={`deficit-value ${calc.status}`}>
                        {parseFloat(calc.deficit) > 0 ? `+${calc.deficit}%` : `${calc.deficit}%`}
                      </td>
                      <td className="calculated">
                        {calc.requiredAmount > 0 ? `${calc.requiredAmount.toLocaleString()} kg` :
                         calc.status === 'excess' ? '⚠️ Excess' : '✓ No addition needed'}
                      </td>
                      <td>{confirmedQty > 0 ? `${confirmedQty.toLocaleString()} kg` : '—'}</td>
                      <td>
                        {calc.status === 'needs_addition' && !isConfirmed && (
                          <span className="badge-warning">Pending</span>
                        )}
                        {calc.status === 'needs_addition' && isConfirmed && (
                          <span className="badge-success">Confirmed</span>
                        )}
                        {calc.status === 'optimal' && (
                          <span className="badge-info">Optimal</span>
                        )}
                        {calc.status === 'excess' && (
                          <span className="badge-danger">Excess</span>
                        )}
                      </td>
                      <td className="action-buttons">
                        {calc.status === 'needs_addition' && !isConfirmed && addition?.id && (
                          <button
                            className="btn-confirm"
                            onClick={() => handleConfirm(addition.id, calc.requiredAmount)}
                            title="Confirm addition"
                          >
                            <FaCheck />
                          </button>
                        )}
                        {calc.status === 'needs_addition' && addition?.id && isConfirmed && (
                          <button
                            className="btn-send"
                            onClick={() => sendToWeighing(addition)}
                            title="Send to weighing system"
                          >
                            <FaPaperPlane />
                          </button>
                        )}
                        {addition?.id && (
                          <>
                            <button
                              className="btn-edit"
                              onClick={() => handleEditClick(addition)}
                              title="Edit alloy"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => setShowDeleteConfirm(addition)}
                              title="Delete alloy"
                            >
                              <FaTrashAlt />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <FaInfoCircle />
                    <span>No alloy calculations available. Please check analysis data.</span>
                  </td>
                </tr>
              )}

              {/* Show manual additions from server that are not in calculated alloys */}
              {localAdditions.filter(a => a.is_manual || (a.element && !calculationResult?.calculations?.find(c => c.element === a.element))).map((addition) => (
                <tr key={addition.id}>
                  <td className="alloy-cell">
                    <strong>{addition.material}</strong>
                    <span className="alloy-code">{addition.material_code}</span>
                  </td>
                  <td>{addition.element || '—'}</td>
                  <td>—</td>
                  <td>{addition.target_value ? `${addition.target_value}%` : '—'}</td>
                  <td>—</td>
                  <td className="calculated">{addition.required_amount?.toLocaleString()} kg</td>
                  <td>{addition.confirmed_qty > 0 ? `${addition.confirmed_qty.toLocaleString()} kg` : '—'}</td>
                  <td>
                    {addition.status === 'confirmed' ? (
                      <span className="badge-success">Confirmed</span>
                    ) : addition.status === 'cancelled' ? (
                      <span className="badge-danger">Cancelled</span>
                    ) : (
                      <span className="badge-warning">Pending</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(addition)}
                      title="Edit alloy"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => setShowDeleteConfirm(addition)}
                      title="Delete alloy"
                    >
                      <FaTrashAlt />
                    </button>
                    {addition.status !== 'confirmed' && (
                      <button
                        className="btn-confirm"
                        onClick={() => handleConfirm(addition.id, addition.required_amount)}
                        title="Confirm addition"
                      >
                        <FaCheck />
                      </button>
                    )}
                    {addition.status === 'confirmed' && (
                      <button
                        className="btn-send"
                        onClick={() => sendToWeighing(addition)}
                        title="Send to weighing system"
                      >
                        <FaPaperPlane />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alloy Reference Info */}
      <div className="card reference-card">
        <h3>
          <FaBook />
          Alloy Reference Data
        </h3>
        <div className="reference-grid">
          {Object.entries(ALLOYS_REFERENCE || {}).slice(0, 8).map(([key, alloy]) => (
            <div key={key} className="ref-item">
              <div className="ref-name">{alloy.name}</div>
              <div className="ref-composition">
                {Object.entries(alloy.composition || {}).slice(0, 3).map(([el, val]) => (
                  <span key={el}>{el}: {val}%</span>
                ))}
              </div>
              <div className="ref-yield">
                Yield: {Object.values(alloy.yield || {})[0]}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {isEditing && editingAlloy && (
        <EditModal alloy={editingAlloy} onClose={() => setIsEditing(false)} />
      )}

      {showAddModal && <AddAlloyModal />}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          alloy={showDeleteConfirm}
          onConfirm={() => handleDeleteAlloy(showDeleteConfirm.id)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default LFAlloyCalculation;