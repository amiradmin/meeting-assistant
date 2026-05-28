// src/components/dashboard/EnergyConsumptionChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './EnergyConsumptionChart.css';

const EnergyConsumptionChart = ({ energyData, timeRange }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedChart, setSelectedChart] = useState('line');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [peakDemand, setPeakDemand] = useState(0);
  const [avgEfficiency, setAvgEfficiency] = useState(0);
  const [costPerTon, setCostPerTon] = useState(0);

  const chartRef = useRef(null);

  // Generate mock data based on time range
  const generateChartData = () => {
    const data = [];
    const units = ['EAF', 'LF', 'CCM', 'WTP', 'FTP', 'RMH'];

    let hours = 24;
    let interval = 1;

    switch(timeRange) {
      case 'week':
        hours = 7 * 24;
        interval = 4;
        break;
      case 'month':
        hours = 30 * 24;
        interval = 24;
        break;
      case 'year':
        hours = 12;
        interval = 720;
        break;
      default:
        hours = 24;
        interval = 1;
    }

    const baseDate = new Date();

    for (let i = 0; i < hours; i += interval) {
      const timestamp = new Date(baseDate);

      switch(timeRange) {
        case 'today':
          timestamp.setHours(timestamp.getHours() - (23 - i));
          break;
        case 'week':
          timestamp.setHours(timestamp.getHours() - ((7 * 24 - 1) - i));
          break;
        case 'month':
          timestamp.setDate(timestamp.getDate() - (29 - i/24));
          break;
        case 'year':
          timestamp.setMonth(timestamp.getMonth() - (11 - i/720));
          break;
        default:
          timestamp.setHours(timestamp.getHours() - (23 - i));
      }

      const dataPoint = {
        time: formatTime(timestamp),
        timestamp: timestamp.getTime(),
        EAF: Math.round(300 + Math.random() * 200),
        LF: Math.round(100 + Math.random() * 50),
        CCM: Math.round(50 + Math.random() * 30),
        WTP: Math.round(20 + Math.random() * 10),
        FTP: Math.round(15 + Math.random() * 10),
        RMH: Math.round(10 + Math.random() * 5),
        Total: 0,
        Efficiency: 90 + Math.random() * 5,
        Cost: 0
      };

      dataPoint.Total = Object.keys(dataPoint)
        .filter(key => ['EAF', 'LF', 'CCM', 'WTP', 'FTP', 'RMH'].includes(key))
        .reduce((sum, key) => sum + dataPoint[key], 0);

      dataPoint.Cost = dataPoint.Total * 0.15;

      data.push(dataPoint);
    }

    return data;
  };

  const formatTime = (date) => {
    switch(timeRange) {
      case 'today':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'week':
        return date.toLocaleDateString([], { weekday: 'short' }) + ' ' +
               date.toLocaleTimeString([], { hour: '2-digit' });
      case 'month':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case 'year':
        return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  useEffect(() => {
    const data = generateChartData();
    setChartData(data);

    const total = data.reduce((sum, point) => sum + point.Total, 0);
    const peak = Math.max(...data.map(point => point.Total));
    const avgEff = data.reduce((sum, point) => sum + point.Efficiency, 0) / data.length;
    const avgCost = total * 0.15;

    setTotalConsumption(total);
    setPeakDemand(peak);
    setAvgEfficiency(avgEff);
    setCostPerTon(avgCost / 1250);
  }, [timeRange]);

  const getChartData = () => {
    if (selectedUnit === 'all') {
      return chartData;
    }
    return chartData.map(point => ({
      time: point.time,
      [selectedUnit]: point[selectedUnit],
      Total: point[selectedUnit]
    }));
  };

  const unitDistribution = [
    { name: 'EAF', value: chartData.reduce((sum, point) => sum + point.EAF, 0), color: '#ef4444' },
    { name: 'LF', value: chartData.reduce((sum, point) => sum + point.LF, 0), color: '#f59e0b' },
    { name: 'CCM', value: chartData.reduce((sum, point) => sum + point.CCM, 0), color: '#10b981' },
    { name: 'WTP', value: chartData.reduce((sum, point) => sum + point.WTP, 0), color: '#3b82f6' },
    { name: 'FTP', value: chartData.reduce((sum, point) => sum + point.FTP, 0), color: '#8b5cf6' },
    { name: 'RMH', value: chartData.reduce((sum, point) => sum + point.RMH, 0), color: '#06b6d4' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <strong>{entry.value.toLocaleString()} MW</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const data = getChartData();

    switch(selectedChart) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                label={{ value: 'Megawatts (MW)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedUnit === 'all' ? (
                <>
                  <Line type="monotone" dataKey="EAF" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="LF" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="CCM" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="WTP" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="FTP" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="RMH" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </>
              ) : (
                <Line type="monotone" dataKey={selectedUnit} stroke="#4fc3f7" strokeWidth={3} dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                label={{ value: 'Megawatts (MW)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedUnit === 'all' ? (
                <>
                  <Bar dataKey="EAF" fill="#ef4444" />
                  <Bar dataKey="LF" fill="#f59e0b" />
                  <Bar dataKey="CCM" fill="#10b981" />
                  <Bar dataKey="WTP" fill="#3b82f6" />
                  <Bar dataKey="FTP" fill="#8b5cf6" />
                  <Bar dataKey="RMH" fill="#06b6d4" />
                </>
              ) : (
                <Bar dataKey={selectedUnit} fill="#4fc3f7" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                label={{ value: 'Megawatts (MW)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedUnit === 'all' ? (
                <>
                  <Area type="monotone" dataKey="EAF" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="LF" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="CCM" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="WTP" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="FTP" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="RMH" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                </>
              ) : (
                <Area type="monotone" dataKey={selectedUnit} stroke="#4fc3f7" fill="#4fc3f7" fillOpacity={0.5} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-card" dir="ltr">
      <div className="card-header">
        <div className="header-left">
          <h3 className="card-title">
            <i className="fas fa-bolt"></i>
            Energy Consumption & Cost Analysis
          </h3>
          <div className="time-range-info">
            <i className="fas fa-calendar-alt"></i>
            Time Range:
            <span className="range-value">
              {timeRange === 'today' && 'Today'}
              {timeRange === 'week' && 'This Week'}
              {timeRange === 'month' && 'This Month'}
              {timeRange === 'year' && 'This Year'}
            </span>
          </div>
        </div>

        <div className="header-controls">
          <div className="control-group">
            <label className="control-label">
              <i className="fas fa-chart-line"></i>
              Chart Type:
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">
              <i className="fas fa-industry"></i>
              Unit:
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
            >
              <option value="all">All Units</option>
              <option value="EAF">Electric Arc Furnace</option>
              <option value="LF">Ladle Furnace</option>
              <option value="CCM">Continuous Casting Machine</option>
              <option value="WTP">Water Treatment Plant</option>
              <option value="FTP">Fume Treatment Plant</option>
              <option value="RMH">Raw Material Handling</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Key Statistics */}
        <div className="energy-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {totalConsumption.toLocaleString()}
                <span className="stat-unit"> MW</span>
              </div>
              <div className="stat-label">Total Energy Consumption</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {peakDemand.toLocaleString()}
                <span className="stat-unit"> MW</span>
              </div>
              <div className="stat-label">Peak Demand</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-percentage"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {avgEfficiency.toFixed(1)}
                <span className="stat-unit"> %</span>
              </div>
              <div className="stat-label">Average Efficiency</div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h4 className="chart-title">
              <i className="fas fa-chart-bar"></i>
              Energy Consumption Pattern
            </h4>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot eaf"></span>
                <span className="legend-label">EAF</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot lf"></span>
                <span className="legend-label">LF</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot ccm"></span>
                <span className="legend-label">CCM</span>
              </div>
              {selectedUnit === 'all' && (
                <>
                  <div className="legend-item">
                    <span className="legend-dot wtp"></span>
                    <span className="legend-label">WTP</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot ftp"></span>
                    <span className="legend-label">FTP</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot rmh"></span>
                    <span className="legend-label">RMH</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="chart-wrapper" ref={chartRef}>
            {renderChart()}
          </div>
        </div>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
        {/* Distribution and Additional Charts */}
        <div className="secondary-charts">
          <div className="distribution-chart">
            <h4 className="chart-title">
              <i className="fas fa-chart-pie"></i>
              Energy Distribution by Unit
            </h4>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={unitDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {unitDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} MW`, 'Consumption']}
                    labelFormatter={(label) => `Unit: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="cost-analysis">
            <h4 className="chart-title">
              <i className="fas fa-money-bill-trend-up"></i>
              Cost Analysis
            </h4>
            <div className="cost-breakdown">
              <div className="cost-item">
                <div className="cost-label">Total Energy Cost</div>
                <div className="cost-value">
                  ${(totalConsumption * 0.15).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="cost-bar">
                  <div className="bar-fill" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="cost-item">
                <div className="cost-label">EAF Share</div>
                <div className="cost-value">
                  ${(unitDistribution[0].value * 0.15).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="cost-bar">
                  <div
                    className="bar-fill eaf"
                    style={{ width: `${(unitDistribution[0].value / totalConsumption * 100).toFixed(1)}%` }}
                  ></div>
                </div>
              </div>

              <div className="cost-item">
                <div className="cost-label">Cost per Ton of Steel</div>
                <div className="cost-value">
                  ${costPerTon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/ton
                </div>
                <div className="cost-bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(costPerTon / 50 * 100).toFixed(1)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations and Alerts */}
        <div className="recommendations">
          <h4 className="section-title">
            <i className="fas fa-lightbulb"></i>
            Optimization Recommendations
          </h4>
          <div className="recommendation-list">
            <div className="recommendation-item">
              <div className="recommendation-icon success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="recommendation-content">
                <div className="recommendation-title">EAF Efficiency Optimal</div>
                <div className="recommendation-desc">
                  Electric Arc Furnace efficiency is within optimal range
                </div>
              </div>
            </div>

            <div className="recommendation-item">
              <div className="recommendation-icon warning">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="recommendation-content">
                <div className="recommendation-title">Optimization Opportunity at WTP</div>
                <div className="recommendation-desc">
                  Potential 15% energy reduction in Water Treatment Plant
                </div>
              </div>
            </div>

            <div className="recommendation-item">
              <div className="recommendation-icon info">
                <i className="fas fa-info-circle"></i>
              </div>
              <div className="recommendation-content">
                <div className="recommendation-title">Peak Usage Time</div>
                <div className="recommendation-desc">
                  Peak energy consumption occurs between 2:00 PM - 6:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyConsumptionChart;