// components/Dashboard/DashboardHeader.jsx
import React from 'react';

const DashboardHeader = ({ lastUpdated, onRefresh }) => {
  // Function to format date in Jalali calendar
  const formatJalaliDate = (dateString) => {
    try {
      // If lastUpdated is already in Persian format, return as is
      if (typeof dateString === 'string' && /[آ-ی]/.test(dateString)) {
        return dateString;
      }

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'در حال بارگذاری...';
      }

      // Convert to Jalali using Intl if available, otherwise use simple fallback
      if (window.Intl && Intl.DateTimeFormat) {
        const formatter = new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        return formatter.format(date);
      } else {
        // Fallback to simple Persian date format
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        };
        return date.toLocaleDateString('fa-IR', options);
      }
    } catch (error) {
      console.error('Error formatting Jalali date:', error);
      return 'خطا در نمایش تاریخ';
    }
  };

  // Format the last updated time
  const formattedTime = lastUpdated ? formatJalaliDate(lastUpdated) : 'در حال بارگذاری...';

  return (
    <div className="dashboard-header bg-white shadow-sm py-4 mb-4">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="h2 fw-bold text-dark mb-2"> Level 2 داشبورد مدیریتی</h1>
            <p className="text-muted mb-0">
              وضعیت کلی سامانه
            </p>
          </div>
          <div className="col-md-4 text-left">
            <div className="d-flex align-items-center justify-content-end gap-3">
              <div className="text-end">
                <div className="text-success fw-semibold">
                  <i className="fas fa-circle me-1" style={{fontSize: '8px'}}></i>
                  سیستم آنلاین
                </div>
                <small className="text-muted">
                  آخرین بروزرسانی: {formattedTime}
                </small>
              </div>
              <button
                className="btn btn-sm btn-light text-primary border-0"
                onClick={onRefresh}
                title="بروزرسانی داده‌ها"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-header {
          border-bottom: 1px solid #e3e6f0;
          max-height: 150px;
        }

        .btn-light:hover {
          background-color: #e9ecef !important;
          transform: scale(1.05);
          transition: all 0.2s ease-in-out;
        }

        .btn-light:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default DashboardHeader;