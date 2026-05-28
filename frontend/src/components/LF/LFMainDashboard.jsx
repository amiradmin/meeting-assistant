// src/components/LF/LFMainDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useLF } from '../../hooks/useLF';
import LFHeatData from './LFHeatData';
import LFTemperatureControl from './LFTemperatureControl';
import LFAlloyCalculation from './LFAlloyCalculation';
import LFMonitoring from './LFMonitoring';
import LFAnalysis from './LFAnalysis';
import LFTimes from './LFTimes';
import LFEvents from './LFEvents';
import LFDelays from './LFDelays';
import LFProcessProgress from './LFProcessProgress';
import './LF.css';
// Import react-icons
import {
  FaTint,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartLine,
  FaInfoCircle,
  FaThermometerHalf,
  FaCubes,
  FaFlask,
  FaClock,
  FaList,
  FaPauseCircle,
  FaChartBar,
  FaArrowLeft,
} from 'react-icons/fa';

const LFMainDashboard = ({ furnaceId = 1 }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const heatIdFromUrl = searchParams.get('heatId');
  const startNewHeat = searchParams.get('startNew') === 'true';

  const [activeTab, setActiveTab] = useState('monitoring');
  const [selectedHeatId, setSelectedHeatId] = useState(heatIdFromUrl);

  // استفاده از useLF با heatId مشخص (اگر وجود داشته باشد)
  const lfData = useLF(furnaceId, selectedHeatId);

  // Map route paths to tab IDs
  const getTabFromPath = (pathname) => {
    if (pathname.includes('/temperature-control')) return 'temperature';
    if (pathname.includes('/alloy-calculation')) return 'alloys';
    if (pathname.includes('/analysis')) return 'analysis';
    if (pathname.includes('/process-progress')) return 'progress';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/delays')) return 'delays';
    if (pathname.includes('/times')) return 'times';
    if (pathname.includes('/heat-data')) return 'heat-data';
    if (pathname.includes('/monitoring')) return 'monitoring';
    return 'monitoring';
  };

  // Update active tab based on URL path
  useEffect(() => {
    const tabFromPath = getTabFromPath(location.pathname);
    setActiveTab(tabFromPath);
  }, [location.pathname]);

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // Map tab ID to route path
    let routePath = '/lf/monitoring';
    switch (tabId) {
      case 'temperature':
        routePath = '/lf/temperature-control';
        break;
      case 'alloys':
        routePath = '/lf/alloy-calculation';
        break;
      case 'analysis':
        routePath = '/lf/analysis';
        break;
      case 'progress':
        routePath = '/lf/process-progress';
        break;
      case 'events':
        routePath = '/lf/events';
        break;
      case 'delays':
        routePath = '/lf/delays';
        break;
      case 'times':
        routePath = '/lf/times';
        break;
      case 'heat-data':
        routePath = '/lf/heat-data';
        break;
      default:
        routePath = '/lf/monitoring';
    }

    // Preserve heatId if it exists
    if (selectedHeatId) {
      navigate(`${routePath}?heatId=${selectedHeatId}`);
    } else {
      navigate(routePath);
    }
  };

  // لاگ برای دیباگ
  useEffect(() => {
    console.log('🔍 LFMainDashboard - heatIdFromUrl:', heatIdFromUrl);
    console.log('🔍 LFMainDashboard - selectedHeatId:', selectedHeatId);
    console.log('🔍 LFMainDashboard - lfData.heatData:', lfData.heatData);
    console.log('🔍 LFMainDashboard - current path:', location.pathname);
    console.log('🔍 LFMainDashboard - activeTab:', activeTab);
  }, [heatIdFromUrl, selectedHeatId, lfData.heatData, location.pathname, activeTab]);

  // اگر heatId از URL تغییر کرد، آن را به روز کن
  useEffect(() => {
    if (heatIdFromUrl && heatIdFromUrl !== selectedHeatId) {
      console.log('🔄 Updating selectedHeatId to:', heatIdFromUrl);
      setSelectedHeatId(heatIdFromUrl);
      lfData.refreshData();
    }
  }, [heatIdFromUrl, selectedHeatId, lfData]);

  // اگر startNewHeat=true بود، یک ذوب جدید ایجاد کن
  useEffect(() => {
    if (startNewHeat && !lfData.heatData) {
      console.log('Starting new heat...');
    }
  }, [startNewHeat, lfData.heatData]);

  const tabs = [
    { id: 'monitoring', name: 'Process Monitoring', icon: FaChartLine, component: LFMonitoring },
    { id: 'heat-data', name: 'Heat Data', icon: FaInfoCircle, component: LFHeatData },
    { id: 'temperature', name: 'Temperature Control', icon: FaThermometerHalf, component: LFTemperatureControl },
    { id: 'alloys', name: 'Alloy Calculation', icon: FaCubes, component: LFAlloyCalculation },
    { id: 'analysis', name: 'Analysis', icon: FaFlask, component: LFAnalysis },
    { id: 'times', name: 'Times', icon: FaClock, component: LFTimes },
    { id: 'events', name: 'Events', icon: FaList, component: LFEvents },
    { id: 'delays', name: 'Delays', icon: FaPauseCircle, component: LFDelays },
    { id: 'progress', name: 'Process Progress', icon: FaChartBar, component: LFProcessProgress }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || LFMonitoring;

  // Go back to dashboard
  const handleGoBack = () => {
    window.history.back();
  };

  // Helper function for temperature status
  const getTempStatusClass = (currentTemp, heatData) => {
    if (!currentTemp) return '';
    if (heatData?.temp_min && currentTemp < heatData.temp_min) return 'temp-low';
    if (heatData?.temp_max && currentTemp > heatData.temp_max) return 'temp-high';
    return 'temp-ok';
  };

  if (lfData.loading) {
    return (
      <div className="lf-loading">
        <div className="spinner"></div>
        <p>Loading Ladle Furnace Data for Heat {selectedHeatId || '...'}...</p>
      </div>
    );
  }

  if (lfData.error) {
    return (
      <div className="lf-error">
        <FaExclamationTriangle size={48} />
        <h3>Error Loading Data</h3>
        <p>{lfData.error}</p>
        <button onClick={lfData.refreshData} className="btn-retry">
          <FaSyncAlt /> Retry
        </button>
        <button onClick={handleGoBack} className="btn-back" style={{ marginLeft: '10px' }}>
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  // محاسبه زمان درمان
  const getTreatmentTime = () => {
    const startTime = lfData.heatData?.start_time || lfData.heatData?.startTime;
    if (!startTime) return '00:00';
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 60000);
    const mins = diff % 60;
    const hours = Math.floor(diff / 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // نمایش پیام اگر heatId مشخص شده اما داده‌ای وجود ندارد
  if (selectedHeatId && !lfData.heatData) {
    return (
      <div className="lf-error">
        <FaExclamationTriangle size={48} />
        <h3>Heat Not Found</h3>
        <p>Heat with ID {selectedHeatId} could not be found.</p>
        <button onClick={handleGoBack} className="btn-back">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="lf-dashboard">
      {/* Modern Header with Heat Information */}
      <div className="lf-header-modern">
        {/* Top Row with Title and Back Button */}
        <div className="header-top">
          <div className="header-left">
            <button onClick={handleGoBack} className="btn-back-modern" title="Back to Dashboard">
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <div className="title-section">
              <div className="title-icon">
                <FaTint />
              </div>
              <div className="title-text">
                <h1>Ladle Furnace (LF)</h1>
                <p>Unit {furnaceId} • Secondary Metallurgy Station</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="btn-refresh-modern" onClick={lfData.refreshData} title="Refresh Data">
              <FaSyncAlt />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Heat Badge */}
        <div className="heat-badge-modern">
          <div className="badge-content">
            <span className="badge-label">Current Heat</span>
            <span className="badge-number">
              #{lfData.heatData?.heat_number || lfData.heatData?.heatNumber || '---'}
            </span>
            <span className="badge-separator">|</span>
            <span className="badge-grade">
              {lfData.heatData?.steel_grade_detail?.code ||
                lfData.heatData?.steel_grade?.code ||
                lfData.heatData?.steelGrade ||
                'No Grade'}
            </span>
            {selectedHeatId && (
              <span className="badge-id">ID: {selectedHeatId}</span>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card">
            <div className="status-card-icon phase-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="status-card-content">
              <span className="status-label">Current Phase</span>
              <span className={`status-value phase-${lfData.currentPhase || 'unknown'}`}>
                {lfData.phases?.find(p => p.id === lfData.currentPhase)?.name || lfData.currentPhase || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon time-icon">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <div className="status-card-content">
              <span className="status-label">Treatment Time</span>
              <span className="status-value time-value">
                {getTreatmentTime()}
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon weight-icon">
              <i className="fas fa-weight-hanging"></i>
            </div>
            <div className="status-card-content">
              <span className="status-label">Liquid Steel</span>
              <span className="status-value">
                {lfData.heatData?.liquid_weight?.toFixed(1) || lfData.heatData?.liquidWeight?.toFixed(1) || '0'}
                <span className="status-unit"> tons</span>
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon temp-icon">
              <i className="fas fa-thermometer-half"></i>
            </div>
            <div className="status-card-content">
              <span className="status-label">Current Temperature</span>
              <span className={`status-value ${getTempStatusClass(lfData.temperatures[0]?.temperature, lfData.heatData)}`}>
                {lfData.temperatures[0]?.temperature || '---'}
                <span className="status-unit">°C</span>
              </span>
              {lfData.heatData?.temp_target && (
                <span className="status-target">
                  Target: {lfData.heatData?.temp_target}°C
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="lf-tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <IconComponent />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="lf-tab-content">
        <ActiveComponent lfData={lfData} />
      </div>
    </div>
  );
};

export default LFMainDashboard;