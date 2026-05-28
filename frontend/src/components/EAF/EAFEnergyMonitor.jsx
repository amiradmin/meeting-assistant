// src/components/EAF/EAFEnergyMonitor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaPlug,
  FaBolt,
  FaTachometerAlt,
  FaChartLine,
  FaSpinner,
  FaSyncAlt,
  FaDownload,
} from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/eaf';

const EAFEnergyMonitor = ({ eafData }) => {
  const { heatData, energyData, refreshData } = eafData;
  const [currentPower, setCurrentPower] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update current power from latest energy data
  useEffect(() => {
    if (energyData && energyData.length > 0) {
      const latest = energyData[0];
      setCurrentPower(latest.power_active || 0);
      setLastUpdated(new Date());
    }
  }, [energyData]);

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh || !heatData?.id) return;

    const interval = setInterval(() => {
      refreshEnergyData();
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, heatData?.id]);

  const refreshEnergyData = useCallback(async () => {
    if (!heatData?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/eaf/heats/${heatData.id}/energy_data/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const newEnergyData = data.results || data;
        if (newEnergyData.length > 0) {
          setCurrentPower(newEnergyData[0].power_active || 0);
        }
        // Force refresh of parent data
        await refreshData();
      }
    } catch (error) {
      console.error('Error refreshing energy data:', error);
    } finally {
      setLoading(false);
    }
  }, [heatData?.id, refreshData]);

  const exportData = () => {
    if (!energyData.length) return;

    const csv = [
      ['Time', 'Active Power (MW)', 'Reactive Power (MVAR)', 'Energy (MWh)', 'Electrode (mm)', 'Tap Position', 'Working Point'],
      ...energyData.map(record => [
        new Date(record.timestamp).toLocaleString(),
        record.power_active?.toFixed(2) || 0,
        record.power_reactive?.toFixed(2) || 0,
        record.energy_consumed?.toFixed(2) || 0,
        record.electrode_position || 0,
        record.tap_position || 1,
        record.working_point || 1
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `energy_data_heat_${heatData?.heat_number}_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalEnergy = energyData.reduce((sum, e) => sum + (e.energy_consumed || 0), 0);
  const avgPower = energyData.length > 0
    ? energyData.reduce((sum, e) => sum + (e.power_active || 0), 0) / energyData.length
    : 0;
  const maxPower = energyData.length > 0
    ? Math.max(...energyData.map(e => e.power_active || 0))
    : 0;
  const energyCost = totalEnergy * 65; // Assuming $65 per MWh

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat. Please select a heat.</p>
      </div>
    );
  }

  return (
    <div className="eaf-energy-monitor">
      {/* Header with refresh controls */}
      <div className="energy-header">
        <div className="header-left">
          <h3>
            <FaPlug />
            Energy Consumption Monitor
          </h3>
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <div className="header-right">
          <button
            className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          >
            <FaSyncAlt className={autoRefresh ? 'spin' : ''} />
            Auto
          </button>
          <button className="btn-refresh" onClick={refreshEnergyData} disabled={loading}>
            {loading ? <FaSpinner className="spin" /> : <FaSyncAlt />}
            Refresh
          </button>
          <button className="btn-export" onClick={exportData} disabled={!energyData.length}>
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <FaBolt />
          </div>
          <div className="metric-info">
            <span className="metric-label">Current Power</span>
            <span className="metric-value">{currentPower.toFixed(1)} <small>MW</small></span>
            {currentPower > 80 && <span className="metric-trend high">High demand</span>}
            {currentPower > 0 && currentPower <= 80 && <span className="metric-trend normal">Normal</span>}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaChartLine />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Energy</span>
            <span className="metric-value">{totalEnergy.toFixed(1)} <small>MWh</small></span>
            <span className="metric-sub">≈ ${energyCost.toFixed(0)}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaTachometerAlt />
          </div>
          <div className="metric-info">
            <span className="metric-label">Average Power</span>
            <span className="metric-value">{avgPower.toFixed(1)} <small>MW</small></span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FaChartLine />
          </div>
          <div className="metric-info">
            <span className="metric-label">Peak Power</span>
            <span className="metric-value">{maxPower.toFixed(1)} <small>MW</small></span>
          </div>
        </div>
      </div>

      {/* Energy Data Table */}
      <div className="card">
        <h3>
          <FaPlug />
          Energy Consumption Details
        </h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Active Power (MW)</th>
                <th>Reactive Power (MVAR)</th>
                <th>Energy (MWh)</th>
                <th>Electrode (mm)</th>
                <th>Tap Position</th>
                <th>Working Point</th>
              </tr>
            </thead>
            <tbody>
              {energyData.length > 0 ? (
                energyData.slice(0, 50).map((record, index) => (
                  <tr key={record.id || index}>
                    <td className="time-cell">{new Date(record.timestamp).toLocaleString()}</td>
                    <td className={`power-cell ${record.power_active > 80 ? 'high-power' : ''}`}>
                      {record.power_active?.toFixed(1) || 0}
                    </td>
                    <td>{record.power_reactive?.toFixed(1) || 0}</td>
                    <td className="energy-cell">{record.energy_consumed?.toFixed(2) || 0}</td>
                    <td>{record.electrode_position || 0}</td>
                    <td>{record.tap_position || 1}</td>
                    <td>{record.working_point || 1}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-content">
                      <FaPlug />
                      <p>No energy data available</p>
                      <small>Energy data will appear here when the heat is in melting phase</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {energyData.length > 0 && (
          <div className="table-footer">
            <span>Showing last {Math.min(energyData.length, 50)} of {energyData.length} records</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EAFEnergyMonitor;