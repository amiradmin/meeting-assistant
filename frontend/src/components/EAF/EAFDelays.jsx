// src/components/EAF/EAFDelays.jsx
import React, { useState } from 'react';
import {
  FaClock,
  FaPlus,
  FaPlay,
  FaStop,
  FaSpinner,
  FaSave,
  FaTimes,
} from 'react-icons/fa';

const EAFDelays = ({ eafData }) => {
  const { heatData, delays, addDelay, endDelay, refreshData } = eafData;
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDelay, setNewDelay] = useState({
    category: 'process',
    code: '',
    description: '',
    cause: ''
  });

  const handleAddDelay = async () => {
    if (!newDelay.code || !newDelay.description) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    const result = await addDelay({
      ...newDelay,
      start_time: new Date().toISOString()
    });
    if (result.success) {
      setShowAddModal(false);
      setNewDelay({
        category: 'process',
        code: '',
        description: '',
        cause: ''
      });
      alert('Delay recorded successfully!');
    } else {
      alert(result.error || 'Failed to record delay');
    }
    setIsSubmitting(false);
  };

  const handleEndDelay = async (delayId) => {
    const result = await endDelay(delayId);
    if (result.success) {
      alert('Delay ended successfully!');
    } else {
      alert(result.error || 'Failed to end delay');
    }
  };

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat. Please select a heat.</p>
      </div>
    );
  }

  const activeDelays = delays.filter(d => d.status === 'active');
  const completedDelays = delays.filter(d => d.status === 'completed');

  return (
    <div className="eaf-delays">
      <div className="card">
        <div className="card-header">
          <h3>
            <FaClock />
            Delays & Stoppages
          </h3>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Delay
          </button>
        </div>
        <div className="card-body">
          {activeDelays.length > 0 && (
            <div className="active-delays">
              <h4>Active Delays</h4>
              {activeDelays.map((delay) => (
                <div key={delay.id} className="delay-item active">
                  <div className="delay-info">
                    <strong>{delay.code}</strong> - {delay.description}
                    <span className="delay-category">{delay.category}</span>
                  </div>
                  <button className="btn-end-delay" onClick={() => handleEndDelay(delay.id)}>
                    <FaStop /> End Delay
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="completed-delays">
            <h4>Completed Delays</h4>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDelays.map((delay) => (
                    <tr key={delay.id}>
                      <td>{delay.code}</td>
                      <td>{delay.description}</td>
                      <td>{delay.category}</td>
                      <td>{Math.floor(delay.duration / 60)} min {delay.duration % 60} sec</td>
                    </tr>
                  ))}
                  {completedDelays.length === 0 && (
                    <tr><td colSpan="4" className="no-data">No completed delays</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Delay Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPlus /> Add Delay Record</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newDelay.category}
                  onChange={(e) => setNewDelay({ ...newDelay, category: e.target.value })}
                >
                  <option value="electrical">Electrical</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="material">Material</option>
                  <option value="process">Process</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Delay Code *</label>
                <input
                  type="text"
                  value={newDelay.code}
                  onChange={(e) => setNewDelay({ ...newDelay, code: e.target.value })}
                  placeholder="e.g., ELEC-001"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="2"
                  value={newDelay.description}
                  onChange={(e) => setNewDelay({ ...newDelay, description: e.target.value })}
                  placeholder="Describe the delay..."
                />
              </div>
              <div className="form-group">
                <label>Cause</label>
                <textarea
                  rows="2"
                  value={newDelay.cause}
                  onChange={(e) => setNewDelay({ ...newDelay, cause: e.target.value })}
                  placeholder="Root cause (optional)"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddDelay} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Add Delay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EAFDelays;