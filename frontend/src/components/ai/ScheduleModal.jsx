import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaSave } from 'react-icons/fa';

const ScheduleModal = ({ isOpen, onClose, onSubmit, title }) => {
  const [scheduleConfig, setScheduleConfig] = useState({
    type: 'once',
    date: '',
    time: '09:00',
    daysOfWeek: [0, 1, 2, 3, 4],
    intervalDays: 1
  });

  const handleDayToggle = (day) => {
    setScheduleConfig(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const handleSubmit = () => {
    let nextRun;
    if (scheduleConfig.type === 'once') {
      const dateTime = new Date(`${scheduleConfig.date}T${scheduleConfig.time}`);
      nextRun = dateTime.toISOString();
    } else {
      const now = new Date();
      const [hours, minutes] = scheduleConfig.time.split(':').map(Number);

      if (scheduleConfig.type === 'daily') {
        nextRun = new Date();
        nextRun.setHours(hours, minutes, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
      } else if (scheduleConfig.type === 'weekly') {
        nextRun = new Date();
        nextRun.setHours(hours, minutes, 0, 0);
        const currentDay = now.getDay();
        let daysToAdd = 0;

        for (let i = 1; i <= 7; i++) {
          const checkDay = (currentDay + i) % 7;
          if (scheduleConfig.daysOfWeek.includes(checkDay)) {
            daysToAdd = i;
            break;
          }
        }
        nextRun.setDate(nextRun.getDate() + daysToAdd);
      }
      nextRun = nextRun.toISOString();
    }

    const finalScheduleConfig = {
      ...scheduleConfig,
      nextRun: nextRun
    };

    onSubmit(finalScheduleConfig);
    setScheduleConfig({
      type: 'once',
      date: '',
      time: '09:00',
      daysOfWeek: [0, 1, 2, 3, 4],
      intervalDays: 1
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content schedule-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <FaCalendarAlt />
            زمان‌بندی پیش‌بینی - {title}
          </h2>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">نوع زمان‌بندی:</label>
            <select
              value={scheduleConfig.type}
              onChange={(e) => setScheduleConfig(prev => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="once">یک بار</option>
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
            </select>
          </div>

          {scheduleConfig.type === 'once' && (
            <div className="form-group">
              <label className="form-label">تاریخ:</label>
              <input
                type="date"
                value={scheduleConfig.date}
                onChange={(e) => setScheduleConfig(prev => ({ ...prev, date: e.target.value }))}
                min={getMinDate()}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">زمان:</label>
            <input
              type="time"
              value={scheduleConfig.time}
              onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
              className="form-input"
            />
          </div>

          {scheduleConfig.type === 'weekly' && (
            <div className="form-group">
              <label className="form-label">روزهای هفته:</label>
              <div className="days-grid">
                {[
                  { value: 0, label: 'یکشنبه' },
                  { value: 1, label: 'دوشنبه' },
                  { value: 2, label: 'سه‌شنبه' },
                  { value: 3, label: 'چهارشنبه' },
                  { value: 4, label: 'پنجشنبه' },
                  { value: 5, label: 'جمعه' },
                  { value: 6, label: 'شنبه' }
                ].map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`day-btn ${scheduleConfig.daysOfWeek.includes(day.value) ? 'active' : ''}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="schedule-preview">
            <h4>پیش‌نمایش زمان‌بندی:</h4>
            <p>
              {scheduleConfig.type === 'once' && scheduleConfig.date ? (
                `اجرا در تاریخ ${scheduleConfig.date} ساعت ${scheduleConfig.time}`
              ) : scheduleConfig.type === 'daily' ? (
                `اجرای روزانه در ساعت ${scheduleConfig.time}`
              ) : scheduleConfig.type === 'weekly' ? (
                `اجرای هفتگی در روزهای انتخاب شده در ساعت ${scheduleConfig.time}`
              ) : (
                'لطفاً تنظیمات زمان‌بندی را انتخاب کنید'
              )}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn-cancel"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            disabled={scheduleConfig.type === 'once' && !scheduleConfig.date}
            className="btn-confirm"
          >
            <FaSave />
            تأیید زمان‌بندی
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
          backdrop-filter: blur(8px);
        }

        .schedule-modal {
          background: white;
          border-radius: 20px;
          width: 95%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 20px 20px 0 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .modal-body {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 1rem;
        }

        .form-select,
        .form-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
          background: white;
        }

        .form-select:focus,
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .day-btn {
          padding: 1rem 0.5rem;
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .day-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .day-btn:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .day-btn.active:hover {
          background: #2563eb;
        }

        .schedule-preview {
          background: #f0f9ff;
          border: 2px solid #bae6fd;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .schedule-preview h4 {
          margin: 0 0 0.5rem 0;
          color: #0369a1;
          font-size: 1.1rem;
        }

        .schedule-preview p {
          margin: 0;
          color: #475569;
          font-size: 1rem;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 0 0 20px 20px;
        }

        .btn-cancel {
          flex: 1;
          padding: 1rem 2rem;
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #d1d5db;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .btn-confirm {
          flex: 1;
          padding: 1rem 2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-confirm:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-confirm:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 1rem;
          }

          .schedule-modal {
            width: 100%;
            height: 95%;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-actions {
            padding: 1rem 1.5rem;
            flex-direction: column;
          }

          .days-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default ScheduleModal;