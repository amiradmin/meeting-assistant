import { toJalaali, toGregorian, isLeapJalaaliYear, jalaaliMonthLength } from 'jalaali-js';

// Persian calendar utilities
export const persianDaysOfWeek = [
  { id: 0, name: 'شنبه' },
  { id: 1, name: 'یکشنبه' },
  { id: 2, name: 'دوشنبه' },
  { id: 3, name: 'سه‌شنبه' },
  { id: 4, name: 'چهارشنبه' },
  { id: 5, name: 'پنجشنبه' },
  { id: 6, name: 'جمعه' }
];

// Convert Gregorian to Jalali
export const toJalali = (date) => {
  const gregorianDate = new Date(date);
  const jalaali = toJalaali(
    gregorianDate.getFullYear(),
    gregorianDate.getMonth() + 1,
    gregorianDate.getDate()
  );
  return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
};

// Convert Jalali to Gregorian
export const fromJalali = (jalaliDate) => {
  const [year, month, day] = jalaliDate.split('/').map(Number);
  const gregorian = toGregorian(year, month, day);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
};

// Get current Jalali date
export const getCurrentJalaliDate = () => {
  const now = new Date();
  const jalaali = toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;
};

// Format date for display
export const formatJalaliDate = (date, includeTime = false) => {
  const d = new Date(date);
  const jalaali = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const dateStr = `${jalaali.jy}/${String(jalaali.jm).padStart(2, '0')}/${String(jalaali.jd).padStart(2, '0')}`;

  if (includeTime) {
    const timeStr = d.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} ${timeStr}`;
  }
  return dateStr;
};

// Validate Jalali date
export const isValidJalaliDate = (dateString) => {
  try {
    const [year, month, day] = dateString.split('/').map(Number);
    if (!year || !month || !day) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > jalaaliMonthLength(year, month)) return false;
    return true;
  } catch {
    return false;
  }
};

// Get current date object
export const getCurrentDate = () => {
  return new Date();
};

// Convert date to Jalali array [year, month, day]
export const toJalaliArray = (date) => {
  const d = new Date(date);
  const jalaali = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return [jalaali.jy, jalaali.jm, jalaali.jd];
};

// Convert Jalali array to Gregorian date
export const fromJalaliArray = (jalaaliArray) => {
  const [jy, jm, jd] = jalaaliArray;
  const gregorian = toGregorian(jy, jm, jd);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
};