// src/components/cmms/PMSchedulesCalendar.jsx
import React, { useState, useMemo } from "react";
import { FaCalendarAlt, FaList, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

export default function PMSchedulesCalendar({ pmSchedules, onEdit, onViewDetails }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // "month" or "list"

  // Get month and year for navigation
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get PM schedules for the current month
  const schedulesForMonth = useMemo(() => {
    return pmSchedules.filter(schedule => {
      if (!schedule.next_due_date) return false;

      const dueDate = new Date(schedule.next_due_date);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    });
  }, [pmSchedules, currentMonth, currentYear]);

  // Get all dates for the current month
  const monthDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const daySchedules = schedulesForMonth.filter(schedule => {
        const dueDate = new Date(schedule.next_due_date);
        return dueDate.getDate() === i;
      });

      days.push({
        date,
        day: i,
        schedules: daySchedules,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    return days;
  }, [currentYear, currentMonth, schedulesForMonth]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get status for a schedule
  const getScheduleStatus = (schedule) => {
    if (!schedule.next_due_date) return "unknown";

    const dueDate = new Date(schedule.next_due_date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 3) return "due-soon";
    return "upcoming";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
        return <FaExclamationTriangle className="text-red-500" />;
      case "due-soon":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaCheckCircle className="text-green-500" />;
    }
  };

  // Persian month names
  const persianMonths = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  if (view === "list") {
    return (
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <div className="view-controls">
            <button
              className={`view-btn ${view === "month" ? "active" : ""}`}
              onClick={() => setView("month")}
            >
              <FaCalendarAlt />
              <span>نمایش تقویم</span>
            </button>
            <button
              className={`view-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              <FaList />
              <span>نمایش لیست</span>
            </button>
          </div>

          <div className="month-navigation">
            <button onClick={goToPreviousMonth} className="nav-btn">
              <FaChevronRight />
            </button>
            <h2 className="month-title">
              {persianMonths[currentMonth]} {currentYear}
            </h2>
            <button onClick={goToNextMonth} className="nav-btn">
              <FaChevronLeft />
            </button>
            <button onClick={goToToday} className="today-btn">
              امروز
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="list-view">
          {schedulesForMonth.length === 0 ? (
            <div className="empty-state">
              <FaCalendarAlt className="empty-icon" />
              <p>هیچ برنامه‌ای برای این ماه وجود ندارد</p>
            </div>
          ) : (
            <div className="schedule-list">
              {schedulesForMonth.map(schedule => {
                const status = getScheduleStatus(schedule);
                const dueDate = new Date(schedule.next_due_date);

                return (
                  <div key={schedule.id} className="schedule-item">
                    <div className="schedule-date">
                      <span className="date-day">{dueDate.getDate()}</span>
                      <span className="date-month">{persianMonths[dueDate.getMonth()]}</span>
                    </div>

                    <div className="schedule-info">
                      <h4 className="schedule-name">{schedule.name}</h4>
                      <p className="schedule-asset">{schedule.asset?.name}</p>
                      <div className="schedule-meta">
                        <span className="frequency">تناوب: {schedule.frequency_days} روز</span>
                        {schedule.estimated_hours > 0 && (
                          <span className="hours">زمان تخمینی: {schedule.estimated_hours} ساعت</span>
                        )}
                      </div>
                    </div>

                    <div className="schedule-status">
                      <div className={`status-badge ${status}`}>
                        {getStatusIcon(status)}
                        <span>
                          {status === "overdue" && "معوقه"}
                          {status === "due-soon" && "به زودی"}
                          {status === "upcoming" && "آینده"}
                        </span>
                      </div>
                    </div>

                    <div className="schedule-actions">
                      <button
                        onClick={() => onEdit(schedule)}
                        className="action-btn edit-btn"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => onViewDetails && onViewDetails(schedule)}
                        className="action-btn view-btn"
                      >
                        مشاهده
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div className="view-controls">
          <button
            className={`view-btn ${view === "month" ? "active" : ""}`}
            onClick={() => setView("month")}
          >
            <FaCalendarAlt />
            <span>نمایش تقویم</span>
          </button>
          <button
            className={`view-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            <FaList />
            <span>نمایش لیست</span>
          </button>
        </div>

        <div className="month-navigation">
          <button onClick={goToPreviousMonth} className="nav-btn">
            <FaChevronRight />
          </button>
          <h2 className="month-title">
            {persianMonths[currentMonth]} {currentYear}
          </h2>
          <button onClick={goToNextMonth} className="nav-btn">
            <FaChevronLeft />
          </button>
          <button onClick={goToToday} className="today-btn">
            امروز
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Week Days Header */}
        <div className="week-days">
          {weekDays.map(day => (
            <div key={day} className="week-day">
              {day}
            </div>
          ))}
        </div>

        {/* Month Days */}
        <div className="month-days">
          {monthDays.map(day => (
            <div
              key={day.day}
              className={`calendar-day ${day.isToday ? "today" : ""} ${
                day.schedules.length > 0 ? "has-schedules" : ""
              }`}
            >
              <div className="day-number">{day.day}</div>

              {day.schedules.length > 0 && (
                <div className="day-schedules">
                  {day.schedules.slice(0, 3).map(schedule => {
                    const status = getScheduleStatus(schedule);
                    return (
                      <div
                        key={schedule.id}
                        className={`schedule-badge ${status}`}
                        onClick={() => onEdit(schedule)}
                        title={`${schedule.name} - ${schedule.asset?.name}`}
                      >
                        {getStatusIcon(status)}
                        <span className="schedule-title">
                          {schedule.name.length > 15
                            ? schedule.name.substring(0, 15) + "..."
                            : schedule.name
                          }
                        </span>
                      </div>
                    );
                  })}

                  {day.schedules.length > 3 && (
                    <div className="more-schedules">
                      +{day.schedules.length - 3} بیشتر
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <FaExclamationTriangle className="text-red-500" />
          <span>معوقه</span>
        </div>
        <div className="legend-item">
          <FaClock className="text-yellow-500" />
          <span>به زودی (۳ روز)</span>
        </div>
        <div className="legend-item">
          <FaCheckCircle className="text-green-500" />
          <span>آینده</span>
        </div>
      </div>

      <style jsx>{`
        .calendar-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .view-controls {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          color: #374151;
        }

        .view-btn.active {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
        }

        .view-btn:hover:not(.active) {
          background: #f3f4f6;
        }

        .month-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #374151;
        }

        .nav-btn:hover {
          background: #f3f4f6;
        }

        .month-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          min-width: 200px;
          text-align: center;
        }

        .today-btn {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          color: #374151;
        }

        .today-btn:hover {
          background: #f3f4f6;
        }

        /* Calendar Grid */
        .calendar-grid {
          padding: 1rem;
        }

        .week-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1rem;
        }

        .week-day {
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #374151;
          background: #f8fafc;
          border-radius: 8px;
        }

        .month-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e5e7eb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .calendar-day {
          background: white;
          min-height: 120px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .calendar-day.today {
          background: #fffbeb;
        }

        .calendar-day.has-schedules {
          background: #f0fdf4;
        }

        .day-number {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .day-schedules {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .schedule-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .schedule-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .schedule-badge.overdue {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .schedule-badge.due-soon {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fed7aa;
        }

        .schedule-badge.upcoming {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .schedule-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .more-schedules {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
          padding: 0.25rem;
          background: #f3f4f6;
          border-radius: 4px;
        }

        /* List View */
        .list-view {
          padding: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .schedule-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .schedule-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .date-day {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .date-month {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .schedule-info {
          flex: 1;
        }

        .schedule-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .schedule-asset {
          margin: 0 0 0.5rem 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .schedule-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .schedule-status {
          margin-right: auto;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.overdue {
          background: #fef2f2;
          color: #dc2626;
        }

        .status-badge.due-soon {
          background: #fffbeb;
          color: #d97706;
        }

        .status-badge.upcoming {
          background: #f0fdf4;
          color: #16a34a;
        }

        .schedule-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .action-btn.edit-btn {
          color: #d97706;
          border-color: #fed7aa;
        }

        .action-btn.edit-btn:hover {
          background: #fffbeb;
        }

        .action-btn.view-btn {
          color: #0369a1;
          border-color: #bae6fd;
        }

        .action-btn.view-btn:hover {
          background: #f0f9ff;
        }

        /* Legend */
        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 2rem;
          padding: 1rem 2rem;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .calendar-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .month-navigation {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .calendar-day {
            min-height: 100px;
          }

          .schedule-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .schedule-status {
            margin-right: 0;
          }

          .schedule-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .calendar-legend {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }
        }

        @media (max-width: 640px) {
          .month-days {
            grid-template-columns: repeat(1, 1fr);
          }

          .calendar-day {
            min-height: auto;
            padding: 1rem;
          }

          .view-controls {
            flex-direction: column;
            width: 100%;
          }

          .view-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}