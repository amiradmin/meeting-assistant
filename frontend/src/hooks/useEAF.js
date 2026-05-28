// src/hooks/useEAF.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/eaf';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const useEAF = (furnaceId = 1, specificHeatId = null) => {
  const [heatData, setHeatData] = useState(null);
  const [energyData, setEnergyData] = useState([]);
  const [chargingData, setChargingData] = useState([]);
  const [delays, setDelays] = useState([]);
  const [electricalProfiles, setElectricalProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      let heat = null;

      if (specificHeatId) {
        const heatResponse = await axiosInstance.get(`/eaf/heats/${specificHeatId}/`);
        heat = heatResponse.data;
      } else {
        const heatsResponse = await axiosInstance.get(`/eaf/heats/?status__in=planned,melting,refining,tapping`);
        const heats = heatsResponse.data.results || heatsResponse.data;
        heat = heats[0] || null;
      }

      if (heat && isMounted.current) {
        setHeatData(heat);

        try {
          const [energyRes, chargingRes, delaysRes, profilesRes] = await Promise.all([
            axiosInstance.get(`/eaf/heats/${heat.id}/energy_data/`),
            axiosInstance.get(`/eaf/heats/${heat.id}/chargings/`),
            axiosInstance.get(`/eaf/delays/?heat=${heat.id}`),
            axiosInstance.get('/eaf/electrical-profiles/')
          ]);

          if (isMounted.current) {
            setEnergyData(energyRes.data.results || energyRes.data);
            setChargingData(chargingRes.data.results || chargingRes.data);
            setDelays(delaysRes.data.results || delaysRes.data);
            setElectricalProfiles(profilesRes.data.results || profilesRes.data);
          }
        } catch (err) {
          console.error('Error fetching related data:', err);
          if (isMounted.current) {
            setEnergyData([]);
            setChargingData([]);
            setDelays([]);
            setElectricalProfiles([]);
          }
        }
      } else if (isMounted.current) {
        setHeatData(null);
        setEnergyData([]);
        setChargingData([]);
        setDelays([]);
        setElectricalProfiles([]);
      }
    } catch (err) {
      console.error('Error fetching EAF data:', err);
      if (isMounted.current) {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [specificHeatId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const startMelting = useCallback(async () => {
    if (!heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const response = await axiosInstance.post(`/eaf/heats/${heatData.id}/start_melting/`);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error starting melting:', error);
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  }, [heatData, refreshData]);

  const changePhase = useCallback(async (phase) => {
    if (!heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const response = await axiosInstance.post(`/eaf/heats/${heatData.id}/change_phase/`, { phase });
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error changing phase:', error);
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  }, [heatData, refreshData]);

  const completeHeat = useCallback(async () => {
    if (!heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const response = await axiosInstance.post(`/eaf/heats/${heatData.id}/complete/`);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error completing heat:', error);
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  }, [heatData, refreshData]);

  const recordCharging = useCallback(async (chargingInfo) => {
    if (!heatData?.id) return { success: false, error: 'No active heat' };

    try {
      // Format the data correctly for the backend - DO NOT include heat field
      const payload = {
        charging_type: chargingInfo.charging_type || 'bucket',
        material: chargingInfo.material,
        weight: parseFloat(chargingInfo.weight),
        operator_name: chargingInfo.operator_name || ''
      };

      console.log('📤 Sending charging payload:', payload);

      const response = await axiosInstance.post(`/eaf/heats/${heatData.id}/record_charging/`, payload);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error recording charging:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.error ||
                       Object.values(error.response?.data || {}).join(', ') ||
                       error.message;
      return { success: false, error: errorMsg };
    }
  }, [heatData, refreshData]);

  const recordEnergy = useCallback(async (energyInfo) => {
    if (!heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const payload = {
        power_active: parseFloat(energyInfo.power_active || 0),
        power_reactive: parseFloat(energyInfo.power_reactive || 0),
        energy_consumed: parseFloat(energyInfo.energy_consumed || 0),
        electrode_position: parseFloat(energyInfo.electrode_position || 0),
        tap_position: parseInt(energyInfo.tap_position || 1),
        working_point: parseInt(energyInfo.working_point || 1)
      };

      const response = await axiosInstance.post(`/eaf/heats/${heatData.id}/record_energy/`, payload);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error recording energy:', error);
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  }, [heatData, refreshData]);

  const addDelay = useCallback(async (delayData) => {
    if (!heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const payload = {
        category: delayData.category,
        code: delayData.code,
        description: delayData.description,
        cause: delayData.cause || '',
        start_time: delayData.start_time || new Date().toISOString(),
        heat: heatData.id
      };

      const response = await axiosInstance.post('/eaf/delays/', payload);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding delay:', error);
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  }, [heatData, refreshData]);

  const endDelay = useCallback(async (delayId) => {
    try {
      const response = await axiosInstance.post(`/eaf/delays/${delayId}/end_delay/`);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error ending delay:', error);
      const errorMsg = error.response?.data?.error || error.message;
      return { success: false, error: errorMsg };
    }
  }, [refreshData]);

  return {
    heatData,
    energyData,
    chargingData,
    delays,
    electricalProfiles,
    loading,
    error,
    refreshData,
    startMelting,
    changePhase,
    completeHeat,
    recordCharging,
    recordEnergy,
    addDelay,
    endDelay,
  };
};