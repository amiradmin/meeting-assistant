// src/components/LF/LFMonitoring.jsx
import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  FaChartLine,
  FaWeightHanging,
  FaThermometerHalf,
  FaBolt,
  FaWater,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFire,
  FaSnowflake,
  FaSkull,
  FaIndustry,
  FaSyncAlt
} from 'react-icons/fa';

const LFMonitoring = ({ lfData }) => {
  const { heatData, temperatures, analyses, currentPhase, phases, refreshData } = lfData;
  const [activeMetric, setActiveMetric] = useState('temperature');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const temperaturesArray = useMemo(() => {
    return Array.isArray(temperatures) ? temperatures : [];
  }, [temperatures]);

  const analysesArray = useMemo(() => {
    return Array.isArray(analyses) ? analyses : [];
  }, [analyses]);

  const phasesArray = useMemo(() => {
    return Array.isArray(phases) ? phases : [];
  }, [phases]);

  const chartData = useMemo(() => {
    if (temperaturesArray.length > 0) {
      return temperaturesArray.map((temp, idx) => {
        let timeLabel = '';
        if (temp.time) {
          timeLabel = temp.time;
        } else if (temp.measured_at) {
          const date = new Date(temp.measured_at);
          timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } else {
          timeLabel = `${idx + 1}`;
        }

        return {
          time: timeLabel,
          temperature: temp.temperature || 0,
          energy: temp.energy_supplied || temp.energySupplied || 0,
          oxygenActivity: temp.oxygen_activity || temp.oxygenActivity || null,
          phase: temp.phase || 'unknown',
          index: idx
        };
      });
    }
    return [];
  }, [temperaturesArray]);

  const currentPhaseObj = useMemo(() => {
    return phasesArray.find(p => p.id === currentPhase);
  }, [phasesArray, currentPhase]);

  const alarms = useMemo(() => {
    const alarmsList = [];
    const currentTemp = temperaturesArray[temperaturesArray.length - 1]?.temperature;

    if (currentTemp && heatData) {
      const maxTemp = heatData.temp_max || heatData.tempMax || 1620;
      const minTemp = heatData.temp_min || heatData.tempMin || 1580;

      if (currentTemp > maxTemp) {
        alarmsList.push({
          type: 'critical',
          icon: 'fire',
          message: `Temperature exceeds maximum limit! (${currentTemp}°C > ${maxTemp}°C)`
        });
      } else if (currentTemp < minTemp) {
        alarmsList.push({
          type: 'warning',
          icon: 'snowflake',
          message: `Temperature below minimum limit (${currentTemp}°C < ${minTemp}°C). Heating required.`
        });
      }
    }

    const latestAnalysis = analysesArray[analysesArray.length - 1]?.elements;
    if (latestAnalysis && latestAnalysis.S > 0.035) {
      alarmsList.push({
        type: 'warning',
        icon: 'skull',
        message: `Sulfur content high! (${latestAnalysis.S}% > 0.035%). Deslagging recommended.`
      });
    }

    if (latestAnalysis && latestAnalysis.P > 0.030) {
      alarmsList.push({
        type: 'warning',
        icon: 'alert',
        message: `Phosphorus content high! (${latestAnalysis.P}% > 0.030%). Check scrap quality.`
      });
    }

    return alarmsList;
  }, [temperaturesArray, analysesArray, heatData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const getAlarmIcon = (iconName) => {
    switch(iconName) {
      case 'fire': return <FaFire />;
      case 'snowflake': return <FaSnowflake />;
      case 'skull': return <FaSkull />;
      case 'alert': return <FaExclamationTriangle />;
      default: return <FaExclamationTriangle />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'var(--card-bg)',
          padding: '10px',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ margin: 0 }}><strong>Time:</strong> {label}</p>
          <p style={{ margin: 0 }}><strong>Temperature:</strong> {payload[0]?.value}°C</p>
          {payload[0]?.payload.oxygenActivity && (
            <p style={{ margin: 0 }}><strong>O₂:</strong> {payload[0].payload.oxygenActivity} ppm</p>
          )}
          <p style={{ margin: 0 }}><strong>Phase:</strong> {payload[0]?.payload.phase}</p>
        </div>
      );
    }
    return null;
  };

  const liquidWeight = heatData?.liquid_weight || heatData?.liquidWeight || 0;
  const heatingPower = heatData?.heating_power || heatData?.heatingPower || 0;
  const argonFlow = heatData?.argon_flow || heatData?.argonFlow || 0;
  const targetTemp = heatData?.temp_target || heatData?.targetTemp || 1600;
  const currentTempValue = temperaturesArray[temperaturesArray.length - 1]?.temperature || '---';
  const heatNumber = heatData?.heat_number || heatData?.heatNumber || 'N/A';

  return (
    <div className="lf-monitoring">
      {/* Process Overview Card */}
      <div className="card overview-card compact">
        <div className="overview-header compact">
          <div className="header-left">
            <h3>
              <FaChartLine size={14} />
              <span>Process Overview</span>
            </h3>
            <span className="heat-tag">Heat #{heatNumber}</span>
          </div>
          <div className="header-right">
            <div
              className="phase-badge"
              style={{
                backgroundColor: currentPhaseObj?.color || 'var(--info)',
                color: 'white'
              }}
            >
              <FaIndustry size={12} />
              <span>{currentPhaseObj?.name?.split(' ')[0] || currentPhase || 'Unknown'}</span>
            </div>
            <button
              className="btn-refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}
            >
              <FaSyncAlt size={12} className={isRefreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div className="metrics-grid compact1">
          <div className="metric compact" style={{ background: 'var(--bg-secondary)' }}>
            <FaWeightHanging size={14} className="metric-icon" style={{ color: 'var(--info)' }} />
            <div className="metric-info">
              <span className="metric-value" style={{ color: 'var(--text-primary)' }}>
                {typeof liquidWeight === 'number' ? liquidWeight.toFixed(1) : '0'}
                <span className="metric-unit" style={{ color: 'var(--text-muted)' }}>ton</span>
              </span>
            </div>
          </div>

          <div className="metric compact" style={{ background: 'var(--bg-secondary)' }}>
            <FaThermometerHalf size={14} className="metric-icon" style={{ color: 'var(--warning)' }} />
            <div className="metric-info">
              <span className="metric-value" style={{ color: 'var(--text-primary)' }}>
                {currentTempValue === '---' ? '---' : currentTempValue}
                <span className="metric-unit" style={{ color: 'var(--text-muted)' }}>°C</span>
              </span>
            </div>
          </div>

          <div className="metric compact" style={{ background: 'var(--bg-secondary)' }}>
            <FaBolt size={14} className="metric-icon" style={{ color: 'var(--info)' }} />
            <div className="metric-info">
              <span className="metric-value" style={{ color: 'var(--text-primary)' }}>
                {typeof heatingPower === 'number' ? heatingPower : 0}
                <span className="metric-unit" style={{ color: 'var(--text-muted)' }}>MW</span>
              </span>
            </div>
          </div>

          <div className="metric compact" style={{ background: 'var(--bg-secondary)' }}>
            <FaWater size={14} className="metric-icon" style={{ color: '#06b6d4' }} />
            <div className="metric-info">
              <span className="metric-value" style={{ color: 'var(--text-primary)' }}>
                {typeof argonFlow === 'number' ? argonFlow : 0}
                <span className="metric-unit" style={{ color: 'var(--text-muted)' }}>L/min</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="card chart-card">
        <div className="chart-header">
          <h3>
            <FaChartLine />
            Process Trends
          </h3>
          <div className="chart-controls">
            <button
              className={`chart-btn ${activeMetric === 'temperature' ? 'active' : ''}`}
              onClick={() => setActiveMetric('temperature')}
            >
              Temperature
            </button>
            <button
              className={`chart-btn ${activeMetric === 'energy' ? 'active' : ''}`}
              onClick={() => setActiveMetric('energy')}
            >
              Energy
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {activeMetric === 'temperature' ? (
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" />
                <XAxis
                  dataKey="time"
                  stroke="var(--chart-text, #718096)"
                  interval="preserveStartEnd"
                  tick={{ fontSize: 11, fill: 'var(--chart-text, #718096)' }}
                />
                <YAxis
                  domain={['dataMin - 10', 'dataMax + 10']}
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fill: 'var(--chart-text, #718096)' } }}
                  stroke="var(--chart-text, #718096)"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
                <ReferenceLine
                  y={targetTemp}
                  stroke="var(--success)"
                  strokeDasharray="5 5"
                  label={{ value: `Target: ${targetTemp}°C`, fill: 'var(--success)', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="var(--warning)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--warning)' }}
                  name="Temperature"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" />
                <XAxis dataKey="time" stroke="var(--chart-text, #718096)" />
                <YAxis
                  label={{ value: 'Energy (kWh/t)', angle: -90, position: 'insideLeft', style: { fill: 'var(--chart-text, #718096)' } }}
                  stroke="var(--chart-text, #718096)"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="var(--info)"
                  fill="var(--info)"
                  fillOpacity={0.3}
                  name="Energy Supplied"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message" style={{ textAlign: 'center', padding: '60px' }}>
            <p>No temperature data available yet.</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Make sure there is an active heat and temperature records exist.</p>
          </div>
        )}
      </div>

      {/* Temperature Summary */}
      {chartData.length > 0 && (
        <div className="card summary-card">
          <h3 style={{ textAlign: 'center' }}>Temperature Summary</h3>
          <div className="summary-stats">
            <div className="summary-stat" >
              <div className="summary-value" >{Math.min(...chartData.map(d => d.temperature))}°C</div>
              <div className="summary-label">Minimum</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">{Math.max(...chartData.map(d => d.temperature))}°C</div>
              <div className="summary-label">Maximum</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">{(chartData.reduce((sum, d) => sum + d.temperature, 0) / chartData.length).toFixed(1)}°C</div>
              <div className="summary-label">Average</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">{chartData.length}</div>
              <div className="summary-label">Measurements</div>
            </div>
          </div>
        </div>
      )}

      {/* Phase Timeline */}
      <div className="card timeline-card">
        <h3>
          <FaClock />
          Process Timeline
        </h3>
        <div className="phase-timeline">
          {phasesArray.length > 0 ? (
            phasesArray.map((phase, idx) => {
              const isActive = currentPhase === phase.id;
              return (
                <div
                  key={phase.id}
                  className={`timeline-phase ${isActive ? 'active' : ''}`}
                >
                  <div
                    className="phase-dot"
                    style={{ backgroundColor: phase.color }}
                  >
                    <i className={`fas ${phase.icon}`}></i>
                  </div>
                  <div className="phase-name">{phase.name}</div>
                  {idx < phasesArray.length - 1 && <div className="phase-line"></div>}
                </div>
              );
            })
          ) : (
            <div className="no-data-message" style={{ textAlign: 'center', padding: '20px' }}>
              No phases defined
            </div>
          )}
        </div>
      </div>

      {/* Alarms & Warnings */}
      <div className="card alarms-card">
        <h3>
          <FaExclamationTriangle />
          Active Alarms & Warnings
        </h3>
        <div className="alarms-list">
          {alarms.length > 0 ? (
            alarms.map((alarm, idx) => (
              <div key={idx} className={`alarm ${alarm.type}`}>
                {getAlarmIcon(alarm.icon)}
                <span>{alarm.message}</span>
              </div>
            ))
          ) : (
            <div className="no-alarms">
              <FaCheckCircle />
              <span>No active alarms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LFMonitoring;