// src/services/cmmsService.js
import { useState, useEffect, useCallback } from "react";

const API_URL = "http://192.168.150.10:8000/api";

// ------------------- PM Schedules -------------------
export const getPMSchedules = async () => {
  const res = await fetch(`${API_URL}/cmms/pm-schedules/`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "خطا در دریافت PM Schedules");
  }
  return await res.json();
};

export const createPMSchedule = async (data) => {
  console.log("Creating PM Schedule with data:", data);

  const res = await fetch(`${API_URL}/cmms/pm-schedules/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error('Server validation errors:', errorData);
    throw new Error(errorData.detail || JSON.stringify(errorData) || "خطا در ایجاد PM Schedule");
  }

  return await res.json();
};

export const updatePMSchedule = async (id, data) => {
  const res = await fetch(`${API_URL}/cmms/pm-schedules/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error('Server validation errors:', errorData);
    throw new Error(errorData.detail || JSON.stringify(errorData) || "خطا در به‌روزرسانی PM Schedule");
  }

  return await res.json();
};

export const deletePMSchedule = async (id) => {
  const res = await fetch(`${API_URL}/cmms/pm-schedules/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("خطا در حذف PM Schedule");
  return true;
};

// ------------------- Work Orders -------------------
export const getWorkOrders = async () => {
  const res = await fetch(`${API_URL}/cmms/workorders/`);
  if (!res.ok) throw new Error("خطا در دریافت Work Orders");
  return await res.json();
};

// In cmmsService.js - update createWorkOrder function
export const createWorkOrder = async (data) => {
  console.log('Creating Work Order with data:', data);

  const res = await fetch(`${API_URL}/cmms/workorders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error('Server validation errors:', errorData);
    throw new Error(JSON.stringify(errorData) || "خطا در ایجاد دستور کار");
  }

  return await res.json();
};

export const updateWorkOrder = async (id, data) => {
  const res = await fetch(`${API_URL}/cmms/workorders/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("خطا در به‌روزرسانی دستور کار");
  return await res.json();
};

export const deleteWorkOrder = async (id) => {
  const res = await fetch(`${API_URL}/cmms/workorders/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("خطا در حذف دستور کار");
  return true;
};

// ------------------- Assets -------------------
export const getAssets = async () => {
  const res = await fetch(`${API_URL}/assets/assets/`);
  if (!res.ok) throw new Error("خطا در دریافت دارایی‌ها");
  return await res.json();
};

// ------------------- Spare Parts -------------------
export const getSpareParts = async () => {
  const response = await fetch(`${API_URL}/cmms/spareparts/`);
  if (!response.ok) throw new Error('خطا در دریافت لیست قطعات');
  return response.json();
};

export const createSparePart = async (data) => {
  const response = await fetch(`${API_URL}/cmms/spareparts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('خطا در ایجاد قطعه');
  return response.json();
};

export const updateSparePart = async (id, data) => {
  const response = await fetch(`${API_URL}/cmms/spareparts/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('خطا در بروزرسانی قطعه');
  return response.json();
};

export const deleteSparePart = async (id) => {
  const response = await fetch(`${API_URL}/cmms/spareparts/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('خطا در حذف قطعه');
  return response.json();
};

// ------------------- Locations -------------------
export const getLocations = async () => {
  const response = await fetch(`${API_URL}/employees/locations/`);
  if (!response.ok) throw new Error('خطا در دریافت لیست موقعیت‌ها');
  return response.json();
};

// ------------------- Employees/Users -------------------
export const getEmployees = async () => {
  const response = await fetch(`${API_URL}/employees/employees/`);
  if (!response.ok) throw new Error('خطا در دریافت لیست پرسنل');
  return response.json();
};

export const createEmployee = async (data) => {
  const response = await fetch(`${API_URL}/employees/employees/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('خطا در ایجاد پرسنل');
  return response.json();
};

export const updateEmployee = async (id, data) => {
  const response = await fetch(`${API_URL}/employees/employees/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('خطا در بروزرسانی پرسنل');
  return response.json();
};

export const deleteEmployee = async (id) => {
  const response = await fetch(`${API_URL}/employees/employees/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('خطا در حذف پرسنل');
  return response.json();
};

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/employees/employees/`);
    if (!response.ok) {
      // If employees endpoint doesn't exist, try users endpoint
      const userResponse = await fetch(`${API_URL}/users/`);
      if (!userResponse.ok) {
        console.warn('Users/Employees endpoints not found, returning empty array');
        return [];
      }
      return await userResponse.json();
    }

    const employees = await response.json();
    // Transform employees to match the expected user structure
    return employees.map(employee => ({
      id: employee.id,
      username: employee.full_name,
      first_name: employee.full_name,
      last_name: "",
      full_name: employee.full_name,
      role: employee.role,
      department: employee.department,
      mobile: employee.mobile,
      email: employee.email,
      is_active: employee.is_active
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// ------------------- React Hook for Assets -------------------
export const useAssetFailureData = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
      setError("خطا در دریافت دارایی‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
};


// ------------------- Anomaly Detection -------------------
export const getLatestAnomalies = async () => {
  const res = await fetch(`${API_URL}/pdm/anomalies/records/`);
  if (!res.ok) throw new Error("خطا در دریافت داده‌های آنومالی");
  return await res.json();
};

export const getAnomaliesByAsset = async (assetId) => {
  const res = await fetch(`${API_URL}/pdm/anomalies/?asset_id=${assetId}`);
  if (!res.ok) throw new Error("خطا در دریافت آنومالی‌های تجهیز");
  return await res.json();
};

export const getAnomalyStats = async () => {
  const res = await fetch(`${API_URL}/pdm/anomalies/stats/`);
  if (!res.ok) throw new Error("خطا در دریافت آمار آنومالی");
  return await res.json();
};