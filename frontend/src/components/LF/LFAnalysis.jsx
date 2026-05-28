// src/components/LF/LFAnalysis.jsx
import React, { useState } from 'react';
import { STEEL_ANALYSIS_LIMITS } from '../../constants/steelConstants';

import {
  FaFlask,
  FaPlus,
  FaChartBar,
  FaTimes,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

const LFAnalysis = ({ lfData }) => {
  const { heatData, analyses, recordAnalysis } = lfData;
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [newAnalysis, setNewAnalysis] = useState({
    C: 0,
    Mn: 0,
    Si: 0,
    P: 0,
    S: 0,
    Cr: 0,
    Ni: 0,
    Mo: 0,
    Al: 0
  });

  const steelLimits = STEEL_ANALYSIS_LIMITS[heatData?.steelGrade] || STEEL_ANALYSIS_LIMITS['ST52-3'];

  // بررسی اینکه مقدار در محدوده است یا نه
  const isInRange = (element, value) => {
    const limits = steelLimits[element];
    if (!limits) return true;
    return value >= limits.min && value <= limits.max;
  };

  // دریافت کلاس رنگ برای سلول
  const getCellClass = (element, value) => {
    if (!value) return '';
    if (!isInRange(element, value)) return 'out-of-range';
    return '';
  };

  // دریافت آیکون وضعیت برای سلول
  const getStatusIcon = (element, value) => {
    if (!value) return null;
    if (isInRange(element, value)) {
      return <FaCheckCircle className="status-icon good" />;
    }
    return <FaExclamationTriangle className="status-icon warning" />;
  };

  // ثبت آنالیز جدید
  const handleRecordAnalysis = async () => {
    const result = await recordAnalysis(newAnalysis);
    if (result.success) {
      setShowAnalysisModal(false);
      setNewAnalysis({ C: 0, Mn: 0, Si: 0, P: 0, S: 0, Cr: 0, Ni: 0, Mo: 0, Al: 0 });
    } else {
      alert('Error recording analysis: ' + result.error);
    }
  };

  return (
    <div className="lf-analysis">
      {/* Analysis Table Card */}
      <div className="card">
        <div className="card-header">
          <h3>
            <FaFlask />
            Chemical Analysis Records
          </h3>
          <button
            className="btn-primary"
            onClick={() => setShowAnalysisModal(true)}
          >
            <FaPlus />
            New Analysis
          </button>
        </div>

        <div className="table-responsive">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Sample ID</th>
                <th>C (%)</th>
                <th>Mn (%)</th>
                <th>Si (%)</th>
                <th>P (%)</th>
                <th>S (%)</th>
                <th>Cr (%)</th>
                <th>Ni (%)</th>
                <th>Mo (%)</th>
                <th>Al (%)</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => (
                <tr key={analysis.id}>
                  <td>{analysis.time}</td>
                  <td>{analysis.sampleId}</td>
                  <td className={getCellClass('C', analysis.elements.C)}>
                    <div className="cell-content">
                      {getStatusIcon('C', analysis.elements.C)}
                      {analysis.elements.C?.toFixed(3)}
                      {steelLimits.C && (
                        <span className="range">
                          {steelLimits.C.min}-{steelLimits.C.max}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={getCellClass('Mn', analysis.elements.Mn)}>
                    <div className="cell-content">
                      {getStatusIcon('Mn', analysis.elements.Mn)}
                      {analysis.elements.Mn?.toFixed(3)}
                    </div>
                  </td>
                  <td className={getCellClass('Si', analysis.elements.Si)}>
                    <div className="cell-content">
                      {getStatusIcon('Si', analysis.elements.Si)}
                      {analysis.elements.Si?.toFixed(3)}
                    </div>
                  </td>
                  <td className={getCellClass('P', analysis.elements.P)}>
                    <div className="cell-content">
                      {getStatusIcon('P', analysis.elements.P)}
                      {analysis.elements.P?.toFixed(4)}
                    </div>
                  </td>
                  <td className={getCellClass('S', analysis.elements.S)}>
                    <div className="cell-content">
                      {getStatusIcon('S', analysis.elements.S)}
                      {analysis.elements.S?.toFixed(4)}
                    </div>
                  </td>
                  <td className={getCellClass('Cr', analysis.elements.Cr)}>
                    <div className="cell-content">
                      {getStatusIcon('Cr', analysis.elements.Cr)}
                      {analysis.elements.Cr?.toFixed(3) || '—'}
                    </div>
                  </td>
                  <td className={getCellClass('Ni', analysis.elements.Ni)}>
                    <div className="cell-content">
                      {getStatusIcon('Ni', analysis.elements.Ni)}
                      {analysis.elements.Ni?.toFixed(3) || '—'}
                    </div>
                  </td>
                  <td className={getCellClass('Mo', analysis.elements.Mo)}>
                    <div className="cell-content">
                      {getStatusIcon('Mo', analysis.elements.Mo)}
                      {analysis.elements.Mo?.toFixed(3) || '—'}
                    </div>
                  </td>
                  <td className={getCellClass('Al', analysis.elements.Al)}>
                    <div className="cell-content">
                      {getStatusIcon('Al', analysis.elements.Al)}
                      {analysis.elements.Al?.toFixed(3) || '—'}
                    </div>
                  </td>
                </tr>
              ))}
              {analyses.length === 0 && (
                <tr>
                  <td colSpan="11" className="no-data">
                    No analysis records yet. Click "New Analysis" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Limits Reference */}
      <div className="card limits-card">
        <h3>
          <FaChartBar />
          Target Limits for {heatData?.steelGrade || 'ST52-3'}
        </h3>
        <div className="limits-grid">
          {Object.entries(steelLimits).map(([element, limits]) => (
            <div key={element} className="limit-item">
              <div className="limit-element">{element.toUpperCase()}</div>
              <div className="limit-bar">
                <div
                  className="limit-fill"
                  style={{
                    left: `${(limits.min / (limits.max + 0.5)) * 100}%`,
                    width: `${((limits.max - limits.min) / (limits.max + 0.5)) * 100}%`
                  }}
                >
                  <span className="limit-target">{limits.target}%</span>
                </div>
              </div>
              <div className="limit-values">
                {limits.min}% - {limits.max}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Analysis Modal */}
      {showAnalysisModal && (
        <div className="modal-overlay" onClick={() => setShowAnalysisModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record New Analysis</h3>
              <button className="modal-close" onClick={() => setShowAnalysisModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="elements-grid">
                {Object.keys(newAnalysis).map((element) => (
                  <div key={element} className="input-group">
                    <label>
                      {element.toUpperCase()} (%)
                      {steelLimits[element] && (
                        <span className="limit-hint">
                          Target: {steelLimits[element].target}%
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={newAnalysis[element]}
                      onChange={(e) => setNewAnalysis({
                        ...newAnalysis,
                        [element]: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleRecordAnalysis}>
                <FaSave /> Save Analysis
              </button>
              <button className="btn-secondary" onClick={() => setShowAnalysisModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LFAnalysis;