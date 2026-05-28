import React, { useState, useEffect } from 'react';
import './PLC.css';

const PLCHistoricalData = () => {
  const [dateRange, setDateRange] = useState('week');
  const [selectedTag, setSelectedTag] = useState('temperature');
  const [chartType, setChartType] = useState('line');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aggregation, setAggregation] = useState('hourly');

  // Generate historical data based on selected range and tag
  const generateHistoricalData = () => {
    let points = 0;
    let multiplier = 1;
    
    switch(dateRange) {
      case 'today': points = 24; multiplier = 1; break;
      case 'yesterday': points = 24; multiplier = 1; break;
      case 'week': points = 7; multiplier = 24; break;
      case 'month': points = 30; multiplier = 24; break;
      case 'year': points = 12; multiplier = 730; break;
      default: points = 24;
    }

    const data = [];
    const now = new Date();
    
    for (let i = points - 1; i >= 0; i--) {
      let timestamp;
      let value;
      
      switch(dateRange) {
        case 'today':
          timestamp = new Date(now.getTime() - i * 3600000);
          break;
        case 'yesterday':
          timestamp = new Date(now.getTime() - (i + 24) * 3600000);
          break;
        default:
          timestamp = new Date(now.getTime() - i * multiplier * 3600000);
      }
      
      // Generate realistic data based on tag
      switch(selectedTag) {
        case 'temperature':
          value = 70 + Math.sin(i * 0.3) * 15 + Math.random() * 5;
          break;
        case 'pressure':
          value = 5 + Math.sin(i * 0.2) * 2.5 + Math.random() * 1;
          break;
        case 'motor_speed':
          value = 1500 + Math.sin(i * 0.4) * 800 + Math.random() * 100;
          break;
        case 'power':
          value = 250 + Math.sin(i * 0.25) * 120 + Math.random() * 30;
          break;
        case 'energy':
          value = 2000 + i * 50 + Math.random() * 100;
          break;
        default:
          value = 100 + Math.sin(i * 0.3) * 30;
      }
      
      data.push({
        timestamp: timestamp,
        formattedTime: formatTimestamp(timestamp, dateRange),
        value: Math.max(0, value.toFixed(1)),
        rawValue: value
      });
    }
    
    return data;
  };

  const formatTimestamp = (timestamp, range) => {
    switch(range) {
      case 'today':
      case 'yesterday':
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return timestamp.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      case 'month':
        return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'year':
        return timestamp.toLocaleDateString([], { month: 'short', year: 'numeric' });
      default:
        return timestamp.toLocaleString();
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setHistoricalData(generateHistoricalData());
      setLoading(false);
    }, 500);
  }, [dateRange, selectedTag]);

  const getTagConfig = () => {
    const configs = {
      temperature: { name: 'Temperature', unit: '°C', min: 20, max: 120, color: '#ef4444', icon: '🌡️' },
      pressure: { name: 'Pressure', unit: 'bar', min: 0, max: 12, color: '#3b82f6', icon: '📊' },
      motor_speed: { name: 'Motor Speed', unit: 'RPM', min: 0, max: 3000, color: '#f59e0b', icon: '⚡' },
      power: { name: 'Power', unit: 'kW', min: 0, max: 500, color: '#10b981', icon: '🔋' },
      energy: { name: 'Energy', unit: 'kWh', min: 0, max: 5000, color: '#8b5cf6', icon: '💡' }
    };
    return configs[selectedTag] || configs.temperature;
  };

  const getStatistics = () => {
    const values = historicalData.map(d => parseFloat(d.value));
    if (values.length === 0) return { min: 0, max: 0, avg: 0, total: 0 };
    
    return {
      min: Math.min(...values).toFixed(1),
      max: Math.max(...values).toFixed(1),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
      total: values.reduce((a, b) => a + b, 0).toFixed(0),
      trend: values[values.length - 1] > values[0] ? 'up' : 'down'
    };
  };

  const stats = getStatistics();
  const tagConfig = getTagConfig();

  return (
    <div className="eaf-dashboard plc-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <div className="title-section">
              <div className="title-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="title-text">
                <h1>Historical Data Analysis</h1>
                <p>Historical trend analysis, reporting, and data visualization</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="btn-export"
              onClick={() => console.log('Export historical data')}
            >
              <i className="fas fa-download"></i>
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <span className="badge-label">Data Points:</span>
            <span className="badge-number">{historicalData.length}</span>
            <span className="badge-label">Time Range:</span>
            <span className="badge-number">
              {dateRange === 'today' ? 'Last 24 Hours' :
               dateRange === 'yesterday' ? 'Yesterday' :
               dateRange === 'week' ? 'Last 7 Days' :
               dateRange === 'month' ? 'Last 30 Days' : 'Last 12 Months'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="control-panel">
          <div className="control-group">
            <label>Parameter</label>
            <select 
              className="form-control-sm"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="temperature">🌡️ Temperature</option>
              <option value="pressure">📊 Pressure</option>
              <option value="motor_speed">⚡ Motor Speed</option>
              <option value="power">🔋 Power</option>
              <option value="energy">💡 Energy</option>
            </select>
          </div>
          <div className="control-group">
            <label>Time Range</label>
            <select 
              className="form-control-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Last 24 Hours</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
          <div className="control-group">
            <label>Chart Type</label>
            <select 
              className="form-control-sm"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
          <div className="control-group">
            <label>Aggregation</label>
            <select 
              className="form-control-sm"
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
            >
              <option value="raw">Raw Data</option>
              <option value="hourly">Hourly Average</option>
              <option value="daily">Daily Average</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="status-cards">
        <div className="status-card">
          <div className={`status-card-icon phase-icon`} style={{ background: `linear-gradient(135deg, ${tagConfig.color}, ${tagConfig.color}cc)` }}>
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Current Value</span>
            <span className="status-value">
              {historicalData[historicalData.length - 1]?.value || '---'}
              <span className="status-unit">{tagConfig.unit}</span>
            </span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon power-icon">
            <i className="fas fa-arrow-trend-up"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Average</span>
            <span className="status-value">
              {stats.avg}
              <span className="status-unit">{tagConfig.unit}</span>
            </span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon time-icon">
            <i className="fas fa-chart-simple"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Min / Max</span>
            <span className="status-value">
              {stats.min} / {stats.max}
              <span className="status-unit">{tagConfig.unit}</span>
            </span>
          </div>
        </div>
        <div className="status-card">
          <div className="status-card-icon weight-icon">
            <i className="fas fa-waveform"></i>
          </div>
          <div className="status-card-content">
            <span className="status-label">Trend</span>
            <span className="status-value">
              {stats.trend === 'up' ? '📈 Increasing' : '📉 Decreasing'}
            </span>
          </div>
        </div>
      </div>
       <br />
      {/* Chart Section */}
      <div className="card">
        <h3>
          <i className="fas fa-chart-line"></i>
          {tagConfig.name} Trend - {tagConfig.icon}
        </h3>
        <div className="chart-container-large">
          {loading ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Loading historical data...</p>
            </div>
          ) : (
            <div className="chart-wrapper">
              <div className="chart-placeholder-large">
                <div className="chart-message">
                  <i className="fas fa-chart-line"></i>
                  <p>{tagConfig.name} Trend Chart</p>
                  <small>
                    {dateRange === 'today' ? 'Hourly' : 
                     dateRange === 'week' ? 'Daily' : 
                     dateRange === 'month' ? 'Daily' : 'Monthly'} data with {aggregation} aggregation
                  </small>
                </div>
                
                {/* Simulated chart bars */}
                <div className="simulated-chart">
                  {historicalData.slice(-20).map((data, idx) => {
                    const maxValue = tagConfig.max;
                    const height = (parseFloat(data.value) / maxValue) * 150;
                    return (
                      <div key={idx} className="chart-bar-container">
                        <div 
                          className="chart-bar" 
                          style={{ 
                            height: `${Math.min(150, height)}px`,
                            backgroundColor: tagConfig.color
                          }}
                          title={`${data.formattedTime}: ${data.value} ${tagConfig.unit}`}
                        />
                        <span className="chart-label">{data.formattedTime}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <h3>
          <i className="fas fa-table"></i>
          Historical Data Table
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Value ({tagConfig.unit})</th>
                <th>Daily Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.slice(-20).reverse().map((data, idx) => {
                const prevValue = idx < historicalData.length - 1 ? parseFloat(historicalData[historicalData.length - idx - 2]?.value) : parseFloat(data.value);
                const change = parseFloat(data.value) - prevValue;
                const isIncrease = change > 0;
                const absChange = Math.abs(change).toFixed(1);
                
                return (
                  <tr key={idx}>
                    <td className="time-cell">{data.formattedTime}</td>
                    <td className={change > 5 ? 'text-danger' : change < -5 ? 'text-success' : ''}>
                      {data.value}
                    </td>
                    <td>
                      {idx < historicalData.length - 1 && (
                        <span className={isIncrease ? 'trend-up' : 'trend-down'}>
                          {isIncrease ? '↑' : '↓'} {absChange}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${parseFloat(data.value) > tagConfig.max * 0.9 ? 'warning' : 'normal'}`}>
                        {parseFloat(data.value) > tagConfig.max * 0.9 ? 'High' : 
                         parseFloat(data.value) < tagConfig.max * 0.1 ? 'Low' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Showing last 20 of {historicalData.length} records
        </div>
      </div>
    </div>
  );
};

export default PLCHistoricalData;
