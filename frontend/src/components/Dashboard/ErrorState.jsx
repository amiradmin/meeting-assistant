// components/Dashboard/ErrorState.jsx
import React from 'react';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="dashboard-container w-100 min-vh-100 d-flex justify-content-center align-items-center" dir="rtl">
      <div className="alert alert-danger text-center w-50 mx-3">
        <i className="fas fa-exclamation-triangle me-2 fs-4"></i>
        <h5 className="d-inline">خطا در بارگذاری داده‌ها</h5>
        <p className="mt-3 mb-3">{error}</p>
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-primary"
            onClick={onRetry}
          >
            <i className="fas fa-redo me-2"></i>
            تلاش مجدد
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-2"></i>
            بارگذاری مجدد صفحه
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;