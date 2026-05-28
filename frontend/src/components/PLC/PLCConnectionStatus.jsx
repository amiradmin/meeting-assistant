import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCConnectionStatus = () => {
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    setConnections({
      s7_bus: { status: 'disconnected', lastSeen: null, error: null },
      cp_opcua_server: { status: 'disconnected', lastSeen: null, error: null },
      external_opcua: { status: 'disconnected', lastSeen: null, error: null }
    });
  }, []);

  // Simulate connection status updates
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        setConnections(prev => ({
          ...prev,
          s7_bus: { 
            ...prev.s7_bus, 
            lastSeen: new Date().toLocaleTimeString() 
          },
          cp_opcua_server: { 
            ...prev.cp_opcua_server, 
            lastSeen: new Date().toLocaleTimeString() 
          },
          external_opcua: { 
            ...prev.external_opcua, 
            lastSeen: new Date().toLocaleTimeString() 
          }
        }));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleConnect = (connectionId) => {
    setLoading(true);
    // Simulate connection attempt
    setTimeout(() => {
      setConnections(prev => ({
        ...prev,
        [connectionId]: { 
          ...prev[connectionId], 
          status: 'connected',
          lastSeen: new Date().toLocaleTimeString(),
          error: null
        }
      }));
      setLoading(false);
    }, 1500);
  };

  const handleDisconnect = (connectionId) => {
    setConnections(prev => ({
      ...prev,
      [connectionId]: { 
        ...prev[connectionId], 
        status: 'disconnected',
        error: null
      }
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  const connectionConfigs = {
    s7_bus: {
      name: 'S7 BUS (CP 443-1)',
      description: 'Direct S7 Protocol connection to CP 443-1',
      protocol: 'S7 (ISO-TSAP)',
      port: 102,
      icon: '🔌',
      details: {
        ip: '192.168.0.1',
        rack: 0,
        slot: 3
      }
    },
    cp_opcua_server: {
      name: 'CP 443-1 OPC UA Server',
      description: 'Built-in OPC UA server on CP 443-1',
      protocol: 'OPC UA',
      port: 4840,
      icon: '🌐',
      details: {
        endpoint: 'opc.tcp://192.168.0.1:4840',
        security: 'None'
      }
    },
    external_opcua: {
      name: 'External OPC UA Server',
      description: 'Third-party OPC UA server connection',
      protocol: 'OPC UA',
      port: 4840,
      icon: '☁️',
      details: {
        endpoint: 'opc.tcp://192.168.1.100:4840',
        security: 'Basic256'
      }
    }
  };

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">
                <i className="fas fa-wifi"></i>
              </div>
              <div className="title-text">
                <h1>PLC Connection Status</h1>
                <p>Monitor and manage connections to Siemens S7-400 / CP 443-1</p>
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
            <span className="badge-label">Total Connections:</span>
            <span className="badge-number">3</span>
            <span className="badge-label">Active:</span>
            <span className="badge-number text-success">
              {Object.values(connections).filter(c => c.status === 'connected').length}
            </span>
            <span className="badge-label">Last Check:</span>
            <span className="badge-grade">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Connection Cards Grid */}
      <div className="status-cards">
        {Object.entries(connectionConfigs).map(([id, config]) => {
          const connection = connections[id] || { status: 'disconnected' };
          const status = connection.status;
          
          return (
            <div 
              key={id} 
              className="status-card connection-card"
              onClick={() => setSelectedConnection(id)}
            >
              <div className={`status-card-icon ${
                status === 'connected' ? 'phase-icon' : 
                status === 'error' ? 'power-icon' : 'time-icon'
              }`}>
                <span style={{ fontSize: '1.3rem' }}>{config.icon}</span>
              </div>
              <div className="status-card-content">
                <span className="status-label">{config.name}</span>
                <span className="status-value">
                  {getStatusIcon(status)} {getStatusText(status)}
                </span>
                <span className="status-unit">{config.protocol}</span>
                {connection.lastSeen && (
                  <span className="status-sub">Last seen: {connection.lastSeen}</span>
                )}
              </div>
              <div className="connection-actions">
                {status !== 'connected' ? (
                  <button 
                    className="btn-connect"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(id);
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-plug"></i> Connect
                  </button>
                ) : (
                  <button 
                    className="btn-disconnect"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisconnect(id);
                    }}
                  >
                    <i className="fas fa-power-off"></i> Disconnect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Details Modal/Expandable Section */}
      {selectedConnection && (
        <div className="connection-details">
          <div className="card">
            <div className="card-header">
              <h3>
                <i className="fas fa-info-circle"></i>
                {connectionConfigs[selectedConnection]?.name} - Details
              </h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedConnection(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="heat-info-grid">
                {Object.entries(connectionConfigs[selectedConnection]?.details || {}).map(([key, value]) => (
                  <div key={key} className="info-item">
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <span className="info-value">{value}</span>
                  </div>
                ))}
                <div className="info-item">
                  <label>Protocol</label>
                  <span>{connectionConfigs[selectedConnection]?.protocol}</span>
                </div>
                <div className="info-item">
                  <label>Port</label>
                  <span>{connectionConfigs[selectedConnection]?.port}</span>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <span className={`status-${connections[selectedConnection]?.status || 'disconnected'}`}>
                    {getStatusText(connections[selectedConnection]?.status || 'disconnected')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Log Section */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3>
          <i className="fas fa-history"></i>
          Connection Log
        </h3>
        <div className="timeline-container" style={{ maxHeight: '200px' }}>
          <div className="timeline-item">
            <div className="timeline-marker">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="timeline-content">
              <div className="timeline-time">
                <i className="far fa-clock"></i> {new Date().toLocaleTimeString()}
              </div>
              <div className="timeline-description">
                Connection monitor started. Waiting for connections...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PLCConnectionStatus;
