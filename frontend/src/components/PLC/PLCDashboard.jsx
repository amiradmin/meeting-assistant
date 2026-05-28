import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCDashboard = () => {
  const [plcData, setPlcData] = useState({
    temperature: null,
    pressure: null,
    motorSpeed: null,
    power: null,
    energyToday: null,
    uptime: null,
    connectionStatus: {
      s7bus: 'connected',
      opcua: 'connecting',
      external: 'disconnected'
    },
    currentPhase: 'active',
    lastUpdate: new Date()
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);

  // Mock data updates - replace with actual API calls
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setPlcData(prev => ({
          ...prev,
          temperature: (Math.random() * 100 + 50).toFixed(1),
          pressure: (Math.random() * 8 + 2).toFixed(1),
          motorSpeed: Math.floor(Math.random() * 2000 + 500),
          power: (Math.random() * 300 + 100).toFixed(0),
          energyToday: (Math.random() * 5000 + 2000).toFixed(0),
          lastUpdate: new Date()
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPlcData(prev => ({
        ...prev,
        temperature: (Math.random() * 100 + 50).toFixed(1),
        pressure: (Math.random() * 8 + 2).toFixed(1),
        motorSpeed: Math.floor(Math.random() * 2000 + 500),
        power: (Math.random() * 300 + 100).toFixed(0),
        lastUpdate: new Date()
      }));
      setLoading(false);
    }, 500);
  };

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">
                <i className="fas fa-microchip"></i>
              </div>
              <div className="title-text">
                <h1>PLC Control Dashboard</h1>
                <p>Siemens S7-400 | CPU 417-4H | CP 443-1</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button 
              className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <i className="fas fa-sync-alt"></i>
              <span>Auto</span>
            </button>
            <button 
              className="btn-refresh-modern"
              onClick={handleRefresh}
              disabled={loading}
            >
              <i className={`fas fa-sync-alt ${loading ? 'spin' : ''}`}></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Connection Status Badges */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <span className="badge-label">S7 BUS (CP 443-1):</span>
            <span className={`badge-number ${plcData.connectionStatus.s7bus === 'connected' ? 'text-success' : 'text-danger'}`}>
              {plcData.connectionStatus.s7bus === 'connected' ? '● Connected' : '○ Disconnected'}
            </span>
            <span className="badge-label">OPC UA Server:</span>
            <span className={`badge-number ${plcData.connectionStatus.opcua === 'connected' ? 'text-success' : plcData.connectionStatus.opcua === 'connecting' ? 'text-warning' : 'text-danger'}`}>
              {plcData.connectionStatus.opcua === 'connected' ? '● Connected' : plcData.connectionStatus.opcua === 'connecting' ? '◐ Connecting' : '○ Disconnected'}
            </span>
            <span className="badge-label">Last Update:</span>
            <span className="badge-grade">{plcData.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-cards">
        <div className="status-card">
          <div className="status-card-icon phase-icon">
            <i className="fas fa-thermometer-half"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Temperature</span>
            <span className="status-value">
              {plcData.temperature || '---'}
              <span className="status-unit">°C</span>
            </span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon power-icon">
            <i className="fas fa-tachometer-alt"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Pressure</span>
            <span className="status-value">
              {plcData.pressure || '---'}
              <span className="status-unit">bar</span>
            </span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon time-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Motor Speed</span>
            <span className="status-value">
              {plcData.motorSpeed || '---'}
              <span className="status-unit">RPM</span>
            </span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon weight-icon">
            <i className="fas fa-charging-station"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Active Power</span>
            <span className="status-value">
              {plcData.power || '---'}
              <span className="status-unit">kW</span>
            </span>
          </div>
        </div>
      </div>
       <br />
      {/* Tabs */}
      <div className="eaf-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Overview</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <i className="fas fa-tags"></i>
          <span>Tag Monitor</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'control' ? 'active' : ''}`}
          onClick={() => setActiveTab('control')}
        >
          <i className="fas fa-gamepad"></i>
          <span>Control</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          <span>History</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="eaf-tab-content">
        {activeTab === 'overview' && (
          <div className="eaf-melting-control">
            {/* System Information Card */}
            <div className="card">
              <h3>
                <i className="fas fa-microchip"></i>
                System Information
              </h3>
              <div className="heat-info-grid">
                <div className="info-item">
                  <label>CPU Type</label>
                  <span>CPU 417-4H</span>
                </div>
                <div className="info-item">
                  <label>Communication Module</label>
                  <span>CP 443-1</span>
                </div>
                <div className="info-item">
                  <label>Protocol</label>
                  <span>S7 (ISO-TSAP)</span>
                </div>
                <div className="info-item">
                  <label>Rack / Slot</label>
                  <span>0 / 3</span>
                </div>
                <div className="info-item">
                  <label>IP Address</label>
                  <span>192.168.0.1</span>
                </div>
                <div className="info-item">
                  <label>Uptime</label>
                  <span>{plcData.uptime || '0'} hours</span>
                </div>
              </div>
            </div>

            {/* Energy Card */}
            <div className="card">
              <h3>
                <i className="fas fa-charging-station"></i>
                Energy Consumption
              </h3>
              <div className="heat-info-grid">
                <div className="info-item">
                  <label>Today's Consumption</label>
                  <span>{plcData.energyToday || '---'} kWh</span>
                </div>
                <div className="info-item">
                  <label>Current Power</label>
                  <span>{plcData.power || '---'} kW</span>
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, (plcData.power / 500) * 100)}%` }}
                  />
                </div>
                <div className="progress-percent">
                  Power Usage: {Math.min(100, ((plcData.power / 500) * 100)).toFixed(0)}% of capacity
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="eaf-electrical-profile">
            <div className="card">
              <h3>
                <i className="fas fa-tags"></i>
                Active Tags Monitor
              </h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tag Name</th>
                      <th>Address</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><i className="fas fa-thermometer-half text-danger"></i> Temperature</td>
                      <td><code>DB10.REAL0</code></td>
                      <td className="power-cell">{plcData.temperature || '---'}</td>
                      <td>°C</td>
                      <td><span className="status-badge active">Active</span></td>
                    </tr>
                    <tr>
                      <td><i className="fas fa-tachometer-alt text-primary"></i> Pressure</td>
                      <td><code>DB10.REAL4</code></td>
                      <td className="power-cell">{plcData.pressure || '---'}</td>
                      <td>bar</td>
                      <td><span className="status-badge active">Active</span></td>
                    </tr>
                    <tr>
                      <td><i className="fas fa-bolt text-warning"></i> Motor Speed</td>
                      <td><code>DB10.INT8</code></td>
                      <td className="power-cell">{plcData.motorSpeed || '---'}</td>
                      <td>RPM</td>
                      <td><span className="status-badge active">Active</span></td>
                    </tr>
                    <tr>
                      <td><i className="fas fa-charging-station text-success"></i> Power</td>
                      <td><code>DB10.REAL12</code></td>
                      <td className="power-cell">{plcData.power || '---'}</td>
                      <td>kW</td>
                      <td><span className="status-badge active">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'control' && (
          <div className="eaf-melting-control">
            <div className="card">
              <h3>
                <i className="fas fa-gamepad"></i>
                Control Actions
              </h3>
              <div className="control-buttons">
                <button className="btn-start">
                  <i className="fas fa-play"></i> Start Conveyor
                </button>
                <button className="btn-complete">
                  <i className="fas fa-stop"></i> Stop Conveyor
                </button>
                <button className="btn-refresh">
                  <i className="fas fa-chart-line"></i> View Trends
                </button>
              </div>
            </div>

            <div className="card">
              <h3>
                <i className="fas fa-exclamation-triangle text-danger"></i>
                Emergency Stop
              </h3>
              <button className="btn-start" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <i className="fas fa-stop-circle"></i> EMERGENCY STOP
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="eaf-energy-monitor">
            <div className="card">
              <h3>
                <i className="fas fa-history"></i>
                Historical Data
              </h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Temperature (°C)</th>
                      <th>Pressure (bar)</th>
                      <th>Motor Speed (RPM)</th>
                      <th>Power (kW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="time-cell">{new Date().toLocaleTimeString()}</td>
                      <td>{plcData.temperature || '---'}</td>
                      <td>{plcData.pressure || '---'}</td>
                      <td>{plcData.motorSpeed || '---'}</td>
                      <td className="energy-cell">{plcData.power || '---'}</td>
                    </tr>
                    <tr>
                      <td className="time-cell">{new Date(Date.now() - 5000).toLocaleTimeString()}</td>
                      <td>{(plcData.temperature - 5).toFixed(1) || '---'}</td>
                      <td>{(plcData.pressure - 0.5).toFixed(1) || '---'}</td>
                      <td>{plcData.motorSpeed - 50 || '---'}</td>
                      <td className="energy-cell">{plcData.power - 20 || '---'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                Showing last 2 of 100 records
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLCDashboard;
