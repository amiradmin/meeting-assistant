import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCTagMonitor = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  // Mock tag data - replace with actual API calls
  useEffect(() => {
    const mockTags = [
      { id: 1, name: 'Temperature', address: 'DB10.REAL0', value: 75.2, unit: '°C', type: 'REAL', connection: 's7_bus', status: 'normal', min: 0, max: 150, warning: 100, critical: 120 },
      { id: 2, name: 'Pressure', address: 'DB10.REAL4', value: 4.8, unit: 'bar', type: 'REAL', connection: 's7_bus', status: 'normal', min: 0, max: 10, warning: 7, critical: 9 },
      { id: 3, name: 'Motor Speed', address: 'DB10.INT8', value: 1450, unit: 'RPM', type: 'INT', connection: 's7_bus', status: 'normal', min: 0, max: 3000, warning: 2500, critical: 2800 },
      { id: 4, name: 'Power', address: 'DB10.REAL12', value: 250.5, unit: 'kW', type: 'REAL', connection: 's7_bus', status: 'normal', min: 0, max: 500, warning: 400, critical: 450 },
      { id: 5, name: 'Production Rate', address: 'ns=3;s=ProductionData.Rate', value: 1250, unit: 'units/hr', type: 'REAL', connection: 'cp_opcua_server', status: 'normal' },
      { id: 6, name: 'Quality OK', address: 'ns=3;s=Quality.OK', value: 98.5, unit: '%', type: 'REAL', connection: 'cp_opcua_server', status: 'normal' },
      { id: 7, name: 'Energy Consumption', address: 'ns=2;s=Energy.MainMeter', value: 3250, unit: 'kWh', type: 'REAL', connection: 'external_opcua', status: 'normal' },
      { id: 8, name: 'Conveyor Status', address: 'DB10.BOOL16.0', value: true, unit: '', type: 'BOOL', connection: 's7_bus', status: 'normal' },
    ];
    setTags(mockTags);
    setLoading(false);
  }, []);

  // Auto-refresh simulation
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setTags(prevTags => 
          prevTags.map(tag => ({
            ...tag,
            value: tag.type === 'BOOL' 
              ? Math.random() > 0.7 
              : Number((tag.value + (Math.random() - 0.5) * (tag.max ? tag.max * 0.05 : 10)).toFixed(1))
          }))
        );
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (tag) => {
    if (tag.type === 'BOOL') {
      return tag.value ? 'text-success' : 'text-muted';
    }
    if (tag.critical && tag.value >= tag.critical) return 'text-danger';
    if (tag.warning && tag.value >= tag.warning) return 'text-warning';
    return 'text-success';
  };

  const getStatusBadge = (tag) => {
    if (tag.type === 'BOOL') {
      return tag.value ? 'active' : 'inactive';
    }
    if (tag.critical && tag.value >= tag.critical) return 'critical';
    if (tag.warning && tag.value >= tag.warning) return 'warning';
    return 'normal';
  };

  const getConnectionIcon = (connection) => {
    switch (connection) {
      case 's7_bus': return '🔌';
      case 'cp_opcua_server': return '🌐';
      case 'external_opcua': return '☁️';
      default: return '📡';
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || tag.connection === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">
                <i className="fas fa-tags"></i>
              </div>
              <div className="title-text">
                <h1>PLC Tag Monitor</h1>
                <p>Real-time monitoring of all PLC tags and values</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button 
              className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <i className="fas fa-sync-alt"></i>
              <span>Auto Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <span className="badge-label">Total Tags:</span>
            <span className="badge-number">{tags.length}</span>
            <span className="badge-label">Active:</span>
            <span className="badge-number text-success">
              {tags.filter(t => t.status === 'normal' || (t.type === 'BOOL' && t.value)).length}
            </span>
            <span className="badge-label">Warnings:</span>
            <span className="badge-number text-warning">
              {tags.filter(t => getStatusBadge(t) === 'warning').length}
            </span>
            <span className="badge-label">Critical:</span>
            <span className="badge-number text-danger">
              {tags.filter(t => getStatusBadge(t) === 'critical').length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="filter-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search tags by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="connection-filters">
            <button 
              className={`filter-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeTab === 's7_bus' ? 'active' : ''}`}
              onClick={() => setActiveTab('s7_bus')}
            >
              🔌 S7 BUS
            </button>
            <button 
              className={`filter-btn ${activeTab === 'cp_opcua_server' ? 'active' : ''}`}
              onClick={() => setActiveTab('cp_opcua_server')}
            >
              🌐 CP OPC UA
            </button>
            <button 
              className={`filter-btn ${activeTab === 'external_opcua' ? 'active' : ''}`}
              onClick={() => setActiveTab('external_opcua')}
            >
              ☁️ External OPC UA
            </button>
          </div>
        </div>
      </div>

      {/* Tags Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag Name</th>
                <th>Address</th>
                <th>Connection</th>
                <th>Value</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <p>Loading tags...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <i className="fas fa-tags"></i>
                    <p>No tags found</p>
                    <small>Try adjusting your search or filter</small>
                  </td>
                </tr>
              ) : (
                filteredTags.map(tag => (
                  <tr key={tag.id} className="tag-row" onClick={() => setSelectedTag(tag)}>
                    <td className="tag-name-cell">
                      <i className={`fas ${tag.type === 'REAL' ? 'fa-chart-line' : tag.type === 'INT' ? 'fa-hashtag' : 'fa-toggle-on'}`}></i>
                      <strong>{tag.name}</strong>
                    </td>
                    <td className="tag-address">
                      <code>{tag.address}</code>
                    </td>
                    <td className="tag-connection">
                      <span className="connection-badge">
                        {getConnectionIcon(tag.connection)} {tag.connection.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className={`tag-value ${getStatusColor(tag)}`}>
                      {tag.type === 'BOOL' 
                        ? (tag.value ? 'ON' : 'OFF')
                        : tag.value?.toFixed(2) || '---'}
                    </td>
                    <td className="tag-unit">{tag.unit || '-'}</td>
                    <td className="tag-status">
                      <span className={`status-badge ${getStatusBadge(tag)}`}>
                        {getStatusBadge(tag)}
                      </span>
                    </td>
                    <td className="tag-actions">
                      <button className="btn-action-icon" title="View History">
                        <i className="fas fa-chart-line"></i>
                      </button>
                      <button className="btn-action-icon" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing {filteredTags.length} of {tags.length} tags
          {autoRefresh && <span className="auto-refresh-indicator">🔄 Auto-refreshing...</span>}
        </div>
      </div>

      {/* Tag Detail Modal */}
      {selectedTag && (
        <div className="modal-overlay" onClick={() => setSelectedTag(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-tag"></i>
                {selectedTag.name} - Details
              </h3>
              <button className="modal-close" onClick={() => setSelectedTag(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="heat-info-grid">
                <div className="info-item">
                  <label>Address</label>
                  <span className="info-value">{selectedTag.address}</span>
                </div>
                <div className="info-item">
                  <label>Current Value</label>
                  <span className={`info-value ${getStatusColor(selectedTag)}`}>
                    {selectedTag.type === 'BOOL' 
                      ? (selectedTag.value ? 'ON' : 'OFF')
                      : `${selectedTag.value?.toFixed(2)} ${selectedTag.unit}`}
                  </span>
                </div>
                <div className="info-item">
                  <label>Data Type</label>
                  <span>{selectedTag.type}</span>
                </div>
                <div className="info-item">
                  <label>Connection</label>
                  <span>{selectedTag.connection}</span>
                </div>
                {selectedTag.min !== undefined && (
                  <div className="info-item">
                    <label>Range</label>
                    <span>{selectedTag.min} - {selectedTag.max} {selectedTag.unit}</span>
                  </div>
                )}
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusBadge(selectedTag)}`}>
                    {getStatusBadge(selectedTag)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setSelectedTag(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PLCTagMonitor;