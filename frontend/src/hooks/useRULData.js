// hooks/useRULData.js
import { useState, useCallback } from "react";
import axios from "axios";

export const useRULData = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRUL = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://192.168.150.10:8000/api/pdm/pdm-rul/");
      setAssets(res.data || []);
    } catch (err) {
      console.error("Error fetching RUL data", err);
      setError("خطا در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assets,
    loading,
    error,
    fetchRUL
  };
};