import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCConfiguration = () => {
  const [activeTab, setActiveTab] = useState('s7');
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // S7 Configuration State
  const [s7Config, setS7Config] = useState({
    enabled: true,
    ip: '192.168.0.1',
    rack: 0,
    slot: 3,
    port: 102,
    timeout: 5,
    putGetEnabled: true
  });
  
  // OPC UA Configuration State
  const [opcuaConfig, setOpcuaConfig] = useState({
    enabled: false,
    endpoint: 'opc.tcp://192.168.0.1:4840',
    port: 4840,
    securityPolicy: 'None',
    username: '',
    password: '',
    sessionTimeout: 120
  });
  
  // External OPC UA Configuration
  const [externalConfig, setExternalConfig] = useState({
    enabled: false,
    endpoint: 'opc.tcp://192.168.1.100:4840',
    port: 4840,
    securityPolicy: 'Basic256',
    username: 'user',
    password: '******',
    useCertificates: false
  });
  
  // Tag Mappings
  const [tagMappings, setTagMappings] = useState([
    { id: 1, name: 'temperature', address: 'DB10.REAL0', type: 'REAL', connection: 's7_bus', enabled: true },
    { id: 2, name: 'pressure', address: 'DB10.REAL4', type: 'REAL', connection: 's7_bus', enabled: true },
    { id: 3, name: 'motor_speed', address: 'DB10.INT8', type: 'INT', connection: 's7_bus', enabled: true },
    { id: 4, name: 'power', address: 'DB10.REAL12', type: 'REAL', connection: 's7_bus', enabled: true },
    { id: 5, name: 'production_rate', address: 'ns=3;s=ProductionData.Rate', type: 'REAL', connection: 'cp_opcua_server', enabled: true },
    { id: 6, name: 'energy', address: 'ns=2;s=Energy.MainMeter', type: 'REAL', connection: 'external_opcua', enabled: true }
  ]);
  
  const [newTag, setNewTag] = useState({
    name: '',
    address: '',
    type: 'REAL',
    connection: 's7_bus',
    enabled: true
  });

  const handleS7Change = (field, value) => {
    setS7Config(prev => ({ ...prev, [field]: value }));
  };

  const handleOpcuaChange = (field, value) => {
    setOpcuaConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleExternalChange = (field, value) => {
    setExternalConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async (type) => {
    setTestResult({ type, status: 'testing', message: `Testing ${type} connection...` });
    
    // Simulate API call
    setTimeout(() => {
      if (type === 's7' && s7Config.ip) {
        setTestResult({ type, status: 'success', message: `S7 connection successful to ${s7Config.ip}:${s7Config.port}` });
      } else if (type === 'opcua' && opcuaConfig.enabled) {
        setTestResult({ type, status: opcuaConfig.enabled ? 'success' : 'warning', message: `OPC UA ${opcuaConfig.enabled ? 'server ready' : 'disabled'}` });
      } else if (type === 'external') {
        setTestResult({ type, status: externalConfig.enabled ? 'success' : 'warning', message: `External OPC UA ${externalConfig.enabled ? 'configured' : 'disabled'}` });
      } else {
        setTestResult({ type, status: 'error', message: 'Connection failed. Check configuration.' });
      }
      
      setTimeout(() => setTestResult(null), 3000);
    }, 1500);
  };

  const saveConfiguration = () => {
    setSaving(true);
    // Simulate API save
    setTimeout(() => {
      setSaving(false);
      alert('Configuration saved successfully!');
    }, 1000);
  };

  const addTag = () => {
    if (newTag.name && newTag.address) {
      setTagMappings(prev => [...prev, { ...newTag, id: Date.now() }]);
      setNewTag({ name: '', address: '', type: 'REAL', connection: 's7_bus', enabled: true });
    }
  };

  const removeTag = (id) => {
    setTagMappings(prev => prev.filter(tag => tag.id !== id));
  };

  const toggleTag = (id) => {
    setTagMappings(prev => prev.map(tag => 
      tag.id === id ? { ...tag, enabled: !tag.enabled } : tag
    ));
  };

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">
                <i className="fas fa-cog"></i>
              </div>
              <div className="title-text">
                <h1>PLC Configuration</h1>
                <p>Configure PLC communication settings and tag mappings</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="btn-primary"
              onClick={saveConfiguration}
              disabled={saving}
            >
              <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Quick Status */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <span className="badge-label">S7 BUS:</span>
            <span className={`badge-number ${s7Config.enabled ? 'text-success' : 'text-muted'}`}>
              {s7Config.enabled ? '● Enabled' : '○ Disabled'}
            </span>
            <span className="badge-label">OPC UA Server:</span>
            <span className={`badge-number ${opcuaConfig.enabled ? 'text-success' : 'text-muted'}`}>
              {opcuaConfig.enabled ? '● Enabled' : '○ Disabled'}
            </span>
            <span className="badge-label">External OPC UA:</span>
            <span className={`badge-number ${externalConfig.enabled ? 'text-success' : 'text-muted'}`}>
              {externalConfig.enabled ? '● Enabled' : '○ Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="eaf-tabs">
        <button 
          className={`tab-btn ${activeTab === 's7' ? 'active' : ''}`}
          onClick={() => setActiveTab('s7')}
        >
          <i className="fas fa-microchip"></i>
          <span>S7 BUS (CP 443-1)</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'opcua' ? 'active' : ''}`}
          onClick={() => setActiveTab('opcua')}
        >
          <i className="fas fa-server"></i>
          <span>OPC UA Server</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'external' ? 'active' : ''}`}
          onClick={() => setActiveTab('external')}
        >
          <i className="fas fa-cloud"></i>
          <span>External OPC UA</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <i className="fas fa-tags"></i>
          <span>Tag Mappings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="eaf-tab-content">
        {/* S7 BUS Configuration */}
        {activeTab === 's7' && (
          <div className="card">
            <h3>
              <i className="fas fa-microchip"></i>
              CP 443-1 Communication Settings
            </h3>
            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Enable S7 BUS</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={s7Config.enabled}
                      onChange={(e) => handleS7Change('enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="form-group">
                  <label>IP Address</label>
                  <input
                    type="text"
                    value={s7Config.ip}
                    onChange={(e) => handleS7Change('ip', e.target.value)}
                    placeholder="192.168.0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Port</label>
                  <input
                    type="number"
                    value={s7Config.port}
                    onChange={(e) => handleS7Change('port', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rack</label>
                  <input
                    type="number"
                    value={s7Config.rack}
                    onChange={(e) => handleS7Change('rack', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Slot</label>
                  <input
                    type="number"
                    value={s7Config.slot}
                    onChange={(e) => handleS7Change('slot', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Timeout (seconds)</label>
                  <input
                    type="number"
                    value={s7Config.timeout}
                    onChange={(e) => handleS7Change('timeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Enable PUT/GET</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={s7Config.putGetEnabled}
                      onChange={(e) => handleS7Change('putGetEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="btn-test"
                  onClick={() => testConnection('s7')}
                >
                  <i className="fas fa-plug"></i>
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPC UA Server Configuration */}
        {activeTab === 'opcua' && (
          <div className="card">
            <h3>
              <i className="fas fa-server"></i>
              CP 443-1 OPC UA Server Settings
            </h3>
            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Enable OPC UA Server</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={opcuaConfig.enabled}
                      onChange={(e) => handleOpcuaChange('enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Endpoint URL</label>
                  <input
                    type="text"
                    value={opcuaConfig.endpoint}
                    onChange={(e) => handleOpcuaChange('endpoint', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Port</label>
                  <input
                    type="number"
                    value={opcuaConfig.port}
                    onChange={(e) => handleOpcuaChange('port', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Security Policy</label>
                  <select
                    value={opcuaConfig.securityPolicy}
                    onChange={(e) => handleOpcuaChange('securityPolicy', e.target.value)}
                  >
                    <option value="None">None</option>
                    <option value="Basic128Rsa15">Basic128Rsa15</option>
                    <option value="Basic256">Basic256</option>
                    <option value="Basic256Sha256">Basic256Sha256</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Username (optional)</label>
                  <input
                    type="text"
                    value={opcuaConfig.username}
                    onChange={(e) => handleOpcuaChange('username', e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="form-group">
                  <label>Session Timeout (ms)</label>
                  <input
                    type="number"
                    value={opcuaConfig.sessionTimeout}
                    onChange={(e) => handleOpcuaChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="btn-test"
                  onClick={() => testConnection('opcua')}
                >
                  <i className="fas fa-plug"></i>
                  Test Server
                </button>
              </div>
            </div>
          </div>
        )}

        {/* External OPC UA Configuration */}
        {activeTab === 'external' && (
          <div className="card">
            <h3>
              <i className="fas fa-cloud"></i>
              External OPC UA Server Settings
            </h3>
            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Enable External OPC UA</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={externalConfig.enabled}
                      onChange={(e) => handleExternalChange('enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Endpoint URL</label>
                  <input
                    type="text"
                    value={externalConfig.endpoint}
                    onChange={(e) => handleExternalChange('endpoint', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Port</label>
                  <input
                    type="number"
                    value={externalConfig.port}
                    onChange={(e) => handleExternalChange('port', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Security Policy</label>
                  <select
                    value={externalConfig.securityPolicy}
                    onChange={(e) => handleExternalChange('securityPolicy', e.target.value)}
                  >
                    <option value="None">None</option>
                    <option value="Basic128Rsa15">Basic128Rsa15</option>
                    <option value="Basic256">Basic256</option>
                    <option value="Basic256Sha256">Basic256Sha256</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={externalConfig.username}
                    onChange={(e) => handleExternalChange('username', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={externalConfig.password}
                    onChange={(e) => handleExternalChange('password', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Use Certificates</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={externalConfig.useCertificates}
                      onChange={(e) => handleExternalChange('useCertificates', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="btn-test"
                  onClick={() => testConnection('external')}
                >
                  <i className="fas fa-plug"></i>
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tag Mappings */}
        {activeTab === 'tags' && (
          <div className="card">
            <h3>
              <i className="fas fa-tags"></i>
              Tag Mappings
            </h3>
            <div className="add-tag-form">
              <h4>Add New Tag</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Tag Name</label>
                  <input
                    type="text"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="e.g., temperature"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={newTag.address}
                    onChange={(e) => setNewTag({ ...newTag, address: e.target.value })}
                    placeholder="DB10.REAL0"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newTag.type}
                    onChange={(e) => setNewTag({ ...newTag, type: e.target.value })}
                  >
                    <option value="BOOL">BOOL</option>
                    <option value="INT">INT</option>
                    <option value="REAL">REAL</option>
                    <option value="STRING">STRING</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Connection</label>
                  <select
                    value={newTag.connection}
                    onChange={(e) => setNewTag({ ...newTag, connection: e.target.value })}
                  >
                    <option value="s7_bus">S7 BUS</option>
                    <option value="cp_opcua_server">CP OPC UA</option>
                    <option value="external_opcua">External OPC UA</option>
                  </select>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn-add" onClick={addTag}>
                    <i className="fas fa-plus"></i>
                    Add Tag
                  </button>
                </div>
              </div>
            </div>

            <div className="tags-table">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Enabled</th>
                      <th>Tag Name</th>
                      <th>Address</th>
                      <th>Type</th>
                      <th>Connection</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagMappings.map(tag => (
                      <tr key={tag.id}>
                        <td>
                          <div className="toggle-switch small">
                            <input
                              type="checkbox"
                              checked={tag.enabled}
                              onChange={() => toggleTag(tag.id)}
                            />
                            <span className="toggle-slider"></span>
                          </div>
                        </td>
                        <td><strong>{tag.name}</strong></td>
                        <td><code>{tag.address}</code></td>
                        <td>{tag.type}</td>
                        <td>
                          <span className={`connection-badge ${tag.connection}`}>
                            {tag.connection.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon" onClick={() => removeTag(tag.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Result Notification */}
      {testResult && (
        <div className={`test-notification ${testResult.status}`}>
          <i className={`fas ${testResult.status === 'success' ? 'fa-check-circle' : testResult.status === 'error' ? 'fa-exclamation-circle' : 'fa-spinner fa-spin'}`}></i>
          {testResult.message}
        </div>
      )}
    </div>
  );
};

export default PLCConfiguration;