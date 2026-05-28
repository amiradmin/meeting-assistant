// src/components/dashboard/MaterialConsumption.jsx
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import './MaterialConsumption.css';

const MaterialConsumption = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [materialType, setMaterialType] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [materialData, setMaterialData] = useState({
    summary: {},
    consumption: [],
    inventory: [],
    costAnalysis: [],
    suppliers: [],
    trends: [],
    warnings: []
  });

  // Material categories
  const materialCategories = [
    { id: 'all', name: 'All Materials', icon: 'fas fa-boxes' },
    { id: 'scrap', name: 'Scrap', icon: 'fas fa-recycle' },
    { id: 'alloys', name: 'Alloys', icon: 'fas fa-atom' },
    { id: 'fluxes', name: 'Fluxes', icon: 'fas fa-vial' },
    { id: 'refractories', name: 'Refractories', icon: 'fas fa-fire' },
    { id: 'gases', name: 'Gases', icon: 'fas fa-wind' },
    { id: 'electrodes', name: 'Electrodes', icon: 'fas fa-bolt' }
  ];

  // Production units
  const productionUnits = [
    { id: 'all', name: 'All Units', icon: 'fas fa-industry' },
    { id: 'eaf', name: 'EAF', icon: 'fas fa-fire' },
    { id: 'lf', name: 'LF', icon: 'fas fa-flask' },
    { id: 'ccm', name: 'CCM', icon: 'fas fa-stream' },
    { id: 'rmh', name: 'RMH', icon: 'fas fa-exchange-alt' }
  ];

  // Generate mock material data
  const generateMaterialData = () => {
    // Materials database
    const materials = [
      { id: 1, name: 'Heavy Scrap', category: 'scrap', unit: 'tons', avgCost: 450, density: 7.8 },
      { id: 2, name: 'Light Scrap', category: 'scrap', unit: 'tons', avgCost: 380, density: 7.2 },
      { id: 3, name: 'Ferro Silicon', category: 'alloys', unit: 'kg', avgCost: 3.2, density: 2.8 },
      { id: 4, name: 'Ferro Manganese', category: 'alloys', unit: 'kg', avgCost: 2.8, density: 7.3 },
      { id: 5, name: 'Silico Manganese', category: 'alloys', unit: 'kg', avgCost: 3.5, density: 6.3 },
      { id: 6, name: 'Lime', category: 'fluxes', unit: 'kg', avgCost: 0.15, density: 2.7 },
      { id: 7, name: 'Dolomite', category: 'fluxes', unit: 'kg', avgCost: 0.18, density: 2.8 },
      { id: 8, name: 'Fluorspar', category: 'fluxes', unit: 'kg', avgCost: 0.25, density: 3.2 },
      { id: 9, name: 'Oxygen', category: 'gases', unit: 'm³', avgCost: 0.08, density: 1.43 },
      { id: 10, name: 'Argon', category: 'gases', unit: 'm³', avgCost: 0.12, density: 1.78 },
      { id: 11, name: 'Graphite Electrode', category: 'electrodes', unit: 'kg', avgCost: 8.5, density: 1.8 },
      { id: 12, name: 'Refractory Brick', category: 'refractories', unit: 'kg', avgCost: 1.2, density: 2.9 }
    ];

    // Generate consumption data
    const consumption = materials.map(material => {
      const baseAmount = material.category === 'scrap' ?
        Math.random() * 500 + 1000 :
        material.category === 'gases' ?
          Math.random() * 50000 + 100000 :
          Math.random() * 10000 + 5000;

      const todayConsumption = baseAmount * (0.8 + Math.random() * 0.4);
      const targetConsumption = baseAmount;
      const efficiency = (targetConsumption / todayConsumption) * 100;

      return {
        ...material,
        today: Math.round(todayConsumption),
        target: Math.round(targetConsumption),
        variance: Math.round((todayConsumption - targetConsumption) / targetConsumption * 1000) / 10,
        efficiency: Math.round(efficiency * 10) / 10,
        cost: Math.round(todayConsumption * material.avgCost),
        unit: material.unit
      };
    });

    // Generate inventory data
    const inventory = materials.map(material => {
      const current = Math.random() * 500 + 100;
      const min = 50;
      const max = 600;
      const daysRemaining = Math.round((current / (material.avgCost > 5 ? 100 : 1000)) * 10);

      return {
        id: material.id,
        name: material.name,
        category: material.category,
        current: Math.round(current),
        min: Math.round(min),
        max: Math.round(max),
        reorderLevel: Math.round(min * 1.5),
        daysRemaining: daysRemaining,
        status: current < min * 1.2 ? 'critical' :
                current < min * 1.5 ? 'warning' :
                current > max * 0.8 ? 'high' : 'normal'
      };
    });

    // Cost analysis by category
    const costAnalysis = [
      { category: 'Scrap', amount: 1250000, percentage: 62, color: '#ef4444' },
      { category: 'Alloys', amount: 450000, percentage: 22, color: '#f59e0b' },
      { category: 'Fluxes', amount: 150000, percentage: 7.5, color: '#10b981' },
      { category: 'Gases', amount: 85000, percentage: 4.2, color: '#3b82f6' },
      { category: 'Electrodes', amount: 65000, percentage: 3.2, color: '#8b5cf6' },
      { category: 'Refractories', amount: 40000, percentage: 2, color: '#06b6d4' }
    ];

    // Supplier performance
    const suppliers = [
      { name: 'TaminAhan', material: 'Heavy Scrap', rating: 4.8, delivery: 95, quality: 97, cost: 4.2 },
      { name: 'ParsAlloy', material: 'Ferro Manganese', rating: 4.6, delivery: 92, quality: 96, cost: 4.5 },
      { name: 'Chemical Industries', material: 'Lime', rating: 4.4, delivery: 98, quality: 94, cost: 3.8 },
      { name: 'Industrial Gas', material: 'Oxygen', rating: 4.7, delivery: 96, quality: 98, cost: 4.0 },
      { name: 'Electrode Iran', material: 'Electrode', rating: 4.5, delivery: 90, quality: 95, cost: 4.3 }
    ];

    // Consumption trends
    const trends = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
      return {
        hour: hour.toLocaleTimeString([], { hour: '2-digit' }),
        scrap: Math.random() * 100 + 50,
        alloys: Math.random() * 20 + 10,
        fluxes: Math.random() * 15 + 5,
        gases: Math.random() * 5000 + 2000,
        cost: Math.random() * 10000 + 50000
      };
    });

    // Low inventory warnings
    const warnings = inventory
      .filter(item => item.status === 'critical' || item.status === 'warning')
      .map(item => ({
        material: item.name,
        current: item.current,
        min: item.min,
        status: item.status,
        daysRemaining: item.daysRemaining,
        action: item.status === 'critical' ? 'Urgent Order' : 'Review Need'
      }));

    // Calculate summary
    const totalCost = consumption.reduce((sum, item) => sum + item.cost, 0);
    const totalConsumption = consumption.reduce((sum, item) => sum + item.today, 0);
    const avgEfficiency = consumption.reduce((sum, item) => sum + item.efficiency, 0) / consumption.length;
    const criticalItems = inventory.filter(item => item.status === 'critical').length;

    return {
      summary: {
        totalCost: Math.round(totalCost),
        totalConsumption: Math.round(totalConsumption),
        avgEfficiency: Math.round(avgEfficiency * 10) / 10,
        criticalItems: criticalItems,
        costPerTon: Math.round(totalCost / 1250)
      },
      consumption: consumption,
      inventory: inventory,
      costAnalysis: costAnalysis,
      suppliers: suppliers,
      trends: trends,
      warnings: warnings
    };
  };

  // Initialize data
  useEffect(() => {
    const data = generateMaterialData();
    setMaterialData(data);

    const interval = setInterval(() => {
      const newData = generateMaterialData();
      setMaterialData(prev => ({
        ...prev,
        summary: newData.summary,
        trends: newData.trends,
        warnings: newData.warnings
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter materials based on selections
  const filteredConsumption = materialData.consumption.filter(item => {
    if (materialType !== 'all' && item.category !== materialType) return false;
    return true;
  });

  const filteredInventory = materialData.inventory.filter(item => {
    if (materialType !== 'all' && item.category !== materialType) return false;
    return true;
  });

  // Custom tooltips
  const ConsumptionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip consumption-tooltip">
          <p className="tooltip-material">{data.name}</p>
          <p className="tooltip-consumption">
            Today's Consumption: <strong>{data.today.toLocaleString()} {data.unit}</strong>
          </p>
          <p className="tooltip-target">
            Target: <strong>{data.target.toLocaleString()} {data.unit}</strong>
          </p>
          <p className="tooltip-variance">
            Variance: <strong style={{ color: data.variance < 0 ? '#10b981' : '#ef4444' }}>
              {data.variance > 0 ? '+' : ''}{data.variance}%
            </strong>
          </p>
          <p className="tooltip-cost">
            Cost: <strong>{data.cost.toLocaleString()} thousand USD</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const InventoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip inventory-tooltip">
          <p className="tooltip-material">{data.name}</p>
          <p className="tooltip-stock">
            Stock: <strong>{data.current} {data.unit}</strong>
          </p>
          <p className="tooltip-min">
            Minimum: <strong>{data.min}</strong>
          </p>
          <p className="tooltip-max">
            Maximum: <strong>{data.max}</strong>
          </p>
          <p className="tooltip-days">
            Days Remaining: <strong>{data.daysRemaining}</strong>
          </p>
          <p className="tooltip-status">
            Status: <strong style={{
              color: data.status === 'critical' ? '#ef4444' :
                     data.status === 'warning' ? '#f59e0b' : '#10b981'
            }}>
              {data.status === 'critical' ? 'Critical' :
               data.status === 'warning' ? 'Attention Needed' : 'Normal'}
            </strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const CostTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip cost-tooltip">
          <p className="tooltip-category">{data.category}</p>
          <p className="tooltip-amount">
            Amount: <strong>{data.amount.toLocaleString()} thousand USD</strong>
          </p>
          <p className="tooltip-percentage">
            Percentage: <strong>{data.percentage}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'critical':
        return { text: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'warning':
        return { text: 'Attention', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'high':
        return { text: 'High', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      default:
        return { text: 'Normal', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = materialCategories.find(c => c.id === category);
    return cat ? cat.icon : 'fas fa-box';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      scrap: '#ef4444',
      alloys: '#f59e0b',
      fluxes: '#10b981',
      gases: '#3b82f6',
      electrodes: '#8b5cf6',
      refractories: '#06b6d4'
    };
    return colors[category] || '#94a3b8';
  };

  // Calculate reorder suggestions
  const reorderSuggestions = materialData.inventory
    .filter(item => item.status === 'critical' || item.status === 'warning')
    .map(item => ({
      ...item,
      suggestedOrder: Math.max(item.max - item.current, item.min * 2),
      urgency: item.status === 'critical' ? 'Urgent' : 'Normal'
    }));

  return (
    <div className="dashboard-card" dir="ltr">
      <div className="card-header">
        <div className="header-left">
          <h3 className="card-title">
            <i className="fas fa-boxes"></i>
            Material Consumption & Inventory Management
          </h3>
          <div className="header-summary">
            <div className="summary-item">
              <i className="fas fa-money-bill-wave"></i>
              <span className="summary-value">
                {materialData.summary.totalCost?.toLocaleString() || 0}
                <span className="summary-unit"> thousand USD</span>
              </span>
              <span className="summary-label">Today's Material Cost</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-weight-hanging"></i>
              <span className="summary-value">
                {materialData.summary.totalConsumption?.toLocaleString() || 0}
                <span className="summary-unit"> tons</span>
              </span>
              <span className="summary-label">Total Consumption</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-percentage"></i>
              <span className="summary-value">
                {materialData.summary.avgEfficiency || 0}
                <span className="summary-unit"> %</span>
              </span>
              <span className="summary-label">Average Efficiency</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Material Consumption Overview */}
        <div className="consumption-overview">
          <h4 className="section-title">
            <i className="fas fa-chart-bar"></i>
            Material Consumption by Type
          </h4>
          <div className="consumption-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredConsumption.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  label={{ value: 'Consumption', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                />
                <Tooltip content={<ConsumptionTooltip />} />
                <Legend />
                <Bar
                  dataKey="today"
                  name="Today's Consumption"
                  fill="#4fc3f7"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="target"
                  name="Target"
                  fill="#475569"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

 {/* Cost Analysis */}
<div className="cost-analysis-section">
  <div className="cost-analysis">
    <h4 className="section-title">
      <i className="fas fa-pie-chart"></i>
      Material Cost Analysis
    </h4>
    <div className="pie-chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={materialData.costAnalysis}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percentage }) => `${category}: ${percentage}%`}
            outerRadius={71}
            fill="#8884d8"
            dataKey="percentage"
          >
            {materialData.costAnalysis.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CostTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="cost-breakdown">
      {materialData.costAnalysis.map((item, index) => (
        <div key={index} className="breakdown-item">
          <div className="breakdown-header">
            <span className="breakdown-dot" style={{ backgroundColor: item.color }}></span>
            <span className="breakdown-category">{item.category}</span>
            <span className="breakdown-percentage">{item.percentage}%</span>
          </div>
          <div className="breakdown-amount">
            {item.amount.toLocaleString()} thousand USD
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Inventory Status */}
<div className="inventory-status-section">
  <div className="inventory-status">
    <h4 className="section-title">
      <i className="fas fa-warehouse"></i>
      Inventory Status
    </h4>
    <div className="inventory-list">
      {filteredInventory.slice(0, 6).map((item, index) => (
        <div key={index} className="inventory-item">
          <div className="inventory-header">
            <div className="material-info">
              <i className={getCategoryIcon(item.category)}></i>
              <span className="material-name">{item.name}</span>
            </div>
            <div className="inventory-status-badge" style={getStatusBadge(item.status)}>
              {getStatusBadge(item.status).text}
            </div>
          </div>

          <div className="inventory-level">
            <div className="level-bar">
              <div
                className="level-fill"
                style={{
                  width: `${(item.current / item.max) * 100}%`,
                  backgroundColor: getCategoryColor(item.category)
                }}
              ></div>
            </div>
            <div className="level-labels">
              <span className="level-min">{item.min}</span>
              <span className="level-current">{item.current}</span>
              <span className="level-max">{item.max}</span>
            </div>
          </div>

          <div className="inventory-details">
            <div className="detail-item">
              <i className="fas fa-clock"></i>
              <span className="detail-label">Days Remaining:</span>
              <span className="detail-value">{item.daysRemaining}</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-exclamation-triangle"></i>
              <span className="detail-label">Reorder Level:</span>
              <span className="detail-value">{item.reorderLevel}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

        {/* Consumption Trends */}
        <div className="consumption-trends">
          <h4 className="section-title">
            <i className="fas fa-chart-line"></i>
            Hourly Consumption Trend
          </h4>
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={materialData.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} interval={3} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  label={{ value: 'Consumption (tons)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="scrap"
                  name="Scrap"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="alloys"
                  name="Alloys"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="fluxes"
                  name="Fluxes"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
{/* Supplier Performance */}
<div className="supplier-performance-section">
  <div className="supplier-performance">
    <div className="supplier-header-section">
      <h4 className="section-title">
        <i className="fas fa-star"></i>
        Supplier Performance
      </h4>
      <div className="supplier-stats">
        <div className="supplier-stat">
          <span className="stat-label">Active Suppliers</span>
          <span className="stat-number">{materialData.suppliers.length}</span>
        </div>
        <div className="supplier-stat">
          <span className="stat-label">Avg Rating</span>
          <span className="stat-number">
            {(materialData.suppliers.reduce((sum, s) => sum + s.rating, 0) / materialData.suppliers.length).toFixed(1)}
          </span>
        </div>
      </div>
    </div>

    <div className="supplier-scroll-container">
      <div className="supplier-grid">
        {materialData.suppliers.map((supplier, index) => (
          <div key={index} className="supplier-card">
            <div className="supplier-card-header">
              <div className="supplier-avatar">
                <i className="fas fa-building"></i>
              </div>
              <div className="supplier-info">
                <div className="supplier-name">{supplier.name}</div>
                <div className="supplier-material">
                  <i className="fas fa-box"></i>
                  {supplier.material}
                </div>
              </div>
              <div className="supplier-rating-badge">
                <i className="fas fa-star"></i>
                {supplier.rating.toFixed(1)}
              </div>
            </div>

            <div className="supplier-metrics">
              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Delivery Performance</span>
                  <span className="metric-value">{supplier.delivery}%</span>
                </div>
                <div className="metric-bar-container">
                  <div className="metric-bar">
                    <div
                      className="bar-fill delivery"
                      style={{ width: `${supplier.delivery}%` }}
                    ></div>
                  </div>
                  <span className="metric-status">
                    {supplier.delivery >= 95 ? 'Excellent' : supplier.delivery >= 90 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Quality Score</span>
                  <span className="metric-value">{supplier.quality}%</span>
                </div>
                <div className="metric-bar-container">
                  <div className="metric-bar">
                    <div
                      className="bar-fill quality"
                      style={{ width: `${supplier.quality}%` }}
                    ></div>
                  </div>
                  <span className="metric-status">
                    {supplier.quality >= 95 ? 'Excellent' : supplier.quality >= 90 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              <div className="metric-item">
                <div className="metric-header">
                  <span className="metric-label">Price Competitiveness</span>
                  <span className="metric-value">{supplier.cost.toFixed(1)}/5</span>
                </div>
                <div className="metric-bar-container">
                  <div className="metric-bar">
                    <div
                      className="bar-fill cost"
                      style={{ width: `${supplier.cost * 20}%` }}
                    ></div>
                  </div>
                  <span className="metric-status">
                    {supplier.cost >= 4.5 ? 'Premium' : supplier.cost >= 4 ? 'Competitive' : 'Economy'}
                  </span>
                </div>
              </div>
            </div>

            <div className="supplier-footer">
              <button className="supplier-btn primary">
                <i className="fas fa-chart-line"></i>
                View Details
              </button>
              <button className="supplier-btn secondary">
                <i className="fas fa-envelope"></i>
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

        {/* Efficiency & Cost Metrics */}
        <div className="efficiency-metrics">
          <h4 className="section-title">
            <i className="fas fa-chart-pie"></i>
            Key Metrics
          </h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="metric-content">
                <div className="metric-value">
                  {materialData.summary.costPerTon?.toLocaleString() || 0}
                  <span className="metric-unit"> USD/ton</span>
                </div>
                <div className="metric-label">Material Cost per Ton</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-recycle"></i>
              </div>
              <div className="metric-content">
                <div className="metric-value">
                  {Math.round(
                    (materialData.consumption
                      .filter(item => item.category === 'scrap')
                      .reduce((sum, item) => sum + item.efficiency, 0) / 2) || 0
                  )}
                  <span className="metric-unit"> %</span>
                </div>
                <div className="metric-label">Scrap Efficiency</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="metric-content">
                <div className="metric-value">
                  {materialData.summary.criticalItems || 0}
                </div>
                <div className="metric-label">Critical Stock Items</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="metric-content">
                <div className="metric-value">
                  {materialData.consumption.length > 0 ?
                    Math.round(materialData.consumption.filter(item => item.variance < 0).length /
                    materialData.consumption.length * 100) : 0}
                  <span className="metric-unit"> %</span>
                </div>
                <div className="metric-label">Below Target Materials</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialConsumption;