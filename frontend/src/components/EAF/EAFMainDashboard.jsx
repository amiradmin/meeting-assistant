// src/components/EAF/EAFMainDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useEAF } from '../../hooks/useEAF';
import EAFHeatData from './EAFHeatData';
import EAFMeltingControl from './EAFMeltingControl';
import EAFCharging from './EAFCharging';
import EAFEnergyMonitor from './EAFEnergyMonitor';
import EAFElectricalProfile from './EAFElectricalProfile';
import EAFEvents from './EAFEvents';
import EAFDelays from './EAFDelays';
import './EAF.css';
// Import react-icons
import {
  FaBolt,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartLine,
  FaInfoCircle,
  FaThermometerHalf,
  FaTruck,
  FaPlug,
  FaList,
  FaPauseCircle,
  FaArrowLeft,
  FaFire,
} from 'react-icons/fa';

const EAFMainDashboard = ({ furnaceId = 1 }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const heatIdFromUrl = searchParams.get('heatId');
  const startNewHeat = searchParams.get('startNew') === 'true';

  const [activeTab, setActiveTab] = useState('melting');
  const [selectedHeatId, setSelectedHeatId] = useState(heatIdFromUrl);

  const eafData = useEAF(furnaceId, selectedHeatId);

  const getTabFromPath = (pathname) => {
    if (pathname.includes('/heat-data')) return 'heat-data';
    if (pathname.includes('/melting-control')) return 'melting';
    if (pathname.includes('/charging')) return 'charging';
    if (pathname.includes('/energy-monitor')) return 'energy';
    if (pathname.includes('/electrical-profile')) return 'profile';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/delays')) return 'delays';
    return 'melting';
  };

  useEffect(() => {
    const tabFromPath = getTabFromPath(location.pathname);
    setActiveTab(tabFromPath);
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    let routePath = '/eaf/melting-control';
    switch (tabId) {
      case 'heat-data':
        routePath = '/eaf/heat-data';
        break;
      case 'melting':
        routePath = '/eaf/melting-control';
        break;
      case 'charging':
        routePath = '/eaf/charging';
        break;
      case 'energy':
        routePath = '/eaf/energy-monitor';
        break;
      case 'profile':
        routePath = '/eaf/electrical-profile';
        break;
      case 'events':
        routePath = '/eaf/events';
        break;
      case 'delays':
        routePath = '/eaf/delays';
        break;
      default:
        routePath = '/eaf/melting-control';
    }

    if (selectedHeatId) {
      navigate(`${routePath}?heatId=${selectedHeatId}`);
    } else {
      navigate(routePath);
    }
  };

  useEffect(() => {
    if (heatIdFromUrl && heatIdFromUrl !== selectedHeatId) {
      setSelectedHeatId(heatIdFromUrl);
      eafData.refreshData();
    }
  }, [heatIdFromUrl, selectedHeatId, eafData]);

  const tabs = [
    { id: 'melting', name: 'Melting Control', icon: FaFire, component: EAFMeltingControl },
    { id: 'heat-data', name: 'Heat Data', icon: FaInfoCircle, component: EAFHeatData },
    { id: 'charging', name: 'Charging', icon: FaTruck, component: EAFCharging },
    { id: 'energy', name: 'Energy Monitor', icon: FaPlug, component: EAFEnergyMonitor },
    { id: 'profile', name: 'Electrical Profile', icon: FaChartLine, component: EAFElectricalProfile },
    { id: 'events', name: 'Events', icon: FaList, component: EAFEvents },
    { id: 'delays', name: 'Delays', icon: FaPauseCircle, component: EAFDelays }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || EAFMeltingControl;

  const handleGoBack = () => {
    window.history.back();
  };

  const getTreatmentTime = () => {
    const startTime = eafData.heatData?.start_time || eafData.heatData?.startTime;
    if (!startTime) return '00:00';
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 60000);
    const mins = diff % 60;
    const hours = Math.floor(diff / 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (eafData.loading) {
    return (
      <div className="eaf-loading">
        <div className="spinner"></div>
        <p>Loading EAF Data for Heat {selectedHeatId || '...'}...</p>
      </div>
    );
  }

  if (eafData.error) {
    return (
      <div className="eaf-error">
        <FaExclamationTriangle size={48} />
        <h3>Error Loading Data</h3>
        <p>{eafData.error}</p>
        <button onClick={eafData.refreshData} className="btn-retry">
          <FaSyncAlt /> Retry
        </button>
        <button onClick={handleGoBack} className="btn-back">
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="eaf-dashboard">
      {/* Modern Header */}
      <div className="eaf-header-modern">
        <div className="header-top">
          <div className="header-left">
            <button onClick={handleGoBack} className="btn-back-modern" title="Back to Dashboard">
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <div className="title-section">
              <div className="title-icon">
                <FaBolt />
              </div>
              <div className="title-text">
                <h1>Electric Arc Furnace (EAF)</h1>
                <p>Unit {furnaceId} • Primary Melting Station</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="btn-refresh-modern" onClick={eafData.refreshData} title="Refresh Data">
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
              #{eafData.heatData?.heat_number || eafData.heatData?.heatNumber || '---'}
            </span>
            <span className="badge-separator">|</span>
            <span className="badge-grade">
              {eafData.heatData?.steel_grade_detail?.code ||
                eafData.heatData?.steel_grade?.code ||
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
              <span className={`phase-${eafData.heatData?.current_phase || 'preparation'}`}>
                {eafData.heatData?.current_phase || 'Preparation'}
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon time-icon">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <div className="status-card-content">
              <span className="status-label">Melting Time</span>
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
                {eafData.heatData?.liquid_weight?.toFixed(1) || eafData.heatData?.liquidWeight?.toFixed(1) || '0'}
                <span className="status-unit"> tons</span>
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-icon power-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="status-card-content">
              <span className="status-label">Power</span>
              <span className="status-value">
                {eafData.heatData?.power_consumption || eafData.energyData?.[0]?.power_active || '0'}
                <span className="status-unit"> MW</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="eaf-tabs">
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
      <div className="eaf-tab-content">
        <ActiveComponent eafData={eafData} />
      </div>
    </div>
  );
};

export default EAFMainDashboard;