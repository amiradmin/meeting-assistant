const API_URL =  "http://192.168.150.10:8000/api";

// ------------------- Prediction Update Services -------------------
export const getPredictionUpdates = async () => {
  const res = await fetch(`${API_URL}/prediction-updates/`);
  if (!res.ok) throw new Error("خطا در دریافت داده‌های پیش‌بینی");
  return await res.json();
};

export const getPredictionByType = async (type) => {
  const res = await fetch(`${API_URL}/prediction-updates/get-by-type/?type=${type}`);
  if (!res.ok) throw new Error(`خطا در دریافت داده‌های ${type}`);
  return await res.json();
};

export const updatePredictionStatus = async (id, status, progress = 0, errorMessage = null) => {
  const res = await fetch(`${API_URL}/prediction-updates/${id}/update_status/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, progress, error_message: errorMessage }),
  });
  if (!res.ok) throw new Error("خطا در به‌روزرسانی وضعیت");
  return await res.json();
};

export const setPredictionSchedule = async (id, scheduleConfig) => {
  const res = await fetch(`${API_URL}/prediction-updates/${id}/set_schedule/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schedule_config: scheduleConfig }),
  });
  if (!res.ok) throw new Error("خطا در تنظیم برنامه");
  return await res.json();
};

export const clearPredictionSchedule = async (id) => {
  const res = await fetch(`${API_URL}/prediction-updates/${id}/clear_schedule/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("خطا در حذف برنامه");
  return await res.json();
};

// ------------------- AI Prediction Services -------------------
export const startAnomalyPrediction = async () => {
  const res = await fetch(`${API_URL}/anomalies/latest/`);
  if (!res.ok) throw new Error("خطا در شروع پیش‌بینی آنومالی");
  return await res.json();
};

export const startMaintenancePrediction = async () => {
  const res = await fetch(`${API_URL}/maintenance/predict/`);
  if (!res.ok) throw new Error("خطا در شروع پیش‌بینی تعمیرات");
  return await res.json();
};

export const startEfficiencyPrediction = async () => {
  const res = await fetch(`${API_URL}/efficiency/predict/`);
  if (!res.ok) throw new Error("خطا در شروع پیش‌بینی راندمان");
  return await res.json();
};

export const startLifetimePrediction = async () => {
  const res = await fetch(`${API_URL}/lifetime/predict/`);
  if (!res.ok) throw new Error("خطا در شروع پیش‌بینی عمر مفید");
  return await res.json();
};