// utils/helpers.js
export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path; // already full URL
  return `http://192.168.150.10:8000${path}`;
};


export const formatPersianDateTime = (ts) => {
  const date = new Date(ts);
  if (isNaN(date)) return "-";
  return date.toLocaleString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};