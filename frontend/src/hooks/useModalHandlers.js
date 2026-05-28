import { useState, useRef, useCallback } from "react";
import axios from "axios";

export const useModalHandlers = () => {
  // Modal states
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [sensorAsset, setSensorAsset] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [sensorLoading, setSensorLoading] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showDocumentsViewer, setShowDocumentsViewer] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyAsset, setHistoryAsset] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [realTimeLoading, setRealTimeLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastUpdate, setLastUpdate] = useState(null);

  const pollingRef = useRef(null);

  // Normalize asset ID
  const getAssetId = (asset) => asset?.asset || asset?.asset_id || asset?.id;

  // Stop realtime polling
  const stopRealTime = useCallback(() => {
    setIsRealTime(false);
    setConnectionStatus("disconnected");
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Fetch sensor data for an asset
  const fetchSensorForAsset = useCallback(async (asset) => {
    const assetId = getAssetId(asset);
    if (!assetId) return;

    setSensorLoading(true);
    setSensorAsset(asset);
    try {
      const res = await axios.get(`/api/assets/${assetId}/sensors/`);
      setSensorData(res.data || []);
      setLastUpdate(new Date());
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Error loading sensor data", err);
      setSensorData([]);
      setConnectionStatus("error");
    } finally {
      setSensorLoading(false);
    }
  }, []);

  // Start realtime polling
  const startRealTime = useCallback((asset) => {
    const assetId = getAssetId(asset);
    if (!assetId) return;

    stopRealTime();
    setIsRealTime(true);
    setConnectionStatus("connecting");

    fetchSensorForAsset(asset).catch(() => {});

    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/assets/${assetId}/sensors/`);
        const newData = res.data || [];
        if (newData.length && JSON.stringify(newData) !== JSON.stringify(sensorData)) {
          setSensorData(newData);
          setLastUpdate(new Date());
        }
        setConnectionStatus("connected");
      } catch (err) {
        console.error("Realtime poll error", err);
        setConnectionStatus("error");
      }
    }, 2000);
  }, [fetchSensorForAsset, sensorData, stopRealTime]);

  // Fetch sensor data now
  const fetchSensorDataNow = useCallback(async () => {
    if (!sensorAsset) return;
    const assetId = getAssetId(sensorAsset);
    if (!assetId) return;

    setRealTimeLoading(true);
    try {
      const res = await axios.get(`/api/assets/${assetId}/sensors/`);
      setSensorData(res.data || []);
      setLastUpdate(new Date());
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Error refreshing sensor", err);
      setConnectionStatus("error");
    } finally {
      setRealTimeLoading(false);
    }
  }, [sensorAsset]);

  // FIXED: Photo viewer - use photos array directly instead of API call
  const openPhotoViewer = useCallback((assetPhotos) => {
    console.log('Opening photo viewer with photos:', assetPhotos);

    // If it's an array of photos, use them directly
    if (Array.isArray(assetPhotos)) {
      setPhotos(assetPhotos);
      setShowPhotoViewer(true);
      return;
    }

    // If it's an asset object, try to get photos from it
    if (assetPhotos && typeof assetPhotos === 'object') {
      const photosFromAsset = assetPhotos.photos || assetPhotos.images || assetPhotos.asset_images || [];
      setPhotos(photosFromAsset);
      setShowPhotoViewer(true);
      return;
    }

    // Fallback: empty array
    console.warn('No photos found for photo viewer');
    setPhotos([]);
    setShowPhotoViewer(true);
  }, []);

  // FIXED: Documents viewer - use documents array directly instead of API call
  const openDocumentsViewer = useCallback((assetDocuments) => {
    console.log('Opening document viewer with documents:', assetDocuments);

    // If it's an array of documents, use them directly
    if (Array.isArray(assetDocuments)) {
      setDocuments(assetDocuments);
      setShowDocumentsViewer(true);
      return;
    }

    // If it's an asset object, try to get documents from it
    if (assetDocuments && typeof assetDocuments === 'object') {
      const docsFromAsset = assetDocuments.documents || assetDocuments.docs || assetDocuments.files || [];
      setDocuments(docsFromAsset);
      setShowDocumentsViewer(true);
      return;
    }

    // Fallback: empty array
    console.warn('No documents found for document viewer');
    setDocuments([]);
    setShowDocumentsViewer(true);
  }, []);

  // History modal (keep API call since history might need to be fetched)
  const openHistoryModal = useCallback(async (asset) => {
    const assetId = getAssetId(asset);
    if (!assetId) return;

    setHistoryLoading(true);
    try {
      const res = await axios.get(`/api/assets/${assetId}/history/`);
      setHistoryRecords(res.data || []);
      setHistoryAsset(assetId);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Error loading history", err);
      setHistoryRecords([]);
      setShowHistoryModal(true);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Sensor modal (keep API call since sensor data needs to be fetched)
  const openSensorModal = useCallback(async (asset) => {
    if (!asset) return;
    setShowSensorModal(true);
    await fetchSensorForAsset(asset);
    startRealTime(asset);
  }, [fetchSensorForAsset, startRealTime]);

  const closeSensorModal = useCallback(() => {
    stopRealTime();
    setShowSensorModal(false);
    setSensorAsset(null);
    setSensorData([]);
    setIsRealTime(false);
    setConnectionStatus("disconnected");
  }, [stopRealTime]);

  return {
    photos,
    photoLoading,
    documents,
    docsLoading,
    sensorAsset,
    sensorData,
    sensorLoading,
    historyRecords,
    historyLoading,
    showPhotoViewer,
    showDocumentsViewer,
    showSensorModal,
    showHistoryModal,
    historyAsset,
    isRealTime,
    realTimeLoading,
    connectionStatus,
    lastUpdate,

    openPhotoViewer,
    openDocumentsViewer,
    openSensorModal,
    openHistoryModal,
    closeSensorModal,
    fetchSensorDataNow,
    startRealTime,
    stopRealTime,

    setShowPhotoViewer,
    setShowDocumentsViewer,
    setShowHistoryModal
  };
};