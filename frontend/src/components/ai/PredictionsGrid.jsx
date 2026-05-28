// components/PredictionsGrid.jsx
import React, { useState } from 'react';
import {
  FaExclamationTriangle,
  FaTools,
  FaChartLine,
  FaBolt
} from 'react-icons/fa';
import PredictionCard from './PredictionCard';
import NotificationPopup from './NotificationPopup';

const PredictionsGrid = ({
  predictions,
  trainingStatus,
  onStartPrediction,
  onSchedulePrediction,
  onRemoveSchedule,
  onTrainModel,
  latestModelVersions,
  reportStatus,
  onGenerateReport,
  generatingReports,
  reportFileUrl
}) => {
  const [maintenanceTraining, setMaintenanceTraining] = useState({
    isTraining: false,
    progress: 0,
    status: 'idle'
  });

  const [maintenancePrediction, setMaintenancePrediction] = useState({
    isRunning: false,
    progress: 0,
    status: 'idle'
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success', // 'success', 'error', 'info'
    title: '',
    message: '',
    duration: 4000
  });

  // Show notification function
  const showNotification = (type, title, message, duration = 4000) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      duration
    });
  };

  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleTrainModelMaintenance = async () => {
    try {
      setMaintenanceTraining(prev => ({
        ...prev,
        isTraining: true,
        status: 'training'
      }));

      console.log('Starting maintenance model training...');

      const response = await fetch('http://localhost:8002/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset_ids: [1,4,5,6,7,8,9]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Maintenance model training started:', result);

      setMaintenanceTraining({
        isTraining: false,
        progress: 100,
        status: 'completed'
      });

      showNotification(
        'success',
        'آموزش مدل آغاز شد',
        'آموزش مدل پیش‌بینی تعمیرات با موفقیت شروع شد و در حال پردازش است.'
      );

    } catch (error) {
      console.error('Error starting maintenance model training:', error);
      setMaintenanceTraining({
        isTraining: false,
        progress: 0,
        status: 'error'
      });

      showNotification(
        'error',
        'خطا در آموزش مدل',
        `خطا در شروع آموزش مدل پیش‌بینی تعمیرات: ${error.message}`
      );
    }
  };

  const handleStartMaintenancePrediction = async () => {
    try {
      setMaintenancePrediction(prev => ({
        ...prev,
        isRunning: true,
        status: 'running',
        progress: 0
      }));

      console.log('Starting maintenance prediction for all assets...');

      const response = await fetch('http://192.168.150.10:8000/api/pdm/pdm-predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Maintenance prediction completed:', result);

      setMaintenancePrediction({
        isRunning: false,
        progress: 100,
        status: 'completed'
      });

      showNotification(
        'success',
        'پیش‌بینی با موفقیت انجام شد',
        `پیش‌بینی تعمیرات با موفقیت انجام شد! ${result.total_assets} تجهیز پردازش شد.`
      );

      window.dispatchEvent(new Event('trainingComplete'));

    } catch (error) {
      console.error('Error starting maintenance prediction:', error);
      setMaintenancePrediction({
        isRunning: false,
        progress: 0,
        status: 'error'
      });

      showNotification(
        'error',
        'خطا در اجرای پیش‌بینی',
        `خطا در اجرای پیش‌بینی تعمیرات: ${error.message}`
      );
    }
  };

  const handleStartPrediction = async (predictionType) => {
    if (predictionType === 'maintenance') {
      await handleStartMaintenancePrediction();
    } else {
      onStartPrediction(predictionType);
    }
  };

  const getModelTooltip = (predictionType) => {
    if (!latestModelVersions || !latestModelVersions.latest_versions) {
      return 'در حال بارگذاری اطلاعات مدل...';
    }

    const modelType = predictionType === 'lifetime' ? 'RUL' : predictionType.toUpperCase();
    const latestVersion = latestModelVersions.latest_versions[modelType];

    if (!latestVersion) return 'مدلی برای این نوع یافت نشد';

    const formatDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleString('fa-IR');
      } catch {
        return 'تاریخ نامعتبر';
      }
    };

    return `
آخرین بروزرسانی مدل:
• نوع: ${latestVersion.type}
• ورژن: ${latestVersion.version}
• تاریخ ایجاد: ${formatDate(latestVersion.created_at)}
• فایل: ${latestVersion.model_file ? 'موجود' : 'ندارد'}
    `.trim();
  };

  const enhancedPredictions = {
    ...predictions,
    maintenance: {
      ...predictions.maintenance,
      isRunning: maintenancePrediction.isRunning,
      progress: maintenancePrediction.progress,
      status: maintenancePrediction.status
    }
  };

  return (
    <>
      <div className="predictions-grid">
        <PredictionCard
          title="پیش‌بینی ناهنجاری ها"
          description="تشخیص ناهنجاری‌های لحظه‌ای در عملکرد تجهیزات و سیستم‌های نظارتی"
          icon={<FaExclamationTriangle />}
          status={enhancedPredictions.anomaly.status}
          progress={enhancedPredictions.anomaly.progress}
          isRunning={enhancedPredictions.anomaly.isRunning}
          nextSchedule={enhancedPredictions.anomaly.nextSchedule}
          lastUpdate={enhancedPredictions.anomaly.lastUpdate}
          onStart={() => handleStartPrediction('anomaly')}
          onSchedule={(scheduleConfig) => onSchedulePrediction('anomaly', scheduleConfig)}
          onRemoveSchedule={() => onRemoveSchedule('anomaly')}
          modelTooltip={getModelTooltip('anomaly')}
          latestModelVersions={latestModelVersions}
          reportStatus={reportStatus.anomaly}
          onGenerateReport={onGenerateReport}
          isGeneratingReport={generatingReports.anomaly}
          reportFileUrl={reportFileUrl}
        />

        <PredictionCard
          title="پیش‌بینی تعمیرات"
          description="پیش‌بینی زمان مورد نیاز برای تعمیرات پیشگیرانه و برنامه‌ریزی منابع"
          icon={<FaTools />}
          status={enhancedPredictions.maintenance.status}
          progress={enhancedPredictions.maintenance.progress}
          isRunning={enhancedPredictions.maintenance.isRunning}
          nextSchedule={enhancedPredictions.maintenance.nextSchedule}
          lastUpdate={enhancedPredictions.maintenance.lastUpdate}
          onStart={() => handleStartPrediction('maintenance')}
          onSchedule={(scheduleConfig) => onSchedulePrediction('maintenance', scheduleConfig)}
          onRemoveSchedule={() => onRemoveSchedule('maintenance')}
          onTrainModel={handleTrainModelMaintenance}
          isTraining={maintenanceTraining.isTraining}
          modelTooltip={getModelTooltip('maintenance')}
          latestModelVersions={latestModelVersions}
          shouldShowTrainButton={true}
          reportStatus={reportStatus.maintenance}
          onGenerateReport={onGenerateReport}
          isGeneratingReport={generatingReports.maintenance}
          reportFileUrl={reportFileUrl}
        />

        <PredictionCard
          title="پیش‌بینی راندمان"
          description="تحلیل و پیش‌بینی راندمان کلی سیستم و بهینه‌سازی عملکرد"
          icon={<FaChartLine />}
          status={enhancedPredictions.efficiency.status}
          progress={enhancedPredictions.efficiency.progress}
          isRunning={enhancedPredictions.efficiency.isRunning}
          nextSchedule={enhancedPredictions.efficiency.nextSchedule}
          lastUpdate={enhancedPredictions.efficiency.lastUpdate}
          onStart={() => handleStartPrediction('efficiency')}
          onSchedule={(scheduleConfig) => onSchedulePrediction('efficiency', scheduleConfig)}
          onRemoveSchedule={() => onRemoveSchedule('efficiency')}
          modelTooltip={getModelTooltip('efficiency')}
          latestModelVersions={latestModelVersions}
          reportStatus={reportStatus.efficiency}
          onGenerateReport={onGenerateReport}
          isGeneratingReport={generatingReports.efficiency}
          reportFileUrl={reportFileUrl}
        />

        <PredictionCard
          title="پیش‌بینی عمر مفید"
          description="تخمین عمر باقی‌مانده تجهیزات و برنامه‌ریزی برای جایگزینی"
          icon={<FaBolt />}
          status={enhancedPredictions.lifetime.status}
          progress={enhancedPredictions.lifetime.progress}
          isRunning={enhancedPredictions.lifetime.isRunning}
          nextSchedule={enhancedPredictions.lifetime.nextSchedule}
          lastUpdate={enhancedPredictions.lifetime.lastUpdate}
          onStart={() => handleStartPrediction('lifetime')}
          onSchedule={(scheduleConfig) => onSchedulePrediction('lifetime', scheduleConfig)}
          onRemoveSchedule={() => onRemoveSchedule('lifetime')}
          onTrainModel={onTrainModel}
          isTraining={trainingStatus.isTraining}
          modelTooltip={getModelTooltip('lifetime')}
          latestModelVersions={latestModelVersions}
          shouldShowTrainButton={true}
          reportStatus={reportStatus.lifetime}
          onGenerateReport={onGenerateReport}
          isGeneratingReport={generatingReports.lifetime}
          reportFileUrl={reportFileUrl}
        />

        <style jsx>{`
          .predictions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          @media (max-width: 768px) {
            .predictions-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
          }

          @media (min-width: 1200px) {
            .predictions-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>

      {/* Notification Popup Component */}
      <NotificationPopup
        show={notification.show}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
      />
    </>
  );
};

export default PredictionsGrid;