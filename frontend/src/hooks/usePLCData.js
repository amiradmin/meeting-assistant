import { useState, useEffect, useCallback } from 'react';
import { plcApi } from '../services/plcApi';
import toast from 'react-hot-toast';

export const usePLCData = (tags = null, interval = 2000) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await plcApi.readTags(tags);
      if (result.success) {
        setData(result.data);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch PLC data');
    } finally {
      setLoading(false);
    }
  }, [tags]);

  const connect = useCallback(async () => {
    try {
      const result = await plcApi.connect();
      if (result.success) {
        setIsConnected(true);
        toast.success('Connected to PLC');
        await fetchData();
      } else {
        toast.error('Failed to connect to PLC');
      }
    } catch (err) {
      toast.error('Connection error: ' + err.message);
    }
  }, [fetchData]);

  const disconnect = useCallback(async () => {
    try {
      await plcApi.disconnect();
      setIsConnected(false);
      setData({});
      toast.success('Disconnected from PLC');
    } catch (err) {
      toast.error('Disconnect error: ' + err.message);
    }
  }, []);

  const writeValue = useCallback(async (tag, value) => {
    try {
      const result = await plcApi.writeTag(tag, value);
      if (result.success) {
        toast.success(`${tag} set to ${value}`);
        await fetchData();
        return true;
      } else {
        toast.error(`Failed to write ${tag}: ${result.error}`);
        return false;
      }
    } catch (err) {
      toast.error(`Write error: ${err.message}`);
      return false;
    }
  }, [fetchData]);

  useEffect(() => {
    let intervalId;

    if (isConnected) {
      fetchData();
      intervalId = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected, fetchData, interval]);

  return {
    data,
    loading,
    error,
    isConnected,
    connect,
    disconnect,
    writeValue,
    refresh: fetchData,
  };
};