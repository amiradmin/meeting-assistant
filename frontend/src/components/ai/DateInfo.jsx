import React from 'react';
import { FaCalendar, FaGraduationCap, FaInfoCircle } from 'react-icons/fa';
import Tooltip from './Tooltip';

const DateInfo = ({ lastUpdate, lastTraining, shouldShowTrainButton, modelVersionData }) => {
  const formatDateDisplay = (date) => {
    if (!date) return 'هنوز انجام نشده';

    if (typeof date === 'string') {
      date = new Date(date);
    }

    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extract RUL model data from the API response
  const getRULModelInfo = () => {
    if (!modelVersionData || !modelVersionData.latest_versions || !modelVersionData.latest_versions.RUL) {
      return null;
    }

    const rulModel = modelVersionData.latest_versions.RUL;
    return {
      version: rulModel.version,
      created_at: rulModel.created_at,
      created_at_formatted: rulModel.created_at_formatted,
      notes: rulModel.notes,
      model_file: rulModel.model_file
    };
  };

  const rulModelInfo = getRULModelInfo();

  if (!shouldShowTrainButton && !lastUpdate) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
      padding: '0.75rem 1rem',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '0.875rem'
    }}>
      {/* Last Prediction Date - Always visible */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flex: 1
      }}>
        <FaCalendar style={{ color: '#10b981', flexShrink: 0 }} />
        <span style={{ fontWeight: '500', color: '#475569' }}>آخرین پیش‌بینی:</span>
        <span style={{ color: '#334155', fontFamily: 'monospace' }}>
          {lastUpdate ? formatDateDisplay(lastUpdate) : 'هنوز انجام نشده'}
        </span>
      </div>

      {/* Last Training Date - Only for RUL prediction and in tooltip */}
      {shouldShowTrainButton && (
        <Tooltip
          content={
            <div style={{
              textAlign: 'right',
              maxWidth: '400px',
              padding: '0.5rem'
            }}>
              <div style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#1f2937',
                borderBottom: '2px solid #8b5cf6',
                paddingBottom: '0.25rem'
              }}>
                🎯 آخرین آموزش مدل RUL
              </div>

              {rulModelInfo ? (
                <div style={{ lineHeight: '1.6', fontSize: '0.8rem' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>🗂️ ورژن:</strong>
                    <span style={{
                      fontFamily: 'monospace',
                      background: '#f3f4f6',
                      padding: '0.1rem 0.3rem',
                      borderRadius: '4px',
                      marginRight: '0.25rem'
                    }}>
                      {rulModelInfo.version}
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>📅 تاریخ آموزش:</strong>
                    <span style={{ color: '#059669' }}>
                      {formatDateDisplay(rulModelInfo.created_at)}
                    </span>
                  </div>

                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>📊 وضعیت فایل:</strong>
                    <span style={{
                      color: rulModelInfo.model_file ? '#059669' : '#dc2626',
                      fontWeight: '500'
                    }}>
                      {rulModelInfo.model_file ? 'موجود ✅' : 'ندارد ❌'}
                    </span>
                  </div>

                  {/* Extract key metrics from notes */}
                  {rulModelInfo.notes && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: '#f0f9ff',
                      borderRadius: '6px',
                      border: '1px solid #bae6fd'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        color: '#0369a1',
                        fontSize: '0.75rem'
                      }}>
                        📈 خلاصه عملکرد:
                      </div>
                      {extractMetricsFromNotes(rulModelInfo.notes)}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  color: '#6b7280',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '0.5rem'
                }}>
                  🚫 مدل RUL آموزش دیده‌ای یافت نشد
                </div>
              )}
            </div>
          }
          position="top"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: rulModelInfo ? '#f0f9ff' : 'white',
            border: rulModelInfo ? '1px solid #7dd3fc' : '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = rulModelInfo ? '#e0f2fe' : '#f8fafc';
            e.target.style.borderColor = rulModelInfo ? '#38bdf8' : '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = rulModelInfo ? '#f0f9ff' : 'white';
            e.target.style.borderColor = rulModelInfo ? '#7dd3fc' : '#e2e8f0';
          }}
          >
            <FaGraduationCap style={{
              color: rulModelInfo ? '#0369a1' : '#8b5cf6'
            }} />
            <FaInfoCircle style={{
              color: rulModelInfo ? '#0369a1' : '#6b7280',
              fontSize: '0.75rem'
            }} />
            {rulModelInfo && (
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }} />
            )}
          </div>
        </Tooltip>
      )}
    </div>
  );
};

// Helper function to extract key metrics from notes
const extractMetricsFromNotes = (notes) => {
  try {
    const lines = notes.split('\n');
    const metrics = [];

    lines.forEach(line => {
      if (line.includes('Total Data Points:')) {
        const value = line.split(':')[1]?.trim();
        if (value) metrics.push(`📊 داده‌های آموزشی: ${value}`);
      }
      else if (line.includes('Final Validation MAE:')) {
        const value = line.split(':')[1]?.trim();
        if (value) metrics.push(`🎯 خطای مدل: ${value}`);
      }
      else if (line.includes('Training Sequences:')) {
        const value = line.split(':')[1]?.trim();
        if (value) metrics.push(`🔄 توالی‌ها: ${value}`);
      }
    });

    return metrics.length > 0 ? (
      <div>
        {metrics.map((metric, index) => (
          <div key={index} style={{
            fontSize: '0.7rem',
            marginBottom: '0.1rem',
            color:'black'
          }}>
            {metric}
          </div>
        ))}
      </div>
    ) : (
      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
        اطلاعات آماری در دسترس نیست
      </div>
    );
  } catch (error) {
    return (
      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
        خطا در خواندن اطلاعات
      </div>
    );
  }
};

// Add CSS for pulse animation
const styles = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default DateInfo;