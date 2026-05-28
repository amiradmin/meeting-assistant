import React, { useState, useEffect } from "react";
import { FaRobot, FaChartLine, FaTools, FaBolt, FaExclamationTriangle, FaSync, FaSpinner, FaCloud, FaDatabase } from "react-icons/fa";
import axios from "axios";

// Components
import Header from "../components/ai/Header";
import StatsOverview from "../components/ai/StatsOverview";
import ErrorDisplay from "../components/ai/ErrorDisplay";
import PredictionsGrid from "../components/ai/PredictionsGrid";

// Services
import { modelVersionService } from "../services/modelVersionService";
import { monitoringService } from "../services/monitoringService";
import {
  getPredictionUpdates,
  getPredictionByType,
  updatePredictionStatus,
  setPredictionSchedule,
  clearPredictionSchedule,
  startAnomalyPrediction,
  startMaintenancePrediction,
  startEfficiencyPrediction,
  startLifetimePrediction
} from "../services/predictionService";

// API base URL
const API_BASE_URL = 'http://192.168.150.10:8000/api';

export default function AIDashboardPage() {
  const [predictions, setPredictions] = useState({
    anomaly: {
      status: 'idle',
      progress: 0,
      isRunning: false,
      nextSchedule: null,
      lastUpdate: null,
      id: null
    },
    maintenance: {
      status: 'idle',
      progress: 0,
      isRunning: false,
      nextSchedule: null,
      lastUpdate: null,
      id: null
    },
    efficiency: {
      status: 'idle',
      progress: 0,
      isRunning: false,
      nextSchedule: null,
      lastUpdate: null,
      id: null
    },
    lifetime: {
      status: 'idle',
      progress: 0,
      isRunning: false,
      nextSchedule: null,
      lastUpdate: null,
      id: null
    }
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState({
    isTraining: false,
    trainingId: null,
    progress: 0,
    message: ''
  });
  const [modelStats, setModelStats] = useState({
    total_models: 0,
    types_breakdown: {},
    recent_models_30_days: 0,
    latest_model: null
  });
  const [latestModelVersions, setLatestModelVersions] = useState({
    latest_versions: {},
    total_types: 0
  });

  // Monitoring report states
  const [reportStatus, setReportStatus] = useState({
    anomaly: { report_exists: false, current_data_exists: false, reference_data_exists: false, monitoring_report_url: null },
    maintenance: { report_exists: false, current_data_exists: false, reference_data_exists: false, monitoring_report_url: null },
    efficiency: { report_exists: false, current_data_exists: false, reference_data_exists: false, monitoring_report_url: null },
    lifetime: { report_exists: false, current_data_exists: false, reference_data_exists: false, monitoring_report_url: null }
  });
  const [generatingReports, setGeneratingReports] = useState({});
  const [reportFileUrl, setReportFileUrl] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    api: 'healthy',
    database: 'healthy',
    models: 'healthy'
  });

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
    checkTrainingStatus();
    loadReportStatus();

    // System health check
    checkSystemHealth();
  }, []);

  // Check training status periodically
  useEffect(() => {
    let interval;
    if (trainingStatus.isTraining) {
      interval = setInterval(() => {
        checkTrainingStatus();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [trainingStatus.isTraining]);

  // System health monitoring
  const checkSystemHealth = async () => {
    try {
      // Check API health
      await axios.get(`${API_BASE_URL}/health/`);
      setSystemHealth(prev => ({ ...prev, api: 'healthy' }));
    } catch (error) {
      setSystemHealth(prev => ({ ...prev, api: 'unhealthy' }));
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadPredictionData(),
        loadModelVersionData()
      ]);

      setLastSync(new Date());
      checkSystemHealth();
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadPredictionData = async () => {
    try {
      const predictionData = await getPredictionUpdates();
      console.log('API Response:', predictionData);

      if (predictionData.results && predictionData.results.length > 0) {
        const updatedPredictions = { ...predictions };

        predictionData.results.forEach(item => {
          const type = item.prediction_type;
          if (updatedPredictions[type]) {
            let status = item.status || 'idle';
            let isRunning = status === 'running';

            let nextSchedule = null;
            if (item.schedule_config) {
              nextSchedule = {
                ...item.schedule_config,
                nextRun: item.schedule_config.next_run || item.schedule_config.nextRun
              };
            }

            updatedPredictions[type] = {
              ...updatedPredictions[type],
              id: item.id,
              status: status,
              progress: item.progress || 0,
              isRunning: isRunning,
              nextSchedule: nextSchedule,
              lastUpdate: item.last_updated || null
            };
          }
        });

        console.log('Updated predictions state:', updatedPredictions);
        setPredictions(updatedPredictions);
      }

    } catch (error) {
      console.error('Error loading prediction data:', error);
      throw new Error('Failed to load prediction data: ' + (error.message || 'Unknown error'));
    }
  };

  const loadModelVersionData = async () => {
    try {
      const latestVersionsResponse = await modelVersionService.getLatestVersions();
      console.log('Latest model versions:', latestVersionsResponse);
      setLatestModelVersions(latestVersionsResponse);

      const statsResponse = await modelVersionService.getStats();
      setModelStats(statsResponse.stats || {
        total_models: 0,
        types_breakdown: {},
        recent_models_30_days: 0,
        latest_model: null
      });
    } catch (error) {
      console.error('Error loading model version data:', error);
      setLatestModelVersions({
        latest_versions: {},
        total_types: 0
      });
      setModelStats({
        total_models: 0,
        types_breakdown: {},
        recent_models_30_days: 0,
        latest_model: null
      });
    }
  };

  const loadReportStatus = async () => {
    try {
      const modelTypes = ['anomaly', 'maintenance', 'efficiency', 'lifetime'];
      const statusPromises = modelTypes.map(type =>
        monitoringService.getReportStatus(type)
      );

      const statusResults = await Promise.allSettled(statusPromises);
      const statusMap = {};

      modelTypes.forEach((type, index) => {
        if (statusResults[index].status === 'fulfilled') {
          statusMap[type] = statusResults[index].value;
        } else {
          statusMap[type] = {
            report_exists: false,
            current_data_exists: false,
            reference_data_exists: false,
            monitoring_report_url: null,
            last_generated: null,
            model_type: type
          };
        }
      });

      console.log('Report status loaded:', statusMap);
      setReportStatus(statusMap);

      const hasReport = Object.values(statusMap).some(status => status.report_exists);
      if (hasReport) {
        try {
          const reportUrl = await monitoringService.getReportFile();
          setReportFileUrl(reportUrl);
        } catch (fileError) {
          console.log('No report file available:', fileError);
        }
      }

    } catch (error) {
      console.error('Error loading report status (non-critical):', error);
    }
  };

  const generateMonitoringReport = async (modelType) => {
    try {
      console.log(`🔄 Generating monitoring report for ${modelType}...`);
      setGeneratingReports(prev => ({ ...prev, [modelType]: true }));

      const response = await monitoringService.generateReport(modelType);
      console.log(`✅ Report generated for ${modelType}:`, response);

      await loadReportStatus();

      return response;
    } catch (error) {
      console.error(`Error generating report for ${modelType}:`, error);
      setError(`خطا در تولید گزارش مانیتورینگ برای ${modelType}: ${error.message}`);
      throw error;
    } finally {
      setGeneratingReports(prev => ({ ...prev, [modelType]: false }));
    }
  };

  const startModelTraining = async () => {
    try {
      setTrainingStatus({
        isTraining: true,
        trainingId: null,
        progress: 0,
        message: 'شروع آموزش مدل...'
      });

      console.log("Calling RUL training API...");

      const response = await axios.post(
        'http://127.0.0.1:8000/api/rul-training/train_all_assets/',
        {
          epochs: 50,
          force_retrain: true
        }
      );

      console.log("RUL training API response:", response.data);

      if (response.data.status === 'success') {
        setTrainingStatus(prev => ({
          ...prev,
          trainingId: response.data.training_id,
          message: 'آموزش مدل با موفقیت شروع شد'
        }));

        setTimeout(() => checkTrainingStatus(), 2000);
      } else {
        throw new Error(response.data.message || 'Failed to start training');
      }

    } catch (error) {
      console.error('Error starting model training:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError('خطا در شروع آموزش مدل: ' + errorMessage);
      setTrainingStatus({
        isTraining: false,
        trainingId: null,
        progress: 0,
        message: ''
      });
    }
  };

  const checkTrainingStatus = async () => {
    if (!trainingStatus.trainingId && !trainingStatus.isTraining) return;

    try {
      const trainingId = trainingStatus.trainingId;
      const url = trainingId
        ? `${API_BASE_URL}/rul-training/training_status/?training_id=${trainingId}`
        : `${API_BASE_URL}/rul-training/training_status/`;

      const response = await axios.get(url);
      const data = response.data;

      if (data.status === 'running' || data.status === 'started') {
        setTrainingStatus(prev => ({
          ...prev,
          isTraining: true,
          message: data.message || 'آموزش در حال انجام...',
          progress: data.progress?.percentage || prev.progress
        }));
      } else if (data.status === 'completed') {
        setTrainingStatus({
          isTraining: false,
          trainingId: null,
          progress: 100,
          message: 'آموزش مدل با موفقیت تکمیل شد!'
        });

        setTimeout(() => {
          setTrainingStatus(prev => ({ ...prev, message: '' }));
        }, 5000);

        loadModelVersionData();
        loadPredictionData();
      } else if (data.status === 'failed') {
        setTrainingStatus({
          isTraining: false,
          trainingId: null,
          progress: 0,
          message: 'خطا در آموزش مدل: ' + (data.message || 'Unknown error')
        });
      } else if (data.status === 'idle') {
        setTrainingStatus({
          isTraining: false,
          trainingId: null,
          progress: 0,
          message: ''
        });
      }

    } catch (error) {
      console.error('Error checking training status:', error);
    }
  };

  const updatePredictionStatus = async (type, status, progress = 0, errorMessage = null) => {
    try {
      const prediction = predictions[type];
      if (!prediction.id) {
        const predictionData = await getPredictionByType(type);
        if (predictionData && predictionData.id) {
          setPredictions(prev => ({
            ...prev,
            [type]: { ...prev[type], id: predictionData.id }
          }));
        } else {
          throw new Error(`Prediction ID not found for type: ${type}`);
        }
      }

      await updatePredictionStatus(predictions[type].id, status, progress, errorMessage);

      setPredictions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          status: status,
          progress: progress,
          isRunning: status === 'running',
          lastUpdate: new Date().toISOString()
        }
      }));

      setTimeout(() => loadPredictionData(), 500);
    } catch (err) {
      console.error("Error updating prediction status:", err);
    }
  };

  const updatePredictionSchedule = async (type, scheduleConfig) => {
    try {
      const prediction = predictions[type];
      if (!prediction.id) {
        const predictionData = await getPredictionByType(type);
        if (predictionData && predictionData.id) {
          setPredictions(prev => ({
            ...prev,
            [type]: { ...prev[type], id: predictionData.id }
          }));
        } else {
          throw new Error(`Prediction ID not found for type: ${type}`);
        }
      }

      await setPredictionSchedule(predictions[type].id, scheduleConfig);

      setPredictions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          nextSchedule: scheduleConfig
        }
      }));

      setTimeout(() => loadPredictionData(), 500);
    } catch (err) {
      console.error("Error updating prediction schedule:", err);
    }
  };

  const removePredictionSchedule = async (type) => {
    try {
      const prediction = predictions[type];
      if (!prediction.id) {
        const predictionData = await getPredictionByType(type);
        if (predictionData && predictionData.id) {
          setPredictions(prev => ({
            ...prev,
            [type]: { ...prev[type], id: predictionData.id }
          }));
        } else {
          throw new Error(`Prediction ID not found for type: ${type}`);
        }
      }

      await clearPredictionSchedule(predictions[type].id);

      setPredictions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          nextSchedule: null
        }
      }));

      setTimeout(() => loadPredictionData(), 500);
    } catch (err) {
      console.error("Error removing prediction schedule:", err);
    }
  };

  const startPrediction = async (type) => {
    try {
      setError(null);
      await updatePredictionStatus(type, 'running', 5);

      let response;
      switch (type) {
        case 'anomaly':
          response = await startAnomalyPrediction();
          break;
        case 'maintenance':
          response = await startMaintenancePrediction();
          break;
        case 'efficiency':
          response = await startEfficiencyPrediction();
          break;
        case 'lifetime':
          response = await startLifetimePrediction();
          break;
        default:
          throw new Error(`Unknown prediction type: ${type}`);
      }

      console.log(`${type} prediction successful:`, response);

      if (type !== 'lifetime') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await updatePredictionStatus(type, 'completed', 100);

      if (type === 'lifetime') {
        setTrainingStatus({
          isTraining: false,
          trainingId: null,
          progress: 0,
          message: 'پیش‌بینی عمر مفید با موفقیت انجام شد!'
        });

        setTimeout(() => {
          setTrainingStatus(prev => ({ ...prev, message: '' }));
        }, 5000);
      }

    } catch (err) {
      console.error(`Error in ${type} prediction:`, err);
      setError(`خطا در اجرای پیش‌بینی ${type}: ${err.message}`);
      await updatePredictionStatus(type, 'error', 0, err.message);
    }
  };

  const schedulePrediction = async (type, scheduleConfig) => {
    await updatePredictionSchedule(type, scheduleConfig);
    console.log(`Scheduled ${type} prediction:`, scheduleConfig);
  };

  const removeSchedule = async (type) => {
    await removePredictionSchedule(type);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const calculateStats = () => {
    const predictionValues = Object.values(predictions);
    const completed = predictionValues.filter(p => p.status === 'completed').length;
    const scheduled = predictionValues.filter(p => p.nextSchedule).length;
    const running = predictionValues.filter(p => p.isRunning).length;
    const idle = predictionValues.filter(p => p.status === 'idle' || p.status === 'pending').length;

    return { completed, scheduled, running, idle };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="loading-spinner">
            <FaSync />
          </div>
          <h2>در حال بارگذاری...</h2>
          <p>در حال دریافت اطلاعات پیش‌بینی‌ها</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-dashboard">
      {/* System Status Bar */}
      <div className="system-status-bar">
        <div className="status-item">
          <FaCloud className={`status-icon ${systemHealth.api}`} />
          <span>API</span>
        </div>
        <div className="status-item">
          <FaDatabase className={`status-icon ${systemHealth.database}`} />
          <span>Database</span>
        </div>
        <div className="status-item">
          <FaRobot className={`status-icon ${systemHealth.models}`} />
          <span>Models</span>
        </div>
      </div>

      {/* Header */}
      <Header
        lastSync={lastSync}
        trainingStatus={trainingStatus}
        onRefresh={loadAllData}
        onStartTraining={startModelTraining}
      />

      {/* Error Display */}
      <ErrorDisplay error={error} onClose={() => setError(null)} />

      {/* Stats Overview */}
      <StatsOverview stats={stats} modelStats={modelStats} />

      {/* Predictions Grid */}
      <PredictionsGrid
        predictions={predictions}
        trainingStatus={trainingStatus}
        onStartPrediction={startPrediction}
        onSchedulePrediction={schedulePrediction}
        onRemoveSchedule={removeSchedule}
        onTrainModel={startModelTraining}
        latestModelVersions={latestModelVersions}
        reportStatus={reportStatus}
        onGenerateReport={generateMonitoringReport}
        generatingReports={generatingReports}
        reportFileUrl={reportFileUrl}
      />

      {/* Footer */}
      <div className="dashboard-footer">
        <p>
          سیستم هوش مصنوعی - نسخه ۱.۰.۰ | آخرین بروزرسانی سرور: {lastSync?.toLocaleString('fa-IR') || 'در حال بارگذاری...'}
          {modelStats && ` | تعداد مدل‌های آموزش دیده: ${modelStats.total_models || 0}`}
        </p>
      </div>

      <style jsx>{`
        .ai-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1rem;
          font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          direction: rtl;
        }

        .system-status-bar {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .status-icon {
          font-size: 1rem;
        }

        .status-icon.healthy {
          color: #10b981;
        }

        .status-icon.unhealthy {
          color: #ef4444;
          animation: pulse 2s infinite;
        }

        .dashboard-loading {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
        }

        .loading-content {
          text-align: center;
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .loading-spinner {
          font-size: 3rem;
          color: #3b82f6;
          margin-bottom: 1rem;
          animation: spin 1.5s linear infinite;
        }

        .dashboard-footer {
          text-align: center;
          padding: 2rem;
          color: #64748b;
          font-size: 0.875rem;
          border-top: 1px solid rgba(229, 231, 235, 0.8);
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .ai-dashboard {
            padding: 0.5rem;
          }

          .system-status-bar {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}