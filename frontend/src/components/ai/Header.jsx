import React from 'react';
import { FaRobot, FaSync, FaSpinner } from 'react-icons/fa';

const Header = ({
  lastSync,
  trainingStatus,
  onRefresh,
  onStartTraining
}) => {
  const formatSyncTime = () => {
    if (!lastSync) return 'در حال بارگذاری...';
    try {
      return lastSync.toLocaleString('fa-IR');
    } catch (error) {
      return 'تاریخ نامعتبر';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            flexShrink: 0
          }}>
            <FaRobot />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              داشبورد هوش مصنوعی
            </h1>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '1.1rem',
              lineHeight: '1.5'
            }}>
              مدیریت و مانیتورینگ پیش‌بینی‌های هوشمند سیستم
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <FaSync />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Training Status */}
      {trainingStatus.message && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: trainingStatus.isTraining ? '#f0f9ff' : '#f0fdf4',
          border: trainingStatus.isTraining ? '1px solid #bae6fd' : '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: trainingStatus.isTraining ? '#0369a1' : '#15803d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {trainingStatus.isTraining && (
              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            )}
            <span>{trainingStatus.message}</span>
            {trainingStatus.progress > 0 && (
              <span style={{ marginRight: 'auto', fontWeight: 'bold' }}>
                {trainingStatus.progress}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Last sync info */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <strong>آخرین همگام‌سازی:</strong> {formatSyncTime()}
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Header;