import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCAlarms = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [alarms, setAlarms] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAlarm, setSelectedAlarm] = useState(null);

  // Mock alarm data
  const generateMockAlarms = () => {
    const mockAlarms = [
      { id: 1, name: 'High Temperature', tag: 'temperature', value: 125, threshold: 120, severity: 'critical', status: 'active', timestamp: new Date().toLocaleTimeString(), acknowledged: false, description: 'Temperature exceeded critical threshold' },
      { id: 2, name: 'Pressure Drop', tag: 'pressure', value: 1.2, threshold: 2.0, severity: 'warning', status: 'active', timestamp: new Date().toLocaleTimeString(), acknowledged: false, description: 'Pressure dropped below minimum required' },
      { id: 3, name: 'Motor Overload', tag: 'motor_speed', value: 2850, threshold: 2500, severity: 'warning', status: 'active', timestamp: new Date().toLocaleTimeString(), acknowledged: false, description: 'Motor speed approaching maximum limit' },
      { id: 4, name: 'Power Spike', tag: 'power', value: 480, threshold: 450, severity: 'critical', status: 'acknowledged', timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), acknowledged: true, description: 'Power consumption spike detected' },
      { id: 5, name: 'Communication Lost', tag: 's7_bus', value: 0, threshold: 1, severity: 'critical', status: 'resolved', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), acknowledged: true, description: 'Connection to CP 443-1 lost' },
      { id: 6, name: 'Low Efficiency', tag: 'production_rate', value: 850, threshold: 1000, severity: 'info', status: 'active', timestamp: new Date().toLocaleTimeString(), acknowledged: false, description: 'Production rate below target' },
    ];
    return mockAlarms;
  };

  useEffect(() => {
    setAlarms(generateMockAlarms());
  }, []);

  // Simulate new alarms
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        const newAlarm = {
          id: Date.now(),
          name: 'Temperature Fluctuation',
          tag: 'temperature',
          value: 95 + Math.random() * 20,
          threshold: 100,
          severity: Math.random() > 0.7 ? 'critical' : 'warning',
          status: 'active',
          timestamp: new Date().toLocaleTimeString(),
          acknowledged: false,
          description: 'Unexpected temperature variation detected'
        };
        setAlarms(prev => [newAlarm, ...prev]);
        
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification(`PLC Alarm: ${newAlarm.name}`, {
            body: `${newAlarm.name} - Value: ${newAlarm.value.toFixed(1)}`,
            icon: '/favicon.ico'
          });
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const acknowledgeAlarm = (id) => {
    setAlarms(prev => prev.map(alarm =>
      alarm.id === id ? { ...alarm, acknowledged: true, status: 'acknowledged' } : alarm
    ));
  };

  const clearAlarm = (id) => {
    setAlarms(prev => prev.map(alarm =>
      alarm.id === id ? { ...alarm, status: 'resolved' } : alarm
    ));
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical': return 'severity-critical';
      case 'warning': return 'severity-warning';
      case 'info': return 'severity-info';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'acknowledged': return 'status-acknowledged';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const filteredAlarms = alarms.filter(alarm => {
    const matchesTab = activeTab === 'all' || alarm.status === activeTab;
    const matchesSeverity = filterSeverity === 'all' || alarm.severity === filterSeverity;
    return matchesTab && matchesSeverity;
  });

  const stats = {
    critical: alarms.filter(a => a.severity === 'critical' && a.status === 'active').length,
    warning: alarms.filter(a => a.severity === 'warning' && a.status === 'active').length,
    info: alarms.filter(a => a.severity === 'info' && a.status === 'active').length,
    total: alarms.filter(a => a.status === 'active').length,
  };

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <i className="fas fa-bell"></i>
              </div>
              <div className="title-text">
                <h1>Alarms & Events</h1>
                <p>Real-time alarm monitoring and event management</p>
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
            <button 
              className="btn-export"
              onClick={() => console.log('Export alarms')}
            >
              <i className="fas fa-download"></i>
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Alarm Statistics */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <div className="stat-group">
              <span className="badge-label">Active Alarms:</span>
              <span className="badge-number">{stats.total}</span>
            </div>
            <div className="stat-group">
              <span className="badge-label critical">🔴 Critical:</span>
              <span className="badge-number text-danger">{stats.critical}</span>
            </div>
            <div className="stat-group">
              <span className="badge-label warning">🟡 Warning:</span>
              <span className="badge-number text-warning">{stats.warning}</span>
            </div>
            <div className="stat-group">
              <span className="badge-label info">🔵 Info:</span>
              <span className="badge-number text-info">{stats.info}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
<div className="card" style={{ marginBottom: '24px' }}>
  <div className="filter-bar">
    <div className="severity-filters">
      <button
        className={`filter-btn ${filterSeverity === 'all' ? 'active' : ''}`}
        onClick={() => setFilterSeverity('all')}
      >
        All Severities
      </button>
      <button
        className={`filter-btn critical ${filterSeverity === 'critical' ? 'active' : ''}`}
        onClick={() => setFilterSeverity('critical')}
      >
        🔴 Critical
      </button>
      <button
        className={`filter-btn warning ${filterSeverity === 'warning' ? 'active' : ''}`}
        onClick={() => setFilterSeverity('warning')}
      >
        🟡 Warning
      </button>
      <button
        className={`filter-btn info ${filterSeverity === 'info' ? 'active' : ''}`}
        onClick={() => setFilterSeverity('info')}
      >
        🔵 Info
      </button>
    </div>
  </div>
</div>

      {/* Tabs */}
      <div className="eaf-tabs">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <i className="fas fa-exclamation-triangle"></i>
          <span>Active Alarms</span>
          {stats.total > 0 && <span className="tab-badge">{stats.total}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'acknowledged' ? 'active' : ''}`}
          onClick={() => setActiveTab('acknowledged')}
        >
          <i className="fas fa-check-circle"></i>
          <span>Acknowledged</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolved')}
        >
          <i className="fas fa-check-double"></i>
          <span>Resolved</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <i className="fas fa-list"></i>
          <span>All Events</span>
        </button>
      </div>

      {/* Alarms List */}
      <div className="card">
        <div className="alarms-list">
          {filteredAlarms.length === 0 ? (
            <div className="no-alarms">
              <i className="fas fa-bell-slash"></i>
              <p>No alarms to display</p>
              <small>All systems are operating normally</small>
            </div>
          ) : (
            filteredAlarms.map(alarm => (
              <div 
                key={alarm.id} 
                className={`alarm-item ${getSeverityClass(alarm.severity)} ${getStatusClass(alarm.status)}`}
                onClick={() => setSelectedAlarm(alarm)}
              >
                <div className="alarm-icon">
                  {getSeverityIcon(alarm.severity)}
                </div>
                <div className="alarm-content">
                  <div className="alarm-header">
                    <span className="alarm-name">{alarm.name}</span>
                    <span className="alarm-time">{alarm.timestamp}</span>
                  </div>
                  <div className="alarm-details">
                    <span className="alarm-tag">Tag: {alarm.tag}</span>
                    <span className="alarm-value">Value: {alarm.value?.toFixed(1)}</span>
                    <span className="alarm-threshold">Threshold: {alarm.threshold}</span>
                  </div>
                  <div className="alarm-description">{alarm.description}</div>
                </div>
                <div className="alarm-actions">
                  {alarm.status === 'active' && !alarm.acknowledged && (
                    <button 
                      className="btn-acknowledge"
                      onClick={(e) => { e.stopPropagation(); acknowledgeAlarm(alarm.id); }}
                    >
                      <i className="fas fa-check"></i>
                      Acknowledge
                    </button>
                  )}
                  {alarm.status !== 'resolved' && (
                    <button 
                      className="btn-resolve"
                      onClick={(e) => { e.stopPropagation(); clearAlarm(alarm.id); }}
                    >
                      <i className="fas fa-times"></i>
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alarm Detail Modal */}
      {selectedAlarm && (
        <div className="modal-overlay" onClick={() => setSelectedAlarm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-bell"></i>
                Alarm Details
              </h3>
              <button className="modal-close" onClick={() => setSelectedAlarm(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="heat-info-grid">
                <div className="info-item">
                  <label>Alarm Name</label>
                  <span className="info-value">{selectedAlarm.name}</span>
                </div>
                <div className="info-item">
                  <label>Severity</label>
                  <span className={`severity-badge ${selectedAlarm.severity}`}>
                    {selectedAlarm.severity.toUpperCase()}
                  </span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedAlarm.status}`}>
                    {selectedAlarm.status}
                  </span>
                </div>
                <div className="info-item">
                  <label>Tag</label>
                  <span>{selectedAlarm.tag}</span>
                </div>
                <div className="info-item">
                  <label>Current Value</label>
                  <span className={selectedAlarm.value > selectedAlarm.threshold ? 'text-danger' : ''}>
                    {selectedAlarm.value?.toFixed(2)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Threshold</label>
                  <span>{selectedAlarm.threshold}</span>
                </div>
                <div className="info-item">
                  <label>Timestamp</label>
                  <span>{selectedAlarm.timestamp}</span>
                </div>
                <div className="info-item full-width">
                  <label>Description</label>
                  <span>{selectedAlarm.description}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedAlarm.status === 'active' && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    acknowledgeAlarm(selectedAlarm.id);
                    setSelectedAlarm(null);
                  }}
                >
                  Acknowledge
                </button>
              )}
              <button className="btn-secondary" onClick={() => setSelectedAlarm(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PLCAlarms;
