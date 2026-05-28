// src/components/LF/LFDelays.jsx
import React, { useState } from 'react';
import {
  FaPauseCircle,
  FaCheck,
  FaPlusCircle,
  FaClock,
  FaChartBar,
  FaBolt,
  FaCogs,
  FaCubes,
  FaIndustry,
  FaWrench,
  FaTimes,
  FaPlay
} from 'react-icons/fa';

const LFDelays = ({ lfData }) => {
  const { heatData } = lfData;
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [activeDelay, setActiveDelay] = useState(null);

  // داده‌های نمونه (در حالت واقعی از API می‌آید)
  const [delays, setDelays] = useState([
    { id: 1, startTime: '08:12:00', endTime: '08:18:00', duration: 360, category: 'maintenance', code: 'ELEC_01', description: 'Electrode change', cause: 'Electrode break', status: 'completed' }
  ]);

  const delayCategories = [
    { id: 'electrical', name: 'Electrical', icon: FaBolt, color: '#f59e0b' },
    { id: 'mechanical', name: 'Mechanical', icon: FaCogs, color: '#ef4444' },
    { id: 'material', name: 'Material Handling', icon: FaCubes, color: '#3b82f6' },
    { id: 'process', name: 'Process', icon: FaIndustry, color: '#8b5cf6' },
    { id: 'maintenance', name: 'Maintenance', icon: FaWrench, color: '#ec4899' }
  ];

  const startDelay = (category, code, description) => {
    setActiveDelay({
      startTime: new Date().toLocaleTimeString(),
      category,
      code,
      description
    });
    setShowDelayModal(false);
  };

  const endDelay = () => {
    if (activeDelay) {
      const newDelay = {
        ...activeDelay,
        id: delays.length + 1,
        endTime: new Date().toLocaleTimeString(),
        duration: 300,
        status: 'completed'
      };
      setDelays([...delays, newDelay]);
      setActiveDelay(null);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const cat = delayCategories.find(c => c.id === categoryId);
    if (cat && cat.icon) {
      const IconComponent = cat.icon;
      return <IconComponent />;
    }
    return <FaCogs />;
  };

  return (
    <div className="lf-delays">
      {/* Active Delay Card */}
      {activeDelay && (
        <div className="card active-delay-card">
          <div className="delay-header">
            <FaPauseCircle />
            <span>Active Stoppage</span>
            <button className="btn-end-delay" onClick={endDelay}>
              <FaCheck /> End Stoppage
            </button>
          </div>
          <div className="delay-info">
            <div className="delay-item">
              <label>Started:</label>
              <span>{activeDelay.startTime}</span>
            </div>
            <div className="delay-item">
              <label>Category:</label>
              <span className="badge">{activeDelay.category}</span>
            </div>
            <div className="delay-item">
              <label>Code:</label>
              <span>{activeDelay.code}</span>
            </div>
            <div className="delay-item full">
              <label>Description:</label>
              <span>{activeDelay.description}</span>
            </div>
          </div>
        </div>
      )}

      {/* Start Delay Button */}
      {!activeDelay && (
        <div className="card start-delay-card">
          <button className="btn-start-delay" onClick={() => setShowDelayModal(true)}>
            <FaPlusCircle />
            Register Stoppage / Delay
          </button>
        </div>
      )}

      {/* Delays List */}
      <div className="card delays-list-card">
        <h3>
          <FaClock />
          Stoppage History
        </h3>

        <div className="table-responsive">
          <table className="delays-table">
            <thead>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Category</th>
                <th>Code</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {delays.map((delay) => (
                <tr key={delay.id}>
                  <td>{delay.startTime}</td>
                  <td>{delay.endTime}</td>
                  <td>{Math.floor(delay.duration / 60)}m {delay.duration % 60}s</td>
                  <td className="category-cell">
                    {getCategoryIcon(delay.category)}
                    <span className="category-badge">{delay.category}</span>
                  </td>
                  <td>{delay.code}</td>
                  <td>{delay.description}</td>
                  <td>
                    <span className="status-completed">
                      <FaCheck /> Completed
                    </span>
                  </td>
                </tr>
              ))}
              {delays.length === 0 && (
                <tr>
                  <td colSpan="7" className="no-data">
                    No stoppages recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="card stats-card">
        <h3>
          <FaChartBar />
          Stoppage Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-value" style={{'display':'block'}} >{delays.length}</div>
            <div className="stat-label">Total Stoppages</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{'display':'block'}} >
              {Math.floor(delays.reduce((sum, d) => sum + d.duration, 0) / 60)} min
            </div>
            <div className="stat-label"  >Total Downtime</div>
          </div>
          <div className="stat">
            <div className="stat-value" style={{'display':'block'}} >
              {heatData ? Math.floor((delays.reduce((sum, d) => sum + d.duration, 0) / 3600) * 100) / 100 : 0}%
            </div>
            <div className="stat-label">Downtime Ratio</div>
          </div>
        </div>
      </div>

      {/* Start Delay Modal */}
      {showDelayModal && (
        <div className="modal-overlay" onClick={() => setShowDelayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Stoppage / Delay</h3>
              <button className="modal-close" onClick={() => setShowDelayModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <DelayForm onSubmit={startDelay} onCancel={() => setShowDelayModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// کامپوننت فرم ثبت تأخیر
const DelayForm = ({ onSubmit, onCancel }) => {
  const [category, setCategory] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const formDelayCodes = {
    electrical: [
      { code: 'ELEC_01', description: 'Power failure' },
      { code: 'ELEC_02', description: 'Electrode break' },
      { code: 'ELEC_03', description: 'Transformer issue' }
    ],
    mechanical: [
      { code: 'MECH_01', description: 'Ladle turret issue' },
      { code: 'MECH_02', description: 'Roof movement problem' }
    ],
    process: [
      { code: 'PROC_01', description: 'Analysis waiting' },
      { code: 'PROC_02', description: 'Temperature waiting' }
    ]
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category && code) {
      const selectedCode = formDelayCodes[category]?.find(c => c.code === code);
      onSubmit(category, code, selectedCode?.description || description);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Category:</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCode('');
          }}
          required
        >
          <option value="">Select category</option>
          <option value="electrical">Electrical</option>
          <option value="mechanical">Mechanical</option>
          <option value="process">Process</option>
          <option value="material">Material Handling</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {category && formDelayCodes[category] && (
        <div className="input-group">
          <label>Delay Code:</label>
          <select
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              const selected = formDelayCodes[category]?.find(c => c.code === e.target.value);
              if (selected) setDescription(selected.description);
            }}
            required
          >
            <option value="">Select code</option>
            {formDelayCodes[category]?.map(c => (
              <option key={c.code} value={c.code}>{c.code} - {c.description}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          <FaPlay /> Start Stoppage
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          <FaTimes /> Cancel
        </button>
      </div>
    </form>
  );
};

export default LFDelays;