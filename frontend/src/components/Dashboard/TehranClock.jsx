// components/Dashboard/TehranClock.jsx
import React, { useState, useEffect } from 'react';

const TehranClock = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tehranTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tehran"}));

      const timeString = tehranTime.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const dateString = tehranTime.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      setCurrentTime(`${timeString} - ${dateString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body text-center">
        <i className="fas fa-clock text-info mb-3" style={{fontSize: '2rem'}}></i>
        <div className="tehran-clock">
          <div className="time-display fs-4 fw-bold text-dark mb-2">
            {currentTime.split(' - ')[0]}
          </div>
          <div className="date-display small text-muted">
            {currentTime.split(' - ')[1]}
          </div>
        </div>
        <div className="mt-3">
          <small className="text-muted">زمان سرور: تهران</small>
        </div>
      </div>

      <style jsx>{`
        .tehran-clock {
          direction: ltr;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .time-display {
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .time-display {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TehranClock;