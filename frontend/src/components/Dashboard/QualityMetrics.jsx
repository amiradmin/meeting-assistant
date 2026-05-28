// src/components/dashboard/QualityMetrics.jsx
import React, { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import './QualityMetrics.css';

const QualityMetrics = ({ data: initialData }) => {
  const [selectedGrade, setSelectedGrade] = useState('ST37');
  const [timeRange, setTimeRange] = useState('today');
  const [qualityData, setQualityData] = useState({
    overall: {},
    defects: [],
    chemicalAnalysis: {},
    physicalProperties: {},
    trends: []
  });

  // Steel grades with specifications
  const steelGrades = [
    { id: 'ST37', name: 'ST37 - Structural Steel', standard: 'DIN 17100' },
    { id: 'ST52', name: 'ST52 - High Strength Steel', standard: 'DIN 17100' },
    { id: 'A36', name: 'A36 - Construction Steel', standard: 'ASTM A36' },
    { id: 'A572', name: 'A572 - Grade 50 Steel', standard: 'ASTM A572' },
    { id: 'S235JR', name: 'S235JR - Mild Steel', standard: 'EN 10025' },
    { id: 'S355JR', name: 'S355JR - Medium Steel', standard: 'EN 10025' }
  ];

  // Generate mock quality data
  const generateMockData = () => {
    const grades = ['ST37', 'ST52', 'A36', 'A572', 'S235JR', 'S355JR'];

    // Overall quality metrics
    const overall = {
      yield: 98.2 + Math.random() * 0.5,
      defects: 0.8 + Math.random() * 0.3,
      customerComplaints: Math.floor(Math.random() * 3),
      scrapRate: 1.2 + Math.random() * 0.4,
      reworkRate: 0.5 + Math.random() * 0.2,
      compliance: 99.5 + Math.random() * 0.3
    };

    // Defects analysis
    const defects = [
      { type: 'Surface Crack', count: 15, severity: 'medium', category: 'Surface' },
      { type: 'Gas Bubble', count: 8, severity: 'low', category: 'Internal' },
      { type: 'Non-metallic Inclusion', count: 22, severity: 'high', category: 'Inclusion' },
      { type: 'Crack', count: 5, severity: 'critical', category: 'Crack' },
      { type: 'Porosity', count: 12, severity: 'medium', category: 'Internal' },
      { type: 'Edge Burn', count: 7, severity: 'low', category: 'Edge' }
    ];

    // Chemical analysis for selected grade
    const chemicalAnalysis = {
      C: getRandomInRange(0.17, 0.22, 0.01),
      Si: getRandomInRange(0.15, 0.35, 0.01),
      Mn: getRandomInRange(0.40, 0.70, 0.01),
      P: getRandomInRange(0.025, 0.035, 0.001),
      S: getRandomInRange(0.025, 0.035, 0.001),
      Cr: getRandomInRange(0.00, 0.10, 0.01),
      Ni: getRandomInRange(0.00, 0.10, 0.01),
      Cu: getRandomInRange(0.00, 0.10, 0.01)
    };

    // Physical properties
    const physicalProperties = {
      tensileStrength: getRandomInRange(370, 410, 1),
      yieldStrength: getRandomInRange(235, 255, 1),
      elongation: getRandomInRange(25, 30, 0.1),
      hardness: getRandomInRange(130, 160, 1),
      impactEnergy: getRandomInRange(40, 60, 1)
    };

    // Quality trends
    const trends = grades.map(grade => ({
      grade,
      yield: 95 + Math.random() * 4,
      defects: 0.5 + Math.random() * 1.5,
      customerScore: 8 + Math.random() * 2,
      compliance: 98 + Math.random() * 2,
      timestamp: new Date().getTime() - Math.random() * 86400000
    }));

    return {
      overall,
      defects,
      chemicalAnalysis,
      physicalProperties,
      trends
    };
  };

  const getRandomInRange = (min, max, step) => {
    const steps = Math.floor((max - min) / step);
    return min + (Math.floor(Math.random() * steps) * step);
  };

  // Initialize and update data
  useEffect(() => {
    const data = generateMockData();
    setQualityData(data);

    const interval = setInterval(() => {
      const newData = generateMockData();
      setQualityData(prev => ({
        ...prev,
        overall: newData.overall,
        chemicalAnalysis: newData.chemicalAnalysis,
        physicalProperties: newData.physicalProperties
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedGrade]);

  // Radar chart data for quality parameters
  const radarData = [
    { parameter: 'Tensile Strength', value: qualityData.physicalProperties?.tensileStrength || 0, max: 500 },
    { parameter: 'Yield Strength', value: qualityData.physicalProperties?.yieldStrength || 0, max: 300 },
    { parameter: 'Elongation', value: qualityData.physicalProperties?.elongation || 0, max: 35 },
    { parameter: 'Hardness', value: qualityData.physicalProperties?.hardness || 0, max: 200 },
    { parameter: 'Impact Energy', value: qualityData.physicalProperties?.impactEnergy || 0, max: 80 },
    { parameter: 'Yield Rate', value: qualityData.overall?.yield || 0, max: 100 },
    { parameter: 'Defect Rate', value: (100 - (qualityData.overall?.defects || 0) * 10), max: 100 }
  ];

  // Scatter plot data for defect correlation
  const defectScatterData = qualityData.defects.map(defect => ({
    x: defect.count,
    y: defect.severity === 'critical' ? 4 : defect.severity === 'high' ? 3 : defect.severity === 'medium' ? 2 : 1,
    z: defect.severity === 'critical' ? 800 : defect.severity === 'high' ? 400 : defect.severity === 'medium' ? 200 : 100,
    type: defect.type,
    category: defect.category
  }));

  // Calculate defect statistics
  const defectStats = {
    total: qualityData.defects.reduce((sum, defect) => sum + defect.count, 0),
    bySeverity: {
      critical: qualityData.defects.filter(d => d.severity === 'critical').reduce((sum, d) => sum + d.count, 0),
      high: qualityData.defects.filter(d => d.severity === 'high').reduce((sum, d) => sum + d.count, 0),
      medium: qualityData.defects.filter(d => d.severity === 'medium').reduce((sum, d) => sum + d.count, 0),
      low: qualityData.defects.filter(d => d.severity === 'low').reduce((sum, d) => sum + d.count, 0)
    },
    byCategory: qualityData.defects.reduce((acc, defect) => {
      acc[defect.category] = (acc[defect.category] || 0) + defect.count;
      return acc;
    }, {})
  };

  // Get current grade specification
  const currentGrade = steelGrades.find(g => g.id === selectedGrade);

  // Custom tooltip for radar chart
  const RadarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip radar-tooltip">
          <p className="tooltip-label">{data.parameter}</p>
          <p className="tooltip-value">
            {data.value.toFixed(1)} / {data.max}
          </p>
          <p className="tooltip-percentage">
            {(data.value / data.max * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for scatter chart
  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const severityText = data.y === 4 ? 'Critical' : data.y === 3 ? 'High' : data.y === 2 ? 'Medium' : 'Low';
      return (
        <div className="custom-tooltip scatter-tooltip">
          <p className="tooltip-label">{data.type}</p>
          <p className="tooltip-info">Count: {data.x}</p>
          <p className="tooltip-info">Severity: {severityText}</p>
          <p className="tooltip-info">Category: {data.category}</p>
        </div>
      );
    }
    return null;
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  // Get status badge
  const getStatusBadge = (value, min, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 95) return { text: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (percentage >= 90) return { text: 'Good', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    if (percentage >= 85) return { text: 'Average', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { text: 'Needs Improvement', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  // Element names mapping
  const getElementName = (element) => {
    const names = {
      'C': 'Carbon',
      'Si': 'Silicon',
      'Mn': 'Manganese',
      'P': 'Phosphorus',
      'S': 'Sulfur',
      'Cr': 'Chromium',
      'Ni': 'Nickel',
      'Cu': 'Copper'
    };
    return names[element] || element;
  };

  // Severity text mapping
  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return severity;
    }
  };

  // Status text mapping
  const getStatusText = (status) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'planned': return 'Planned';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="dashboard-card" dir="ltr">
      <div className="card-header">
        <div className="header-left" style={{minWidth:"100%"}}>
          <h3 className="card-title">
            <i className="fas fa-award"></i>
            Quality Metrics & Metallurgical Analysis
          </h3>
          <div className="grade-info">
            <span className="grade-label">Selected Grade:</span>
            <span className="grade-name">{currentGrade?.name}</span>
            <span className="grade-standard">{currentGrade?.standard}</span>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Overall Quality Metrics */}
        <div className="quality-overview">
          <h4 className="section-title">
            <i className="fas fa-chart-line"></i>
            Quality Summary
          </h4>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-header">
                <div className="overview-icon primary">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="overview-info">
                  <div className="overview-value">
                    {qualityData.overall?.yield?.toFixed(1) || '0.0'}
                    <span className="overview-unit">%</span>
                  </div>
                  <div className="overview-label">Yield Rate</div>
                </div>
              </div>
              <div className="overview-status">
                <span className="status-badge" style={getStatusBadge(qualityData.overall?.yield || 0, 0, 100)}>
                  {getStatusBadge(qualityData.overall?.yield || 0, 0, 100).text}
                </span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-header">
                <div className="overview-icon danger">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="overview-info">
                  <div className="overview-value">
                    {qualityData.overall?.defects?.toFixed(2) || '0.00'}
                    <span className="overview-unit">%</span>
                  </div>
                  <div className="overview-label">Avg Defects</div>
                </div>
              </div>
              <div className="overview-trend">
                <i className="fas fa-arrow-down trend-down"></i>
                <span className="trend-value">0.2% decrease</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-header">
                <div className="overview-icon success">
                  <i className="fas fa-recycle"></i>
                </div>
                <div className="overview-info">
                  <div className="overview-value">
                    {qualityData.overall?.scrapRate?.toFixed(1) || '0.0'}
                    <span className="overview-unit">%</span>
                  </div>
                  <div className="overview-label">Scrap Rate</div>
                </div>
              </div>
              <div className="overview-target">
                <span className="target-label">Target:</span>
                <span className="target-value">1.0%</span>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-header">
                <div className="overview-icon warning">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="overview-info">
                  <div className="overview-value">
                    {qualityData.overall?.customerComplaints || 0}
                  </div>
                  <div className="overview-label">Customer Complaints</div>
                </div>
              </div>
              <div className="overview-comparison">
                <span className="comparison-label">Last Month:</span>
                <span className="comparison-value">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chemical Analysis */}
        <div className="chemical-analysis">
          <h4 className="section-title">
            <i className="fas fa-flask"></i>
            Chemical Analysis
          </h4>
          <div className="analysis-grid">
            {Object.entries(qualityData.chemicalAnalysis || {}).map(([element, value]) => (
              <div key={element} className="element-card">
                <div className="element-symbol">{element}</div>
                <div className="element-name">{getElementName(element)}</div>
                <div className="element-value">
                  {typeof value === 'number' ? value.toFixed(3) : value}
                  <span className="element-unit">%</span>
                </div>
                <div className="element-range">
                  <div className="range-bar">
                    <div
                      className="range-fill"
                      style={{
                        width: `${(value / 0.5) * 100}%`,
                        backgroundColor: value > 0.35 ? '#ef4444' : value > 0.25 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="range-labels">
                    <span>0</span>
                    <span>0.5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Radar Chart */}
        <div className="quality-charts">
          <div className="radar-chart-container">
            <h4 className="chart-title">
              <i className="fas fa-bullseye"></i>
              Quality Radar
            </h4>
            <div className="radar-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis
                    dataKey="parameter"
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="#94a3b8"
                  />
                  <Radar
                    name="Quality"
                    dataKey="value"
                    stroke="#4fc3f7"
                    fill="#4fc3f7"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="defect-analysis">
            <h4 className="chart-title">
              <i className="fas fa-bug"></i>
              Defect Analysis
            </h4>
            <div className="defect-stats">
              <div className="defect-summary">
                <div className="defect-total">
                  <div className="total-label">Total Defects</div>
                  <div className="total-value">{defectStats.total}</div>
                </div>
                <div className="severity-breakdown">
                  {Object.entries(defectStats.bySeverity).map(([severity, count]) => (
                    <div key={severity} className="severity-item">
                      <span
                        className="severity-dot"
                        style={{ backgroundColor: getSeverityColor(severity) }}
                      ></span>
                      <span className="severity-name">{getSeverityText(severity)}</span>
                      <span className="severity-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="defect-scatter">
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Count"
                      stroke="#94a3b8"
                      fontSize={12}
                      label={{ value: 'Count', position: 'bottom', offset: 0 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Severity"
                      stroke="#94a3b8"
                      fontSize={12}
                      domain={[0.5, 4.5]}
                      ticks={[1, 2, 3, 4]}
                      tickFormatter={(value) =>
                        value === 4 ? 'Critical' :
                        value === 3 ? 'High' :
                        value === 2 ? 'Medium' : 'Low'
                      }
                      label={{ value: 'Severity', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 300]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
                    <Scatter
                      name="Defects"
                      data={defectScatterData}
                      fill="#8884d8"
                      shape="circle"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Defects List */}
        <div className="defects-list">
          <h4 className="section-title">
            <i className="fas fa-list"></i>
            Identified Defects List
          </h4>
          <div className="defects-table">
            <div className="table-header">
              <div className="col-type">Defect Type</div>
              <div className="col-category">Category</div>
              <div className="col-count">Count</div>
              <div className="col-severity">Severity</div>
              <div className="col-action">Action</div>
            </div>
            <div className="table-body">
              {qualityData.defects?.map((defect, index) => (
                <div key={index} className="table-row">
                  <div className="col-type">
                    <i className="fas fa-exclamation-circle"></i>
                    {defect.type}
                  </div>
                  <div className="col-category">
                    <span className="category-badge">{defect.category}</span>
                  </div>
                  <div className="col-count">
                    <span className="count-value">{defect.count}</span>
                  </div>
                  <div className="col-severity">
                    <span
                      className="severity-badge"
                      style={{
                        backgroundColor: getSeverityColor(defect.severity),
                        color: '#fff'
                      }}
                    >
                      {getSeverityText(defect.severity)}
                    </span>
                  </div>
                  <div className="col-action">
                    <button className="btn-action">
                      <i className="fas fa-search"></i>
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Improvement Actions */}
        <div className="improvement-actions">
          <h4 className="section-title">
            <i className="fas fa-tasks"></i>
            Quality Improvement Actions
          </h4>
          <div className="actions-grid">
            <div className="action-card">
              <div className="action-header">
                <div className="action-icon">
                  <i className="fas fa-temperature-high"></i>
                </div>
                <div className="action-title">Casting Temperature Control</div>
              </div>
              <div className="action-desc">
                Adjust casting temperature to reduce surface defects
              </div>
              <div className="action-status">
                <span className="status-badge in-progress">In Progress</span>
                <span className="status-progress">75%</span>
              </div>
            </div>

            <div className="action-card">
              <div className="action-header">
                <div className="action-icon">
                  <i className="fas fa-wind"></i>
                </div>
                <div className="action-title">Degassing System Improvement</div>
              </div>
              <div className="action-desc">
                Reduce gas bubbles by optimizing degassing process
              </div>
              <div className="action-status">
                <span className="status-badge planned">Planned</span>
                <span className="status-progress">0%</span>
              </div>
            </div>

            <div className="action-card">
              <div className="action-header">
                <div className="action-icon">
                  <i className="fas fa-filter"></i>
                </div>
                <div className="action-title">Better Melt Filtration</div>
              </div>
              <div className="action-desc">
                Install ceramic filters to reduce non-metallic inclusions
              </div>
              <div className="action-status">
                <span className="status-badge completed">Completed</span>
                <span className="status-progress">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityMetrics;