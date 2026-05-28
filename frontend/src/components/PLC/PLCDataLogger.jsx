import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCDataLogger = () => {
  const [activeTab, setActiveTab] = useState('realtime');
  const [dateRange, setDateRange] = useState('today');
  const [selectedTags, setSelectedTags] = useState(['temperature', 'pressure', 'motor_speed']);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  // Mock historical data
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (23 - i) * 3600000);
      data.push({
        timestamp: timestamp.toLocaleTimeString(),
        hour: timestamp.getHours(),
        temperature: 70 + Math.random() * 30,
        pressure: 3 + Math.random() * 5,
        motor_speed: 1000 + Math.random() * 1500,
        power: 150 + Math.random() * 200,
        energy: 200 + Math.random() * 300
      });
    }
    return data;
  };

  useEffect(() => {
    setChartData(generateHistoricalData());
  }, [dateRange]);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      console.log(`Exporting data as ${exportFormat}...`);
      setLoading(false);
    }, 1000);
  };

  const getValueColor = (value, type) => {
    if (type === 'temperature' && value > 100) return 'text-danger';
    if (type === 'temperature' && value > 80) return 'text-warning';
    if (type === 'pressure' && value > 8) return 'text-danger';
    if (type === 'pressure' && value > 6) return 'text-warning';
    if (type === 'motor_speed' && value > 2500) return 'text-danger';
    if (type === 'motor_speed' && value > 2000) return 'text-warning';
    return 'text-success';
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const stats = {
    avgTemperature: (chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length).toFixed(1),
    maxTemperature: Math.max(...chartData.map(d => d.temperature)).toFixed(1),
    minTemperature: Math.min(...chartData.map(d => d.temperature)).toFixed(1),
    avgPressure: (chartData.reduce((sum, d) => sum + d.pressure, 0) / chartData.length).toFixed(1),
    totalEnergy: (chartData.reduce((sum, d) => sum + d.energy, 0)).toFixed(0),
  };

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">
                <i className="fas fa-database"></i>
              </div>
              <div className="title-text">
                <h1>PLC Data Logger</h1>
                <p>Historical data logging, analysis, and export</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="export-controls">
              <select 
                className="form-control-sm"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV Format</option>
                <option value="excel">Excel Format</option>
                <option value="json">JSON Format</option>
              </select>
              <button 
                className="btn-export"
                onClick={handleExport}
                disabled={loading}
              >
                <i className={`fas fa-download ${loading ? 'spin' : ''}`}></i>
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <span className="badge-label">Date Range:</span>
            <div className="date-range-buttons">
              <button 
                className={`range-btn ${dateRange === 'today' ? 'active' : ''}`}
                onClick={() => setDateRange('today')}
              >
                Today
              </button>
              <button 
                className={`range-btn ${dateRange === 'yesterday' ? 'active' : ''}`}
                onClick={() => setDateRange('yesterday')}
              >
                Yesterday
              </button>
              <button 
                className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
                onClick={() => setDateRange('week')}
              >
                Last 7 Days
              </button>
              <button 
                className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
                onClick={() => setDateRange('month')}
              >
                Last 30 Days
              </button>
            </div>
            <span className="badge-label">Records:</span>
            <span className="badge-number">{chartData.length} entries</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="status-cards">
        <div className="status-card">
          <div className="status-card-icon phase-icon">
            <i className="fas fa-thermometer-half"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Temperature</span>
            <span className="status-value">
              {stats.avgTemperature}
              <span className="status-unit">°C</span>
            </span>
            <span className="status-sub">Min: {stats.minTemperature} | Max: {stats.maxTemperature}</span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon power-icon">
            <i className="fas fa-tachometer-alt"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Pressure</span>
            <span className="status-value">
              {stats.avgPressure}
              <span className="status-unit">bar</span>
            </span>
            <span className="status-sub">Average over period</span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon weight-icon">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Total Energy</span>
            <span className="status-value">
              {stats.totalEnergy}
              <span className="status-unit">kWh</span>
            </span>
            <span className="status-sub">Consumption period</span>
          </div>
        </div>
      </div>
       <br />
      {/* Tabs */}
      <div className="eaf-tabs">
        <button 
          className={`tab-btn ${activeTab === 'realtime' ? 'active' : ''}`}
          onClick={() => setActiveTab('realtime')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Real-time Data</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          <span>Historical Trends</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          <i className="fas fa-chart-bar"></i>
          <span>Data Analysis</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-file-alt"></i>
          <span>Reports</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="eaf-tab-content">
        {activeTab === 'realtime' && (
          <div className="eaf-melting-control">
            {/* Tag Selection */}
            <div className="card">
              <h3>
                <i className="fas fa-tags"></i>
                Select Tags to Monitor
              </h3>
              <div className="tag-selector">
                <label className="tag-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes('temperature')}
                    onChange={() => toggleTag('temperature')}
                  />
                  <span>🌡️ Temperature</span>
                </label>
                <label className="tag-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes('pressure')}
                    onChange={() => toggleTag('pressure')}
                  />
                  <span>📊 Pressure</span>
                </label>
                <label className="tag-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes('motor_speed')}
                    onChange={() => toggleTag('motor_speed')}
                  />
                  <span>⚡ Motor Speed</span>
                </label>
                <label className="tag-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes('power')}
                    onChange={() => toggleTag('power')}
                  />
                  <span>🔋 Power</span>
                </label>
                <label className="tag-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes('energy')}
                    onChange={() => toggleTag('energy')}
                  />
                  <span>💡 Energy</span>
                </label>
              </div>
            </div>

            {/* Data Table */}
            <div className="card">
              <h3>
                <i className="fas fa-table"></i>
                Live Data Stream
              </h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      {selectedTags.includes('temperature') && <th>Temperature (°C)</th>}
                      {selectedTags.includes('pressure') && <th>Pressure (bar)</th>}
                      {selectedTags.includes('motor_speed') && <th>Motor Speed (RPM)</th>}
                      {selectedTags.includes('power') && <th>Power (kW)</th>}
                      {selectedTags.includes('energy') && <th>Energy (kWh)</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.slice(-10).reverse().map((row, idx) => (
                      <tr key={idx}>
                        <td className="time-cell">{row.timestamp}</td>
                        {selectedTags.includes('temperature') && (
                          <td className={getValueColor(row.temperature, 'temperature')}>{row.temperature.toFixed(1)}</td>
                        )}
                        {selectedTags.includes('pressure') && (
                          <td className={getValueColor(row.pressure, 'pressure')}>{row.pressure.toFixed(1)}</td>
                        )}
                        {selectedTags.includes('motor_speed') && (
                          <td className={getValueColor(row.motor_speed, 'motor_speed')}>{row.motor_speed.toFixed(0)}</td>
                        )}
                        {selectedTags.includes('power') && <td>{row.power.toFixed(0)}</td>}
                        {selectedTags.includes('energy')} <td>{row.energy.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="eaf-electrical-profile">
            <div className="card">
              <h3>
                <i className="fas fa-chart-line"></i>
                Historical Trends
              </h3>
              <div className="chart-placeholder">
                <div className="chart-message">
                  <i className="fas fa-chart-line"></i>
                  <p>Chart visualization will appear here</p>
                  <small>Select tags and date range to view trends</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="eaf-energy-monitor">
            <div className="card">
              <h3>
                <i className="fas fa-chart-bar"></i>
                Statistical Analysis
              </h3>
              <div className="heat-info-grid">
                <div className="info-item">
                  <label>Average Temperature</label>
                  <span>{stats.avgTemperature} °C</span>
                </div>
                <div className="info-item">
                  <label>Temperature Range</label>
                  <span>{stats.minTemperature} - {stats.maxTemperature} °C</span>
                </div>
                <div className="info-item">
                  <label>Average Pressure</label>
                  <span>{stats.avgPressure} bar</span>
                </div>
                <div className="info-item">
                  <label>Total Energy</label>
                  <span>{stats.totalEnergy} kWh</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="eaf-delays">
            <div className="card">
              <h3>
                <i className="fas fa-file-alt"></i>
                Generate Reports
              </h3>
              <div className="report-options">
                <div className="report-option">
                  <i className="fas fa-chart-line"></i>
                  <div>
                    <h4>Daily Production Report</h4>
                    <p>Temperature, pressure, and production metrics</p>
                  </div>
                  <button className="btn-primary">Generate</button>
                </div>
                <div className="report-option">
                  <i className="fas fa-charging-station"></i>
                  <div>
                    <h4>Energy Consumption Report</h4>
                    <p>Detailed energy usage analysis</p>
                  </div>
                  <button className="btn-primary">Generate</button>
                </div>
                <div className="report-option">
                  <i className="fas fa-chart-pie"></i>
                  <div>
                    <h4>Quality Analysis Report</h4>
                    <p>Process quality and compliance metrics</p>
                  </div>
                  <button className="btn-primary">Generate</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PLCDataLogger;
