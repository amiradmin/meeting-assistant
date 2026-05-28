import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL =  "http://192.168.150.10:8000/api";

export const useEnergyData = () => {
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [errorAssets, setErrorAssets] = useState(null);

  const [energyData, setEnergyData] = useState([]);
  const [loadingEnergy, setLoadingEnergy] = useState(false);
  const [errorEnergy, setErrorEnergy] = useState(null);

  // Fetch all assets
  const fetchAssets = useCallback(async () => {
    setLoadingAssets(true);
    setErrorAssets(null);
    try {
      const response = await axios.get(`${API_URL}/assets/`);
      setAssets(response.data);
    } catch (err) {
      setErrorAssets(err.message || "Failed to fetch assets");
    } finally {
      setLoadingAssets(false);
    }
  }, []);

  // Fetch energy data for a specific asset
  const fetchEnergyData = useCallback(async (assetId) => {
    if (!assetId) return;
    setLoadingEnergy(true);
    setErrorEnergy(null);
    try {
      const response = await axios.get(`${API_URL}/energy/energy/asset/${assetId}/`);
      setEnergyData(response.data);
    } catch (err) {
      setErrorEnergy(err.message || "Failed to fetch energy data");
    } finally {
      setLoadingEnergy(false);
    }
  }, []);

  return {
    assets,
    loadingAssets,
    errorAssets,
    fetchAssets,
    energyData,
    loadingEnergy,
    errorEnergy,
    fetchEnergyData,
    setEnergyData,
  };
};
