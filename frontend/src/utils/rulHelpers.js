// utils/rulHelpers.js

// Helper functions only - no JSX
export const getRULPercent = (predicted, MAX_RUL = 300) =>
  Math.min((predicted / MAX_RUL) * 100, 100);

export const getRULStatus = (percent) => {
  if (percent <= 30) return { color: "#e74c3c", label: "بحرانی", icon: "critical" };
  if (percent <= 60) return { color: "#f39c12", label: "هشدار", icon: "warning" };
  return { color: "#2ecc71", label: "ایمن", icon: "safe" };
};

export const getPriority = (percent) =>
  percent <= 30 ? "high" : percent <= 60 ? "medium" : "low";

export const formatRULText = (hours) => {
  if (!hours || hours <= 0) return "۰ ساعت";
  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const remMinutes = totalMinutes % (24 * 60);
  const remHours = Math.floor(remMinutes / 60);
  const minutes = remMinutes % 60;

  let text = "";
  if (days) text += `${days} روز`;
  if (remHours) text += ` ${remHours} ساعت`;
  if (minutes) text += ` ${minutes} دقیقه`;
  return text.trim();
};