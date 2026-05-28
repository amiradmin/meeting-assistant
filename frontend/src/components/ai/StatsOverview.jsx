import React from 'react';

const StatsOverview = ({ stats, modelStats }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
          {stats.completed}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>پیش‌بینی‌های تکمیل شده</div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
          {stats.scheduled}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>برنامه‌ریزی شده</div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
          {stats.running}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>در حال اجرا</div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
          {modelStats?.total_models || 0}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>مدل‌های آموزش دیده</div>
      </div>
    </div>
  );
};

export default StatsOverview;