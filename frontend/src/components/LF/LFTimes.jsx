// src/components/LF/LFTimes.jsx
import React, { useMemo } from 'react';
import {
  FaClock,
  FaTable,
  FaChartPie,
  FaCheckCircle,
  FaSpinner,
  FaHourglassHalf,
  FaChartLine
} from 'react-icons/fa';

const LFTimes = ({ lfData }) => {
  const { heatData, phases, currentPhase } = lfData;

  // محاسبه زمان سپری شده از شروع (با پشتیبانی از هر دو فرمت)
  const startTime = heatData?.start_time || heatData?.startTime;
  const elapsedTime = startTime
    ? Math.floor((new Date() - new Date(startTime)) / 1000)
    : 0;

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ایجاد داده‌های فازها با زمان‌های واقعی از heatData
  const phasesData = useMemo(() => {
    if (!phases || !Array.isArray(phases)) return [];

    // پیدا کردن زمان شروع ذوب
    const heatStartTime = startTime ? new Date(startTime) : null;
    const now = new Date();

    // محاسبه زمان سپری شده برای هر فاز بر اساس currentPhase
    const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

    return phases.map((phase, idx) => {
      let phaseStartTime = null;
      let phaseEndTime = null;
      let duration = 0;

      // اگر فاز جاری یا قبلی است
      if (idx <= currentPhaseIndex) {
        // زمان شروع فاز (تخمینی بر اساس زمان شروع ذوب و ترتیب فازها)
        if (heatStartTime) {
          // هر فاز تقریباً 10-15 دقیقه طول می‌کشد (تخمین)
          const estimatedMinutesPerPhase = 12;
          phaseStartTime = new Date(heatStartTime.getTime() + (idx * estimatedMinutesPerPhase * 60000));
        }

        // اگر فاز کامل شده است (قبل از فاز جاری)
        if (idx < currentPhaseIndex) {
          if (phaseStartTime) {
            phaseEndTime = new Date(phaseStartTime.getTime() + (12 * 60000));
            duration = 12 * 60; // 12 دقیقه به ثانیه
          }
        }
        // اگر فاز جاری است
        else if (idx === currentPhaseIndex && heatStartTime) {
          duration = Math.floor((now - phaseStartTime) / 1000);
          if (duration < 0) duration = 0;
        }
      }

      return {
        ...phase,
        startTime: phaseStartTime,
        endTime: phaseEndTime,
        duration: duration,
        isCompleted: idx < currentPhaseIndex,
        isActive: idx === currentPhaseIndex,
        isPending: idx > currentPhaseIndex
      };
    });
  }, [phases, currentPhase, startTime]);

  // محاسبه مجموع زمان‌ها برای breakdown
  const totalDuration = phasesData.reduce((sum, p) => sum + (p.duration || 0), 0);

  // استخراج مقادیر از heatData (پشتیبانی از هر دو فرمت)
  const heatNumber = heatData?.heat_number || heatData?.heatNumber || 'N/A';
  const steelGrade = heatData?.steel_grade_detail?.code ||
                    heatData?.steel_grade?.code ||
                    heatData?.steelGrade ||
                    'Unknown';
  const currentPhaseName = phases?.find(p => p.id === currentPhase)?.name || currentPhase || 'Unknown';

  return (
    <div className="lf-times">
      {/* Current Heat Statistics */}
      <div className="card stats-card">
        <h3>
          <FaClock />
          Current Heat Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat">
            <div className="stat-label">Heat Number</div>
            <div className="stat-value" style={{'display':'block'}} >{heatNumber}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Steel Grade</div>
            <div className="stat-value" style={{'display':'block'}} >{steelGrade}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Heat Start</div>
            <div className="stat-value" style={{'display':'block'}} >
              {startTime ? new Date(startTime).toLocaleTimeString() : '—'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Elapsed Time</div>
            <div className="stat-value highlight" style={{'display':'block'}} >{formatTime(elapsedTime)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Current Phase</div>
            <div className="stat-value" style={{'display':'block'}} >{currentPhaseName}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Phase Progress</div>
            <div className="stat-value" style={{'display':'block'}} >
              {currentPhase ? Math.min(100, Math.floor((elapsedTime % 1800) / 1800 * 100)) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Phase Timeline Table */}
      <div className="card timeline-table-card">
        <h3>
          <FaTable />
          Phase Timeline
        </h3>
        <div className="table-responsive">
          <table className="timeline-table">
            <thead>
              <tr>
                <th>Phase</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {phasesData.map((phase) => (
                <tr key={phase.id} className={phase.isActive ? 'active-phase' : ''}>
                  <td className="phase-name-cell">
                    <i className={`fas ${phase.icon}`} style={{ color: phase.color }}></i>
                    {phase.name}
                  </td>
                  <td className="start-time-cell">
                    {phase.startTime ? phase.startTime.toLocaleTimeString() : '—'}
                  </td>
                  <td className="end-time-cell">
                    {phase.endTime ? phase.endTime.toLocaleTimeString() : phase.isActive ? 'In Progress' : '—'}
                  </td>
                  <td className="duration-cell">
                    {phase.duration > 0 ? formatTime(phase.duration) : '—'}
                  </td>
                  <td className="status-cell">
                    {phase.isCompleted ? (
                      <span className="badge-success">
                        <FaCheckCircle /> Completed
                      </span>
                    ) : phase.isActive ? (
                      <span className="badge-running">
                        <FaSpinner /> In Progress
                      </span>
                    ) : (
                      <span className="badge-pending">
                        <FaHourglassHalf /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Breakdown Chart - فقط در صورت وجود داده نمایش داده شود */}
      {totalDuration > 0 && (
        <div className="card breakdown-card">
          <h3>
            <FaChartPie />
            Time Breakdown by Phase
          </h3>
          <div className="breakdown-bars">
            {phasesData.map((phase) => {
              const percentage = totalDuration > 0 ? (phase.duration / totalDuration) * 100 : 0;
              return (
                <div key={phase.id} className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-dot" style={{ backgroundColor: phase.color }}></span>
                    {phase.name}
                    <span className="breakdown-percent">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="breakdown-bar-container">
                    <div
                      className="breakdown-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: phase.color
                      }}
                    >
                      {percentage > 8 && (
                        <span className="breakdown-time">{formatTime(phase.duration)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="card summary-card">
        <h3>
          <FaChartLine />
          Time Summary
        </h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-value" style={{'display':'block'}} >{phasesData.filter(p => p.isCompleted).length}</div>
            <div className="summary-label">Completed Phases</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value" style={{'display':'block'}} >{phasesData.filter(p => p.isActive).length}</div>
            <div className="summary-label">Current Phase</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value" style={{'display':'block'}} >{phasesData.filter(p => p.isPending).length}</div>
            <div className="summary-label">Remaining Phases</div>
          </div>
          <div className="summary-stat">
            <div className="summary-value" style={{'display':'block'}} >{formatTime(elapsedTime)}</div>
            <div className="summary-label">Elapsed Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LFTimes;