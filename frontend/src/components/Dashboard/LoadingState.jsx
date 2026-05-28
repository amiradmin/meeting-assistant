// components/Dashboard/LoadingState.jsx
import React from 'react';

const LoadingState = () => {
  return (
    <div className="dashboard-container w-100 min-vh-100 d-flex justify-content-center align-items-center" dir="rtl">
      <div className="text-center">
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary fs-5">در حال بارگذاری داشبورد...</p>
        <p className="text-muted small">دریافت اطلاعات از سرور</p>
      </div>
    </div>
  );
};

export default LoadingState;