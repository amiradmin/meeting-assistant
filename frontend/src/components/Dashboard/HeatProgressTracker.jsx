// src/components/dashboard/HeatProgressTracker.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts';
import './HeatProgressTracker.css';

const HeatProgressTracker = () => {
  const navigate = useNavigate();
  const [selectedHeat, setSelectedHeat] = useState(null);
  const [timeFilter, setTimeFilter] = useState('active');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [heatList, setHeatList] = useState([]);
  const [heatDetails, setHeatDetails] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [productionTrend, setProductionTrend] = useState([]);

  // Heat status definitions
  const heatStatuses = {
    scheduled: { name: 'Scheduled', color: '#94a3b8', icon: 'fas fa-calendar' },
    charging: { name: 'Charging', color: '#f59e0b', icon: 'fas fa-truck-loading' },
    melting: { name: 'Melting', color: '#ef4444', icon: 'fas fa-fire' },
    refining: { name: 'Refining', color: '#3b82f6', icon: 'fas fa-flask' },
    tapping: { name: 'Tapping', color: '#8b5cf6', icon: 'fas fa-faucet' },
    casting: { name: 'Casting', color: '#10b981', icon: 'fas fa-stream' },
    completed: { name: 'Completed', color: '#10b981', icon: 'fas fa-check-circle' },
    delayed: { name: 'Delayed', color: '#ef4444', icon: 'fas fa-clock' }
  };

  // Departments involved in heat process
  const departments = [
    { id: 'all', name: 'All Departments', icon: 'fas fa-industry' },
    { id: 'scrap', name: 'Scrap Preparation', icon: 'fas fa-recycle' },
    { id: 'eaf', name: 'Electric Arc Furnace', icon: 'fas fa-fire' },
    { id: 'lf', name: 'Ladle Furnace', icon: 'fas fa-flask' },
    { id: 'ccm', name: 'Continuous Casting', icon: 'fas fa-stream' },
    { id: 'lab', name: 'Laboratory', icon: 'fas fa-vial' },
    { id: 'qc', name: 'Quality Control', icon: 'fas fa-award' }
  ];

  // Generate mock heat data
  const generateMockHeats = () => {
    const heats = [];
    const statusSequence = ['scheduled', 'charging', 'melting', 'refining', 'tapping', 'casting', 'completed'];

    // Generate past heats
    for (let i = 1; i <= 15; i++) {
      const statusIndex = Math.min(Math.floor(Math.random() * 8), 6);
      const heat = {
        id: `H240115-${String(i).padStart(3, '0')}`,
        steelGrade: ['ST37', 'ST52', 'A36', 'A572'][Math.floor(Math.random() * 4)],
        weight: Math.round(120 + Math.random() * 30),
        status: statusSequence[statusIndex],
        startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        endTime: statusSequence[statusIndex] === 'completed' ?
          new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) : null,
        duration: Math.round(90 + Math.random() * 60),
        energy: Math.round(350 + Math.random() * 150),
        department: ['eaf', 'lf', 'ccm'][Math.floor(Math.random() * 3)],
        quality: Math.round(90 + Math.random() * 9),
        progress: (statusIndex / 6) * 100,
        currentStep: statusSequence[statusIndex],
        steps: statusSequence.slice(0, statusIndex + 1).map((status, idx) => ({
          name: heatStatuses[status].name,
          status: status,
          time: new Date(Date.now() - (statusIndex - idx) * 20 * 60 * 1000),
          duration: Math.round(15 + Math.random() * 30)
        }))
      };
      heats.push(heat);
    }

    // Add current active heat
    const activeHeat = {
      id: 'H240115-016',
      steelGrade: 'ST52',
      weight: 135,
      status: 'melting',
      startTime: new Date(Date.now() - 45 * 60 * 1000),
      endTime: null,
      duration: 120,
      energy: 420,
      department: 'eaf',
      quality: 96,
      progress: 65,
      currentStep: 'melting',
      steps: [
        { name: 'Scheduled', status: 'scheduled', time: new Date(Date.now() - 65 * 60 * 1000), duration: 10 },
        { name: 'Charging', status: 'charging', time: new Date(Date.now() - 55 * 60 * 1000), duration: 15 },
        { name: 'Melting', status: 'melting', time: new Date(Date.now() - 40 * 60 * 1000), duration: 45, active: true }
      ],
      temperature: 1650,
      power: 85,
      carbon: 0.42,
      oxygen: 2850,
      tapPosition: 7,
      electrodePosition: 75
    };

    heats.unshift(activeHeat);
    return heats;
  };

  // Generate progress timeline data
  const generateProgressData = (heat) => {
    if (!heat) return [];

    const data = [];
    let currentTime = new Date(heat.startTime);

    heat.steps.forEach((step, index) => {
      const endTime = new Date(currentTime.getTime() + step.duration * 60 * 1000);

      data.push({
        time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: currentTime.getTime(),
        progress: (index / heat.steps.length) * 100,
        step: step.name,
        status: step.status,
        temperature: step.active ? heat.temperature : null,
        power: step.active ? heat.power : null
      });

      data.push({
        time: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: endTime.getTime(),
        progress: ((index + 1) / heat.steps.length) * 100,
        step: heat.steps[index + 1]?.name || 'Completed',
        status: heat.steps[index + 1]?.status || 'completed',
        temperature: heat.steps[index + 1]?.active ? heat.temperature : null,
        power: heat.steps[index + 1]?.active ? heat.power : null
      });

      currentTime = endTime;
    });

    return data;
  };

  // Generate production trend data
  const generateProductionTrend = () => {
    const trend = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      trend.push({
        hour: hour.toLocaleTimeString([], { hour: '2-digit' }),
        heats: Math.floor(Math.random() * 3) + 1,
        production: Math.round(120 + Math.random() * 60),
        energy: Math.round(350 + Math.random() * 200),
        efficiency: 90 + Math.random() * 8
      });
    }

    return trend;
  };

  // Initialize data
  useEffect(() => {
    const heats = generateMockHeats();
    setHeatList(heats);

    if (heats.length > 0) {
      const activeHeat = heats.find(h => h.status !== 'completed' && h.status !== 'delayed') || heats[0];
      setSelectedHeat(activeHeat.id);
      setHeatDetails(activeHeat);

      const progress = generateProgressData(activeHeat);
      setProgressData(progress);
    }

    const trend = generateProductionTrend();
    setProductionTrend(trend);

    // Auto-update active heat progress
    const interval = setInterval(() => {
      if (heatDetails && heatDetails.status !== 'completed') {
        setHeatDetails(prev => {
          if (!prev) return prev;

          const newProgress = Math.min(prev.progress + 0.5, 100);
          const newStatus = newProgress >= 100 ? 'completed' : prev.status;

          return {
            ...prev,
            progress: newProgress,
            status: newStatus,
            temperature: prev.temperature ? prev.temperature + (Math.random() - 0.5) * 10 : null,
            power: prev.power ? Math.max(70, Math.min(95, prev.power + (Math.random() - 0.5) * 5)) : null
          };
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Update heat details when selected heat changes
  useEffect(() => {
    if (selectedHeat) {
      const heat = heatList.find(h => h.id === selectedHeat);
      setHeatDetails(heat);

      if (heat) {
        const progress = generateProgressData(heat);
        setProgressData(progress);
      }
    }
  }, [selectedHeat, heatList]);

  // Filter heat list based on filters
  const filteredHeats = heatList.filter(heat => {
    if (timeFilter === 'active') {
      return heat.status !== 'completed' && heat.status !== 'delayed';
    } else if (timeFilter === 'completed') {
      return heat.status === 'completed';
    } else if (timeFilter === 'delayed') {
      return heat.status === 'delayed';
    }
    return true;
  }).filter(heat => {
    if (departmentFilter === 'all') return true;
    return heat.department === departmentFilter;
  });

  // Calculate statistics
  const stats = {
    totalHeats: heatList.length,
    activeHeats: heatList.filter(h => h.status !== 'completed' && h.status !== 'delayed').length,
    completedToday: heatList.filter(h =>
      h.status === 'completed' &&
      h.endTime &&
      new Date(h.endTime).toDateString() === new Date().toDateString()
    ).length,
    averageDuration: Math.round(
      heatList.filter(h => h.duration).reduce((sum, h) => sum + h.duration, 0) /
      heatList.filter(h => h.duration).length
    ),
    totalProduction: heatList.filter(h => h.status === 'completed').reduce((sum, h) => sum + h.weight, 0),
    avgEnergyPerHeat: Math.round(
      heatList.filter(h => h.energy).reduce((sum, h) => sum + h.energy, 0) /
      heatList.filter(h => h.energy).length
    )
  };

  // Format time difference
  const formatTimeDiff = (start, end) => {
    if (!start) return '--:--';

    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diffMs = endTime - startTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')} hrs`;
    }
  };

  // Navigate to heat detail page
  const handleViewDetails = (heatId) => {
    navigate(`/management/heat-details/${heatId}`);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusInfo = heatStatuses[status] || heatStatuses.scheduled;
    return (
      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
        <i className={statusInfo.icon}></i>
        {statusInfo.name}
      </span>
    );
  };

  // Custom tooltip for progress chart
  const ProgressTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip progress-tooltip">
          <p className="tooltip-time">{label}</p>
          <p className="tooltip-step">{data.step}</p>
          <p className="tooltip-progress">
            Progress: <strong>{data.progress.toFixed(1)}%</strong>
          </p>
          {data.temperature && (
            <p className="tooltip-temperature">
              Temperature: <strong>{data.temperature}°C</strong>
            </p>
          )}
          {data.power && (
            <p className="tooltip-power">
              Power: <strong>{data.power}%</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for production trend
  const TrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip trend-tooltip">
          <p className="tooltip-hour">{label}</p>
          <p className="tooltip-item">
            <span className="tooltip-dot heats"></span>
            Heats: <strong>{payload[0].value}</strong>
          </p>
          <p className="tooltip-item">
            <span className="tooltip-dot production"></span>
            Production: <strong>{payload[1].value} tons</strong>
          </p>
          <p className="tooltip-item">
            <span className="tooltip-dot energy"></span>
            Energy: <strong>{payload[2].value} MWh</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-card" dir="ltr">
      <div className="card-header">
        <div className="header-left">
          <h3 className="card-title">
            <i className="fas fa-fire"></i>
            Heat Cycle Tracking
          </h3>
          <div className="header-stats">
            <div className="stat-item">
              <i className="fas fa-play-circle"></i>
              <span className="stat-value">{stats.activeHeats}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-check-circle"></i>
              <span className="stat-value">{stats.completedToday}</span>
              <span className="stat-label">Completed Today</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-weight-hanging"></i>
              <span className="stat-value">{stats.totalProduction}</span>
              <span className="stat-label">Today's Production (tons)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Current Heat Progress */}
        {heatDetails && (
          <div className="current-heat-section">
            <h4 className="section-title">
              <i className="fas fa-bolt"></i>
              Current Heat
              <span className="heat-id">{heatDetails.id}</span>
            </h4>

            <div className="current-heat">
              <div className="heat-info">
                <div className="info-row">
                  <div className="info-item">
                    <div className="info-label">Steel Grade</div>
                    <div className="info-value">{heatDetails.steelGrade}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Weight</div>
                    <div className="info-value">{heatDetails.weight} tons</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Duration</div>
                    <div className="info-value">{formatTimeDiff(heatDetails.startTime, heatDetails.endTime)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Status</div>
                    <div className="info-value">{getStatusBadge(heatDetails.status)}</div>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div className="progress-header">
                    <span className="progress-label">Overall Progress</span>
                    <span className="progress-value">{heatDetails.progress.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${heatDetails.progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    {Object.values(heatStatuses)
                      .filter(status => status.name !== 'Delayed' && status.name !== 'Scheduled')
                      .map((status, index) => (
                        <div
                          key={index}
                          className={`step-marker ${
                            heatDetails.progress >= (index / 6) * 100 ? 'completed' : ''
                          } ${heatDetails.currentStep === status.name ? 'current' : ''}`}
                          style={{ left: `${(index / 6) * 100}%` }}
                        >
                          <div className="step-dot"></div>
                          <div className="step-label">{status.name}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Real-time Parameters */}
                <div className="real-time-params">
                  <h5 className="params-title">
                    <i className="fas fa-chart-line"></i>
                    Real-time Parameters
                  </h5>
                  <div className="params-grid">
                    <div className="param-card">
                      <div className="param-icon temperature">
                        <i className="fas fa-thermometer-half"></i>
                      </div>
                      <div className="param-content">
                        <div className="param-value">
                          {heatDetails.temperature || '--'}
                          <span className="param-unit">°C</span>
                        </div>
                        <div className="param-label">Bath Temperature</div>
                      </div>
                    </div>

                    <div className="param-card">
                      <div className="param-icon power">
                        <i className="fas fa-bolt"></i>
                      </div>
                      <div className="param-content">
                        <div className="param-value">
                          {heatDetails.power || '--'}
                          <span className="param-unit">%</span>
                        </div>
                        <div className="param-label">Furnace Power</div>
                      </div>
                    </div>

                    <div className="param-card">
                      <div className="param-icon carbon">
                        <i className="fas fa-atom"></i>
                      </div>
                      <div className="param-content">
                        <div className="param-value">
                          {heatDetails.carbon || '--'}
                          <span className="param-unit">%</span>
                        </div>
                        <div className="param-label">Carbon Content</div>
                      </div>
                    </div>

                    <div className="param-card">
                      <div className="param-icon oxygen">
                        <i className="fas fa-wind"></i>
                      </div>
                      <div className="param-content">
                        <div className="param-value">
                          {heatDetails.oxygen ? heatDetails.oxygen.toLocaleString() : '--'}
                          <span className="param-unit">Nm³/h</span>
                        </div>
                        <div className="param-label">Oxygen Flow</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="heat-actions">
                <button className="btn-action primary">
                  <i className="fas fa-play"></i>
                  Continue Process
                </button>
                <button className="btn-action secondary">
                  <i className="fas fa-pause"></i>
                  Pause
                </button>
                <button
                  className="btn-action info"
                  onClick={() => handleViewDetails(heatDetails.id)}
                >
                  <i className="fas fa-info-circle"></i>
                  Full Details
                </button>
                <button className="btn-action warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Heat Progress Timeline */}
        <div className="progress-timeline">
          <h4 className="section-title">
            <i className="fas fa-stream"></i>
            Process Timeline
          </h4>
          <div className="timeline-chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                  domain={[0, 100]}
                />
                <Tooltip content={<ProgressTooltip />} />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#4fc3f7"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#4fc3f7', strokeWidth: 2, fill: '#0f172a' }}
                  activeDot={{ r: 6, stroke: '#4fc3f7', strokeWidth: 2, fill: '#0f172a' }}
                />
                {heatDetails?.steps.map((step, index) => (
                  <ReferenceLine
                    key={index}
                    x={new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    stroke={heatStatuses[step.status]?.color || '#94a3b8'}
                    strokeDasharray="3 3"
                    label={{
                      value: step.name,
                      position: 'insideTop',
                      fill: heatStatuses[step.status]?.color || '#94a3b8',
                      fontSize: 10
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heat List */}
        <div className="heat-list-section" style={{ minHeight: "850px" }}>
          <h4 className="section-title">
            <i className="fas fa-list"></i>
            Heat List
          </h4>
          <div className="heat-list" style={{ minHeight: "850px" }}>
            {filteredHeats.slice(0, 8).map(heat => (
              <div
                key={heat.id}
                className={`heat-item ${heat.id === selectedHeat ? 'selected' : ''}`}
                onClick={() => setSelectedHeat(heat.id)}
              >
                <div className="heat-header">
                  <div className="heat-id">{heat.id}</div>
                  <div className="heat-status">
                    {getStatusBadge(heat.status)}
                  </div>
                </div>

                <div className="heat-details">
                  <div className="detail-item">
                    <i className="fas fa-weight-hanging"></i>
                    <span className="detail-label">Weight:</span>
                    <span className="detail-value">{heat.weight} tons</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-cube"></i>
                    <span className="detail-label">Grade:</span>
                    <span className="detail-value">{heat.steelGrade}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{heat.duration} min</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-bolt"></i>
                    <span className="detail-label">Energy:</span>
                    <span className="detail-value">{heat.energy} MWh</span>
                  </div>
                </div>

                <div className="heat-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${heat.progress}%`,
                        backgroundColor: heatStatuses[heat.status]?.color || '#4fc3f7'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{heat.progress.toFixed(0)}%</div>
                </div>

                <div className="heat-actions">
                  <button
                    className="btn-action small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(heat.id);
                    }}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Trend */}
        <div className="production-trend">
          <h4 className="section-title">
            <i className="fas fa-chart-bar"></i>
            Hourly Production Trend
          </h4>
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={productionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} interval={3} />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={12}
                  label={{ value: 'Number of Heats', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={12}
                  label={{ value: 'Production (tons)', angle: 90, position: 'insideRight', style: { fill: '#94a3b8' } }}
                />
                <Tooltip content={<TrendTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="heats"
                  name="Number of Heats"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="production"
                  name="Production (tons)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="efficiency"
                  name="Efficiency (%)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-tachometer-alt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageDuration}</div>
              <div className="stat-label">Avg Heat Duration (min)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.avgEnergyPerHeat}</div>
              <div className="stat-label">Avg Energy per Heat (MWh)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-industry"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.totalProduction > 0 ? (stats.totalProduction / stats.completedToday).toFixed(1) : 0}
              </div>
              <div className="stat-label">Avg Production per Heat (tons)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-percentage"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.totalHeats > 0 ?
                  Math.round((stats.completedToday / stats.totalHeats) * 100) : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatProgressTracker;