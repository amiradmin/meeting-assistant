import { useState, useEffect, useCallback } from "react";

const API_URL = "http://192.168.150.10:8000/api";

export const useAssetFailureData = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/pdm/predict_failures/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error("Failed to fetch asset failures:", err);
      setError("خطا در دریافت اطلاعات پیش‌بینی خرابی تجهیزات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, loading, error, refetch: fetchAssets };
};


