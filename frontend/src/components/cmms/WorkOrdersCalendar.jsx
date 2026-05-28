// src/components/cmms/WorkOrdersCalendar.jsx
import React, { useState } from "react";
import { FaChevronRight, FaChevronLeft, FaRobot, FaGripVertical } from "react-icons/fa";
import './WorkOrdersCalendar.css';

// Jalali calendar utilities
const jalaliDateUtils = {
  // Convert Gregorian to Jalali
  toJalali: (date) => {
    const gDate = new Date(date);
    const gYear = gDate.getFullYear();
    const gMonth = gDate.getMonth() + 1;
    const gDay = gDate.getDate();

    let jYear = gYear - 621;
    let jMonth, jDay;

    const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0) {
      gDaysInMonth[1] = 29;
    }

    let gy2 = gYear - 1;
    const gDayNo = gDaysInMonth.slice(0, gMonth - 1).reduce((a, b) => a + b, 0) + gDay;

    let jDayNo = gDayNo - 79;
    if (jDayNo <= 0) {
      jYear--;
      jDayNo += 365;
      if ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0) {
        jDayNo++;
      }
    }

    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    if ((jYear % 4 === 0 && jYear % 100 !== 0) || jYear % 400 === 0) {
      jDaysInMonth[11] = 30;
    }

    for (jMonth = 0; jMonth < 12; jMonth++) {
      if (jDayNo <= jDaysInMonth[jMonth]) {
        break;
      }
      jDayNo -= jDaysInMonth[jMonth];
    }

    jMonth++;
    jDay = jDayNo;

    return {
      year: jYear,
      month: jMonth,
      day: jDay,
      date: new Date(date)
    };
  },

  // Convert Jalali to Gregorian
  toGregorian: (jYear, jMonth, jDay) => {
    jMonth--;

    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    if ((jYear % 4 === 0 && jYear % 100 !== 0) || jYear % 400 === 0) {
      jDaysInMonth[11] = 30;
    }

    let jDayNo = jDay;
    for (let i = 0; i < jMonth; i++) {
      jDayNo += jDaysInMonth[i];
    }

    let gYear = jYear + 621;
    const gy2 = gYear - 1;
    let gDayNo = jDayNo + 79;

    const gDaysInYear = ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0) ? 366 : 365;
    if (gDayNo > gDaysInYear) {
      gDayNo -= gDaysInYear;
      gYear++;
    }

    const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0) {
      gDaysInMonth[1] = 29;
    }

    let gMonth = 0;
    while (gDayNo > gDaysInMonth[gMonth]) {
      gDayNo -= gDaysInMonth[gMonth];
      gMonth++;
    }

    gMonth++;

    // Create date with time set to noon to avoid timezone issues
    const gregorianDate = new Date(gYear, gMonth - 1, gDayNo, 12, 0, 0);

    return gregorianDate;
  },

  // Get Jalali month names
  getMonthName: (month) => {
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    return monthNames[month - 1];
  },

  // Get week days
  getWeekDays: () => ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],

  getFullWeekDays: () => ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],

  // Format Jalali date for display
  formatDate: (date) => {
    const jDate = jalaliDateUtils.toJalali(date);
    return `${jalaliDateUtils.toPersianNumber(jDate.day)} ${jalaliDateUtils.getMonthName(jDate.month)} ${jalaliDateUtils.toPersianNumber(jDate.year)}`;
  },

  // Convert numbers to Persian
  toPersianNumber: (num) => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, d => persianNumbers[parseInt(d)]);
  },

  // Get days in Jalali month
  getDaysInJalaliMonth: (year, month) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Esfand
    return ((year % 4 === 3) && (year % 33 !== 0)) || (year % 33 === 1) ? 30 : 29;
  },

  // Get first day of Jalali month (0-6, starting from Shanbe)
  getFirstDayOfJalaliMonth: (year, month) => {
    const firstGregorian = jalaliDateUtils.toGregorian(year, month, 1);
    return (firstGregorian.getDay() + 1) % 7; // Convert to Jalali week start (Shanbe)
  },

  // Format date to YYYY-MM-DD format for API
  formatDateForAPI: (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

const WorkOrdersCalendar = ({ workOrders, onWorkOrderClick, onWorkOrderUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [draggedWorkOrder, setDraggedWorkOrder] = useState(null);

  // Get current Jalali date
  const getCurrentJalaliDate = () => {
    return jalaliDateUtils.formatDate(new Date());
  };

  // Get current Jalali month and year
  const getCurrentJalaliMonthYear = () => {
    const jDate = jalaliDateUtils.toJalali(currentDate);
    return {
      month: jalaliDateUtils.getMonthName(jDate.month),
      year: jalaliDateUtils.toPersianNumber(jDate.year)
    };
  };

  // Navigation functions
  const navigateMonth = (direction) => {
    const jDate = jalaliDateUtils.toJalali(currentDate);
    let newMonth = jDate.month + direction;
    let newYear = jDate.year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    const newGregorian = jalaliDateUtils.toGregorian(newYear, newMonth, 1);
    setCurrentDate(newGregorian);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  // Get work orders for a specific Jalali date
  const getWorkOrdersForDate = (jYear, jMonth, jDay) => {
    return workOrders.filter(wo => {
      if (!wo.due_date) return false;

      try {
        const dueDate = new Date(wo.due_date);
        const jDueDate = jalaliDateUtils.toJalali(dueDate);

        return (
          jDueDate.year === jYear &&
          jDueDate.month === jMonth &&
          jDueDate.day === jDay
        );
      } catch (error) {
        console.error('Error parsing date:', wo.due_date);
        return false;
      }
    });
  };

  // Check if a Jalali date is today
  const isToday = (jYear, jMonth, jDay) => {
    const today = new Date();
    const jToday = jalaliDateUtils.toJalali(today);

    return (
      jYear === jToday.year &&
      jMonth === jToday.month &&
      jDay === jToday.day
    );
  };

  // Enhanced drag and drop handlers
  const handleDragStart = (e, workOrder) => {
    setDraggedWorkOrder(workOrder);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData('text/plain', workOrder.id); // Important for some browsers
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    // Don't clear draggedWorkOrder here - wait for drop
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add('drop-target');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drop-target');
  };

  const handleDrop = (e, jYear, jMonth, jDay) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-target');

    if (!draggedWorkOrder) {
      console.log('No work order being dragged');
      return;
    }

    try {
      console.log('Dropping on Jalali date:', { jYear, jMonth, jDay });

      // Convert Jalali date to Gregorian for storage
      const targetGregorian = jalaliDateUtils.toGregorian(jYear, jMonth, jDay);

      console.log('Converted to Gregorian:', targetGregorian);

      if (isNaN(targetGregorian.getTime())) {
        console.error('Invalid date conversion');
        return;
      }

      // Format the date properly
      const formattedDate = jalaliDateUtils.formatDateForAPI(targetGregorian);
      const isoDateString = `${formattedDate}T12:00:00Z`;

      console.log('Final date string:', isoDateString);

      // Update the work order due date
      const updatedWorkOrder = {
        ...draggedWorkOrder,
        due_date: isoDateString
      };

      console.log('Updated work order:', updatedWorkOrder);

      if (onWorkOrderUpdate) {
        onWorkOrderUpdate(updatedWorkOrder);
      } else {
        console.warn('onWorkOrderUpdate callback not provided');
      }

    } catch (error) {
      console.error('Error in drop handler:', error);
    } finally {
      setDraggedWorkOrder(null);
    }
  };

  // Status and priority styling
  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'in_progress': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#6b7280',
      'on_hold': '#8b5cf6',
      'assigned': '#f97316'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'urgent': '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const getPriorityText = (priority) => {
    const texts = {
      'low': 'کم',
      'medium': 'متوسط',
      'high': 'بالا',
      'urgent': 'فوری'
    };
    return texts[priority] || priority;
  };

  // Month view rendering for Jalali calendar
  const renderMonthView = () => {
    const jCurrent = jalaliDateUtils.toJalali(currentDate);
    const jYear = jCurrent.year;
    const jMonth = jCurrent.month;

    const daysInMonth = jalaliDateUtils.getDaysInJalaliMonth(jYear, jMonth);
    const firstDay = jalaliDateUtils.getFirstDayOfJalaliMonth(jYear, jMonth);

    const weeks = [];
    let days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const todayClass = isToday(jYear, jMonth, day) ? 'today' : '';
      const persianDay = jalaliDateUtils.toPersianNumber(day);
      const dayWorkOrders = getWorkOrdersForDate(jYear, jMonth, day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${todayClass}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, jYear, jMonth, day)}
          data-date={`${jYear}-${jMonth}-${day}`}
        >
          <div className="day-header">
            <span className="day-number">{persianDay}</span>
            {isToday(jYear, jMonth, day) && (
              <div className="today-badge">
                <span>امروز</span>
              </div>
            )}
          </div>
          <div className="work-orders-list">
            {dayWorkOrders.map(wo => (
              <div
                key={wo.id}
                className="work-order-item"
                onClick={() => onWorkOrderClick(wo)}
                draggable
                onDragStart={(e) => handleDragStart(e, wo)}
                onDragEnd={handleDragEnd}
                style={{
                  borderLeftColor: getStatusColor(wo.status),
                  backgroundColor: getStatusColor(wo.status) + '15'
                }}
              >
                <div className="wo-drag-handle">
                  <FaGripVertical />
                </div>
                <div className="wo-content">
                  <div className="wo-title">{wo.title}</div>
                  <div className="wo-meta">
                    <span
                      className="wo-priority"
                      style={{ color: getPriorityColor(wo.priority) }}
                    >
                      {getPriorityText(wo.priority)}
                    </span>
                    {wo.is_ai_created && <FaRobot className="ai-icon" title="ایجاد شده توسط هوش مصنوعی" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      if (days.length === 7) {
        weeks.push(<div key={weeks.length} className="calendar-week">{days}</div>);
        days = [];
      }
    }

    // Add empty cells for remaining days in the last week
    if (days.length > 0) {
      while (days.length < 7) {
        days.push(<div key={`empty-end-${days.length}`} className="calendar-day empty"></div>);
      }
      weeks.push(<div key={weeks.length} className="calendar-week">{days}</div>);
    }

    return weeks;
  };

  // Week view rendering for Jalali calendar
  const renderWeekView = () => {
    const jCurrent = jalaliDateUtils.toJalali(currentDate);
    const startGregorian = jalaliDateUtils.toGregorian(jCurrent.year, jCurrent.month, jCurrent.day);

    // Adjust to start of week (Saturday)
    const startOfWeek = new Date(startGregorian);
    const dayOfWeek = (startGregorian.getDay() + 1) % 7; // Convert to Jalali week
    startOfWeek.setDate(startGregorian.getDate() - dayOfWeek);

    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const jDate = jalaliDateUtils.toJalali(date);
      const dayWorkOrders = getWorkOrdersForDate(jDate.year, jDate.month, jDate.day);
      const todayClass = isToday(jDate.year, jDate.month, jDate.day) ? 'today' : '';
      const persianDay = jalaliDateUtils.toPersianNumber(jDate.day);
      const jalaliDate = jalaliDateUtils.formatDate(date);

      weekDays.push(
        <div
          key={i}
          className={`week-day ${todayClass}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, jDate.year, jDate.month, jDate.day)}
          data-date={`${jDate.year}-${jDate.month}-${jDate.day}`}
        >
          <div className="day-header">
            <div className="day-name">{jalaliDateUtils.getFullWeekDays()[i]}</div>
            <div className="day-number">
              {persianDay}
              <div className="persian-date">{jalaliDate}</div>
            </div>
            {todayClass && (
              <div className="today-badge">
                <span>امروز</span>
              </div>
            )}
          </div>
          <div className="work-orders-list">
            {dayWorkOrders.map(wo => (
              <div
                key={wo.id}
                className="work-order-item"
                onClick={() => onWorkOrderClick(wo)}
                draggable
                onDragStart={(e) => handleDragStart(e, wo)}
                onDragEnd={handleDragEnd}
                style={{
                  borderLeftColor: getStatusColor(wo.status),
                  backgroundColor: getStatusColor(wo.status) + '15'
                }}
              >
                <div className="wo-drag-handle">
                  <FaGripVertical />
                </div>
                <div className="wo-content">
                  <div className="wo-title">{wo.title}</div>
                  <div className="wo-time">
                    {wo.due_date && new Date(wo.due_date).toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="wo-meta">
                    <span
                      className="wo-priority"
                      style={{ color: getPriorityColor(wo.priority) }}
                    >
                      {getPriorityText(wo.priority)}
                    </span>
                    {wo.is_ai_created && <FaRobot className="ai-icon" title="ایجاد شده توسط هوش مصنوعی" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="week-view">{weekDays}</div>;
  };

  const jalaliMonthYear = getCurrentJalaliMonthYear();

  return (
    <div className="workorders-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-info">
          <div className="current-date">
            <span className="today-label">امروز:</span>
            <span className="persian-today">{getCurrentJalaliDate()}</span>
          </div>
        </div>

        <div className="calendar-navigation">
          <button
            onClick={() => view === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
            className="nav-btn"
          >
            <FaChevronRight />
          </button>

          <div className="current-period">
            <span className="month-name">{jalaliMonthYear.month}</span>
            <span className="year">{jalaliMonthYear.year}</span>
          </div>

          <button
            onClick={() => view === 'month' ? navigateMonth(1) : navigateWeek(1)}
            className="nav-btn"
          >
            <FaChevronLeft />
          </button>
        </div>

        <div className="calendar-controls">
          <div className="view-switcher">
            <button
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => setView('month')}
            >
              ماهانه
            </button>
            <button
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => setView('week')}
            >
              هفتگی
            </button>
          </div>

          <div className="drag-instruction">
            <FaGripVertical />
            <span>برای تغییر تاریخ، کارها را بکشید و رها کنید</span>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="calendar-body">
        {view === 'month' && (
          <>
            <div className="calendar-week-header">
              {jalaliDateUtils.getWeekDays().map(day => (
                <div key={day} className="week-day-header">{day}</div>
              ))}
            </div>
            <div className="month-view">
              {renderMonthView()}
            </div>
          </>
        )}

        {view === 'week' && renderWeekView()}
      </div>
    </div>
  );
};

export default WorkOrdersCalendar;