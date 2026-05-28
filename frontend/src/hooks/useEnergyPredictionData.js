import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL =  "http://192.168.150.10:8000/api";

export const useEnergyPredictionData = () => {
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [errorAssets, setErrorAssets] = useState(null);

  const [predictions, setPredictions] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [errorPredictions, setErrorPredictions] = useState(null);

  // Fetch all assets
  const fetchAssets = useCallback(async () => {
    setLoadingAssets(true);
    setErrorAssets(null);
    try {
      const res = await axios.get(`${API_URL}/assets/assets/`);
      setAssets(res.data);
    } catch (err) {
      setErrorAssets(err.message || "Failed to fetch assets");
    } finally {
      setLoadingAssets(false);
    }
  }, []);

  // Fetch predictions for a given datetime
  const fetchPredictions = useCallback(async (datetime) => {
    setLoadingPredictions(true);
    setErrorPredictions(null);
    try {
      const isoDate = datetime.toISOString();
      const res = await axios.get(`${API_URL}/energy/energy-predictions/?timestamp=${isoDate}`);
      setPredictions(res.data);
    } catch (err) {
      setErrorPredictions(err.message || "Failed to fetch predictions");
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  // NEW: Fetch prediction history (latest predictions)
  const fetchPredictionHistory = useCallback(async () => {
    setLoadingPredictions(true);
    setErrorPredictions(null);
    try {
      const res = await axios.get(`${API_URL}/energy/energy-predictions-history/`);
      setPredictions(res.data);
    } catch (err) {
      setErrorPredictions(err.message || "Failed to fetch prediction history");
      setPredictions([]);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  return {
    assets,
    loadingAssets,
    errorAssets,
    fetchAssets,
    predictions,
    loadingPredictions,
    errorPredictions,
    fetchPredictions,
    fetchPredictionHistory, // NEW: Export the new function
  };
};