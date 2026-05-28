// src/components/dashboard/AlarmPanel.jsx
import React, { useState, useEffect } from 'react';
import './AlarmPanel.css';

const AlarmPanel = ({ alarms: initialAlarms, onAcknowledge }) => {
  const [alarms, setAlarms] = useState(initialAlarms || []);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data generator for demonstration
  const generateMockAlarm = () => {
    const units = ['EAF', 'LF', 'CCM', 'WTP', 'FTP', 'RMH'];
    const severities = ['high', 'medium', 'low'];
    const messages = [
      'Electrode position abnormal',
      'Cooling water pressure low',
      'Argon flow fluctuating',
      'Molten temperature out of range',
      'High carbon level',
      'Dust collection system failure',
      'High energy consumption',
      'Irregular casting speed',
      'Control system failure',
      'PLC connection lost'
    ];

    const unit = units[Math.floor(Math.random() * units.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      id: Date.now() + Math.random(),
      unit,
      severity,
      message,
      time: new Date().toLocaleTimeString(),
      timestamp: new Date(),
      acknowledged: false,
      duration: Math.floor(Math.random() * 120) + 1
    };
  };

  // Initialize with mock alarms if none provided
  useEffect(() => {
    if (!initialAlarms || initialAlarms.length === 0) {
      const mockAlarms = Array.from({ length: 8 }, generateMockAlarm);
      setAlarms(mockAlarms);
      setUnreadCount(mockAlarms.filter(a => !a.acknowledged).length);
    } else {
      setAlarms(initialAlarms);
      setUnreadCount(initialAlarms.filter(a => !a.acknowledged).length);
    }
  }, [initialAlarms]);

  // Simulate new alarms every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlarm = generateMockAlarm();
        setAlarms(prev => [newAlarm, ...prev].slice(0, 50));

        if (!newAlarm.acknowledged) {
          setUnreadCount(prev => prev + 1);

          if (isSoundEnabled) {
            playAlarmSound(newAlarm.severity);
          }

          if (Notification.permission === 'granted') {
            new Notification(`${newAlarm.unit} Alarm`, {
              body: newAlarm.message,
              icon: '/alarm-icon.png'
            });
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isSoundEnabled]);

  const playAlarmSound = (severity) => {
    const audio = new Audio('/alarm-sound.mp3');
    audio.volume = severity === 'high' ? 1 : severity === 'medium' ? 0.7 : 0.4;
    audio.play().catch(console.error);
  };

  const handleAcknowledge = (alarmId) => {
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === alarmId ? { ...alarm, acknowledged: true } : alarm
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (onAcknowledge) {
      onAcknowledge(alarmId);
    }
  };

  const handleAcknowledgeAll = () => {
    setAlarms(prev =>
      prev.map(alarm => ({ ...alarm, acknowledged: true }))
    );
    setUnreadCount(0);
  };

  const handleSilenceAll = () => {
    setIsSoundEnabled(false);
    setTimeout(() => setIsSoundEnabled(true), 60000);
  };

  const filteredAlarms = alarms.filter(alarm => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alarm.acknowledged;
    if (filter === 'acknowledged') return alarm.acknowledged;
    return alarm.severity === filter;
  });

  const sortedAlarms = [...filteredAlarms].sort((a, b) => {
    if (sortBy === 'time') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === 'severity') {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    if (sortBy === 'unit') return a.unit.localeCompare(b.unit);
    return 0;
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'fas fa-exclamation-circle';
      case 'medium': return 'fas fa-exclamation-triangle';
      case 'low': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  const getUnitIcon = (unit) => {
    switch (unit) {
      case 'EAF': return 'fas fa-fire';
      case 'LF': return 'fas fa-flask';
      case 'CCM': return 'fas fa-stream';
      case 'WTP': return 'fas fa-water';
      case 'FTP': return 'fas fa-fan';
      case 'RMH': return 'fas fa-exchange-alt';
      default: return 'fas fa-industry';
    }
  };

  const getDurationText = (minutes) => {
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  const severityStats = {
    high: alarms.filter(a => a.severity === 'high' && !a.acknowledged).length,
    medium: alarms.filter(a => a.severity === 'medium' && !a.acknowledged).length,
    low: alarms.filter(a => a.severity === 'low' && !a.acknowledged).length
  };

  return (
    <div className="dashboard-card" dir="ltr">
      <div className="card-header">
        <div className="header-left">
          <h3 className="card-title">
            <i className="fas fa-exclamation-triangle"></i>
            Alarm Panel
            {unreadCount > 0 && (
              <span className="alarm-count-badge">{unreadCount}</span>
            )}
          </h3>
          <div className="alarm-stats">
            <div className="stat-item">
              <span className="stat-dot high"></span>
              <span className="stat-count">{severityStats.high}</span>
              <span className="stat-label">High</span>
            </div>
            <div className="stat-item">
              <span className="stat-dot medium"></span>
              <span className="stat-count">{severityStats.medium}</span>
              <span className="stat-label">Medium</span>
            </div>
            <div className="stat-item">
              <span className="stat-dot low"></span>
              <span className="stat-count">{severityStats.low}</span>
              <span className="stat-label">Low</span>
            </div>
          </div>
        </div>

        <div className="header-controls">
          <button
            className="btn-control btn-silence"
            onClick={handleSilenceAll}
            title="Temporarily mute alarms"
          >
            <i className="fas fa-volume-mute"></i>
            Mute for 1 min
          </button>
          <button
            className="btn-control btn-acknowledge-all"
            onClick={handleAcknowledgeAll}
            disabled={unreadCount === 0}
          >
            <i className="fas fa-check-double"></i>
            Acknowledge All
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Filter and Sort Controls */}
        <div className="controls-row">
          <div className="filter-controls">
            <div className="control-group">
              <label className="control-label">
                <i className="fas fa-filter"></i>
                Filter:
              </label>
              <select
                className="form-control form-control-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Alarms</option>
                <option value="unacknowledged">Unacknowledged</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="high">High Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="low">Low Severity</option>
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">
                <i className="fas fa-sort-amount-down"></i>
                Sort By:
              </label>
              <select
                className="form-control form-control-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="time">Time (Newest)</option>
                <option value="severity">Severity</option>
                <option value="unit">Unit</option>
              </select>
            </div>
          </div>

          <div className="sound-control">
            <label className="sound-toggle">
              <input
                type="checkbox"
                checked={isSoundEnabled}
                onChange={(e) => setIsSoundEnabled(e.target.checked)}
              />
              <span className="sound-toggle-slider"></span>
              <span className="sound-toggle-label">
                <i className="fas fa-volume-up"></i>
                Alarm Sound
              </span>
            </label>
          </div>
        </div>

        {/* Alarm List */}
        <div className="alarm-list-container">
          {sortedAlarms.length === 0 ? (
            <div className="no-alarms">
              <i className="fas fa-check-circle"></i>
              <p>No alarms present</p>
              <small className="text-muted">System is operating normally</small>
            </div>
          ) : (
            <div className="alarm-list">
              {sortedAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`alarm-item ${alarm.severity} ${alarm.acknowledged ? 'acknowledged' : ''}`}
                >
                  <div className="alarm-severity-indicator">
                    <i className={getSeverityIcon(alarm.severity)}></i>
                  </div>

                  <div className="alarm-content">
                    <div className="alarm-header">
                      <div className="alarm-unit">
                        <i className={getUnitIcon(alarm.unit)}></i>
                        <span className="unit-name">{alarm.unit}</span>
                        <span className={`severity-badge severity-${alarm.severity}`}>
                          {getSeverityText(alarm.severity)}
                        </span>
                      </div>

                      <div className="alarm-time">
                        <i className="fas fa-clock"></i>
                        {alarm.time}
                      </div>
                    </div>

                    <div className="alarm-message">
                      {alarm.message}
                    </div>

                    <div className="alarm-footer">
                      <div className="alarm-duration">
                        <i className="fas fa-history"></i>
                        Duration: {getDurationText(alarm.duration)}
                      </div>

                      <div className="alarm-actions">
                        {!alarm.acknowledged ? (
                          <button
                            className="btn-acknowledge"
                            onClick={() => handleAcknowledge(alarm.id)}
                          >
                            <i className="fas fa-check"></i>
                            Acknowledge
                          </button>
                        ) : (
                          <span className="acknowledged-badge">
                            <i className="fas fa-check-circle"></i>
                            Acknowledged
                          </span>
                        )}

                        <button
                          className="btn-details"
                          onClick={() => console.log('View details', alarm.id)}
                        >
                          <i className="fas fa-info-circle"></i>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alarm Summary */}
        <div className="alarm-summary">
          <div className="summary-item">
            <div className="summary-label">Total Alarms</div>
            <div className="summary-value">{alarms.length}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Unacknowledged</div>
            <div className="summary-value">{unreadCount}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Oldest Alarm</div>
            <div className="summary-value">
              {alarms.length > 0
                ? Math.max(...alarms.map(a => a.duration))
                : 0} min
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">System Status</div>
            <div className={`summary-value ${unreadCount === 0 ? 'status-normal' : 'status-alarm'}`}>
              {unreadCount === 0 ? 'Normal' : 'Attention Needed'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn-action">
            <i className="fas fa-file-export"></i>
            Export Report
          </button>
          <button className="btn-action">
            <i className="fas fa-history"></i>
            Alarm History
          </button>
          <button className="btn-action">
            <i className="fas fa-sliders-h"></i>
            Alarm Settings
          </button>
          <button className="btn-action">
            <i className="fas fa-question-circle"></i>
            Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlarmPanel;