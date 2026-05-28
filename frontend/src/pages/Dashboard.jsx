// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Dashboard Components
import ProductionOverview from '../components/Dashboard/ProductionOverview';
import ProcessStatusPanel from '../components/Dashboard/ProcessStatusPanel';
import AlarmPanel from '../components/Dashboard/AlarmPanel';
import EnergyConsumptionChart from '../components/Dashboard/EnergyConsumptionChart';
import QualityMetrics from '../components/Dashboard/QualityMetrics';
import HeatProgressTracker from '../components/Dashboard/HeatProgressTracker';
import MaterialConsumption from '../components/Dashboard/MaterialConsumption';
import RecentOrders from '../components/Dashboard/RecentOrders';
import { useTheme } from '../theme';

const API_BASE_URL = 'http://localhost:8000/api/lf';
const PRODUCTION_API_URL = 'http://localhost:8000/api/production';

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();

  const [timeRange, setTimeRange] = useState('today');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedHeat, setSelectedHeat] = useState(null);
  const [selectedHeatDetails, setSelectedHeatDetails] = useState(null);
  const [recentHeats, setRecentHeats] = useState([]);
  const [showAddHeatModal, setShowAddHeatModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHeats, setIsLoadingHeats] = useState(false);
  const [isLoadingHeatDetails, setIsLoadingHeatDetails] = useState(false);
  const [nextHeatNumber, setNextHeatNumber] = useState(1250);
  const [steelGrades, setSteelGrades] = useState([]);
  const [newHeatData, setNewHeatData] = useState({
    heat_number: '',
    steel_grade: 'ST52-3',
    liquid_weight: 120,
    target_liquid_weight: 120,
    notes: ''
  });

  // Order states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    production: {
      totalProduction: 1250,
      dailyTarget: 1500,
      monthlyProduction: 28500,
      efficiency: 92.5,
      availability: 96.2
    },
    process: {
      eaf: { status: 'running', temperature: 1650, power: 85, phase: 'melting' },
      lf: { status: 'heating', temperature: 1595, argonFlow: 150, heatingPower: 18.5 },
      ccm: { status: 'running', castingSpeed: 1.8, moldLevel: 75 }
    },
    alarms: [
      { id: 1, unit: 'EAF', severity: 'high', message: 'Electrode position abnormal', time: '10:23:45' },
      { id: 2, unit: 'CCM', severity: 'medium', message: 'Cooling water pressure low', time: '10:15:30' },
      { id: 3, unit: 'LF', severity: 'low', message: 'Argon flow fluctuating', time: '09:45:12' }
    ],
    metrics: {
      energy: { current: 850, daily: 18500, monthly: 425000, cost: 1250000 },
      quality: { yield: 98.2, defects: 0.8, customerComplaints: 2 }
    }
  });

  const [user, setUser] = useState({
    name: '',
    username: '',
    role: '',
    email: '',
    avatar: null,
    shift: 'A'
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef(null);
  const modalRef = useRef(null);
  const refreshInterval = useRef(null);

  // Get user info from localStorage
  const getUserFromStorage = () => {
    const userInfo = localStorage.getItem('user_info') || localStorage.getItem('user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        let displayName = user.username;
        if (user.first_name && user.last_name) {
          displayName = `${user.first_name} ${user.last_name}`;
        } else if (user.first_name) {
          displayName = user.first_name;
        } else if (user.username) {
          displayName = user.username;
        }
        return {
          name: displayName,
          username: user.username,
          role: user.position || user.department || 'LF Operator',
          email: user.email || '',
          userId: user.id,
          employeeId: user.employee_id,
          department: user.department,
          shift: user.shift || 'A',
          avatar: null
        };
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
    return null;
  };

  // Fetch steel grades
  const fetchSteelGrades = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/steel-grades/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        let grades = [];
        if (Array.isArray(data)) {
          grades = data;
        } else if (data.results) {
          grades = data.results;
        }
        setSteelGrades(grades);
      }
    } catch (error) {
      console.error('Error fetching steel grades:', error);
    }
  };

  // Fetch recent orders
  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${PRODUCTION_API_URL}/orders/?ordering=-created_at&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const orders = data.results || data;
        setRecentOrders(orders);

        // Auto-select the first in-progress order or the first order
        const inProgressOrder = orders.find(o => o.status === 'in_progress');
        if (inProgressOrder) {
          setSelectedOrder(inProgressOrder);
        } else if (orders.length > 0 && !selectedOrder) {
          setSelectedOrder(orders[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  // Fetch heats from backend
  const fetchHeats = async () => {
    setIsLoadingHeats(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/heats/?ordering=-heat_number`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let heats = [];
        if (Array.isArray(data)) {
          heats = data;
        } else if (data.results && Array.isArray(data.results)) {
          heats = data.results;
        }

        const formattedHeats = heats.map(heat => ({
          id: heat.id,
          heat_number: heat.heat_number,
          steel_grade: heat.steel_grade_detail?.code || heat.steel_grade,
          status: heat.status,
          start_time: heat.start_time,
          end_time: heat.end_time,
          current_phase: heat.current_phase
        }));

        setRecentHeats(formattedHeats.slice(0, 10));

        if (heats.length > 0) {
          const maxHeatNumber = Math.max(...heats.map(h => h.heat_number));
          setNextHeatNumber(maxHeatNumber + 1);
          setNewHeatData(prev => ({ ...prev, heat_number: (maxHeatNumber + 1).toString() }));
        }
      } else {
        console.error('Failed to fetch heats');
        useMockHeatsData();
      }
    } catch (error) {
      console.error('Error fetching heats:', error);
      useMockHeatsData();
    } finally {
      setIsLoadingHeats(false);
    }
  };

  // Fetch single heat details
  const fetchHeatDetails = async (heatId) => {
    setIsLoadingHeatDetails(true);
    try {
      const token = localStorage.getItem('access_token');
      const [heatRes, tempsRes, analysesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/heats/${heatId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/temperatures/${heatId}/?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/analyses/${heatId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const heatData = await heatRes.json();
      let temperatures = [];
      if (tempsRes.ok) {
        const tempsData = await tempsRes.json();
        temperatures = tempsData.results || tempsData;
      }
      let analyses = [];
      if (analysesRes.ok) {
        const analysesData = await analysesRes.json();
        analyses = analysesData.results || analysesData;
      }

      setSelectedHeatDetails({
        ...heatData,
        temperatures: temperatures.slice(0, 5),
        analyses: analyses.slice(0, 3)
      });
    } catch (error) {
      console.error('Error fetching heat details:', error);
    } finally {
      setIsLoadingHeatDetails(false);
    }
  };

  // Mock heats data fallback
  const useMockHeatsData = () => {
    const mockHeats = [
      { id: 1249, heat_number: 1249, steel_grade: '100Cr6', status: 'pending', start_time: new Date().toISOString(), current_phase: 'preparation' },
      { id: 1248, heat_number: 1248, steel_grade: 'S355J2', status: 'running', start_time: '2026-04-27T17:00:00', current_phase: 'heating' },
      { id: 1247, heat_number: 1247, steel_grade: '42CrMo4', status: 'ready_to_tap', start_time: '2026-04-27T17:30:00', current_phase: 'tapping' },
      { id: 1246, heat_number: 1246, steel_grade: 'CK45', status: 'completed', start_time: '2026-04-27T13:30:00', current_phase: 'completed' },
      { id: 1245, heat_number: 1245, steel_grade: 'ST52-3', status: 'completed', start_time: '2026-04-27T09:30:00', current_phase: 'completed' }
    ];
    setRecentHeats(mockHeats);
    setNextHeatNumber(1250);
    setNewHeatData(prev => ({ ...prev, heat_number: '1250' }));
  };

  // Handle order selection
  const handleOrderSelect = async (order) => {
    setSelectedOrder(order);
    setIsLoadingOrderDetails(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${PRODUCTION_API_URL}/orders/${order.id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const orderData = await response.json();
        setSelectedOrder(orderData);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target) && showAddHeatModal) {
        setShowAddHeatModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddHeatModal]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        fetchHeats();
        fetchRecentOrders();
      }, 30000);
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    }
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  // Initialize data
  useEffect(() => {
    const userInfo = getUserFromStorage();
    if (userInfo) {
      setUser(userInfo);
    } else {
      setUser({
        name: 'Operator',
        username: 'operator',
        role: 'LF Operator',
        email: '',
        shift: 'A'
      });
    }
    fetchHeats();
    fetchSteelGrades();
    fetchRecentOrders();
  }, []);

  const handleRefresh = () => {
    fetchHeats();
    fetchRecentOrders();
    if (selectedHeat) {
      fetchHeatDetails(selectedHeat.id);
    }
  };

  const handleAcknowledgeAlarm = (alarmId) => {
    setDashboardData(prev => ({
      ...prev,
      alarms: prev.alarms.filter(alarm => alarm.id !== alarmId)
    }));
  };

  const handleHeatSelect = (heat) => {
    setSelectedHeat(heat);
    fetchHeatDetails(heat.id);
  };

  // Navigate to LF page with selected heat
  const handleGoToLFWithHeat = (heat) => {
    navigate(`/lf/monitoring?heatId=${heat.id}`);
  };

  // Navigate to Production page
  const handleGoToProduction = (order) => {
    navigate('/production/orders');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenModal = async () => {
    await fetchHeats();
    setShowAddHeatModal(true);
  };

  const handleAddNewHeat = async () => {
    if (!newHeatData.steel_grade) {
      alert('Please select Steel Grade');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');

      let steelGradeId = null;
      if (steelGrades && steelGrades.length > 0) {
        const found = steelGrades.find(g => g.code === newHeatData.steel_grade);
        if (found) steelGradeId = found.id;
      }

      if (!steelGradeId) {
        const gradeMapping = {
          'ST37-2': 1,
          'ST52-3': 2,
          'CK45': 3,
          '16MnCr5': 4,
          '42CrMo4': 5,
          'C22': 6,
          'S355J2': 7,
          '100Cr6': 8
        };
        steelGradeId = gradeMapping[newHeatData.steel_grade] || 2;
      }

      const newHeatPayload = {
        heat_number: parseInt(newHeatData.heat_number),
        steel_grade: steelGradeId,
        liquid_weight: parseFloat(newHeatData.liquid_weight),
        target_liquid_weight: parseFloat(newHeatData.target_liquid_weight),
        status: 'pending',
        current_phase: 'preparation',
        furnace_id: 1,
        notes: newHeatData.notes
      };

      const response = await fetch(`${API_BASE_URL}/heats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newHeatPayload)
      });

      if (response.ok) {
        const savedHeat = await response.json();
        await fetchHeats();
        setShowAddHeatModal(false);
        setNewHeatData({
          heat_number: (nextHeatNumber + 1).toString(),
          steel_grade: 'ST52-3',
          liquid_weight: 120,
          target_liquid_weight: 120,
          notes: ''
        });
        alert(`Heat #${savedHeat.heat_number} has been added successfully!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add heat'}`);
      }
    } catch (error) {
      console.error('Error adding heat:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHeatData(prev => ({ ...prev, [name]: value }));
  };

  const getUserInitials = () => {
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const steelGradesList = ['ST37-2', 'ST52-3', 'CK45', '16MnCr5', '42CrMo4', 'C22', 'S355J2', '100Cr6'];

  // Display data for selected heat or fallback to first running heat
  const displayHeatData = selectedHeatDetails || (recentHeats.find(h => h.status === 'running') || recentHeats[0]);

  const getPhaseProgress = () => {
    if (!displayHeatData?.current_phase) return 0;
    const phasesList = {
      preparation: 0,
      ladle_arrival: 10,
      heating: 45,
      alloying: 65,
      trimming: 80,
      holding: 90,
      tapping: 100,
      completed: 100
    };
    return phasesList[displayHeatData.current_phase] || 0;
  };

  const phaseProgress = getPhaseProgress();
  const activeHeatNumber = displayHeatData?.heat_number || '—';
  const activeSteelGrade = displayHeatData?.steel_grade || '—';
  const activePhase = displayHeatData?.current_phase || (displayHeatData?.status === 'running' ? 'Heating' : '—');

  // Get priority helper functions
  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      normal: 'priority-normal',
      high: 'priority-high',
      urgent: 'priority-urgent'
    };
    return classes[priority] || 'priority-normal';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: 'fa-arrow-down',
      normal: 'fa-minus',
      high: 'fa-arrow-up',
      urgent: 'fa-exclamation-triangle'
    };
    return icons[priority] || 'fa-minus';
  };

  const getStatusClass = (status) => {
    const classes = {
      draft: 'status-draft',
      confirmed: 'status-confirmed',
      in_progress: 'status-in-progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      running: 'status-in-progress',
      ready_to_tap: 'status-confirmed',
      pending: 'status-draft'
    };
    return classes[status] || 'status-draft';
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: 'fa-file-alt',
      confirmed: 'fa-check-circle',
      in_progress: 'fa-play-circle',
      completed: 'fa-check-double',
      cancelled: 'fa-times-circle',
      running: 'fa-play-circle',
      ready_to_tap: 'fa-check-circle',
      pending: 'fa-hourglass-half'
    };
    return icons[status] || 'fa-file-alt';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      running: 'Running',
      ready_to_tap: 'Ready to Tap',
      pending: 'Pending'
    };
    return texts[status] || status;
  };

  return (
    <div className={`dashboard-container ${theme}`} style={{ direction: 'ltr', textAlign: 'left' }}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left-dash">
          <h1 className="dashboard-title">
            <i className="fas fa-tachometer-alt"></i>
            Central Dashboard - Level 2 System
          </h1>
          <div className="dashboard-subtitle">
            <span className="plant-name">Mianeh Steel Company</span>
            <span className="separator">|</span>
            <span className="current-shift">Shift {user.shift}: {user.shift === 'A' ? '06:00 - 14:00' : user.shift === 'B' ? '14:00 - 22:00' : '22:00 - 06:00'}</span>
          </div>
        </div>

        <div className="header-right">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDark ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>

          <div className="user-profile" ref={userMenuRef}>
            <div className="user-avatar">
              <span className="avatar-initials">{getUserInitials()}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="user-dropdown-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </button>

            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-avatar">
                    <span className="avatar-initials">{getUserInitials()}</span>
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{user.name}</span>
                    <span className="dropdown-user-username">@{user.username}</span>
                  </div>
                </div>
                <hr className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item">My Profile</Link>
                <Link to="/settings" className="dropdown-item">Settings</Link>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-item logout">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* System Status Bar */}
      <div className="system-status-bar">
        <div className="status-item">
          <span className="status-indicator active"></span>
          <span className="status-text">System Online</span>
        </div>
        <div className="status-item">
          <i className="fas fa-database"></i>
          <span className="status-text">Last Update: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="status-item">
          <i className="fas fa-plug"></i>
          <span className="status-text">Connected PLCs: 24</span>
        </div>
        <div className="status-item">
          <i className="fas fa-bolt"></i>
          <span className="status-text">Total Power: {dashboardData.metrics.energy?.current || 0} MW</span>
        </div>
        <button className="btn-refresh-dashboard" onClick={handleRefresh}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="grid-row">
          <div className="grid-col">
             <ProductionOverview />
          </div>
        </div>

      {/* Active Order Card */}
      <div className="active-order-card">
        <div className="active-order-header">
          <div className="active-order-title">
            <i className="fas fa-shopping-cart"></i>
            {selectedOrder ? `Selected Order: ${selectedOrder.order_number}` : 'Current Active Order'}
          </div>
          {selectedOrder && (
            <button
              className="btn-goto-production"
              onClick={() => handleGoToProduction(selectedOrder)}
            >
              Go to Production <i className="fas fa-arrow-right"></i>
            </button>
          )}
        </div>
        {isLoadingOrderDetails ? (
          <div className="loading-details">Loading order details...</div>
        ) : selectedOrder ? (
          <div className="active-order-content">
            <div className="order-info-section">
              <div className="order-customer">
                <span className="label">Customer</span>
                <span className="value">{selectedOrder.customer_name}</span>
              </div>
              <div className="order-steel-grade">
                <span className="label">Steel Grade</span>
                <span className="value">{selectedOrder.steel_grade_code}</span>
              </div>
              <div className="order-quantity">
                <span className="label">Quantity</span>
                <span className="value">
                  {selectedOrder.completed_quantity?.toFixed(1) || 0} / {selectedOrder.quantity_tons} tons
                </span>
              </div>
            </div>
            <div className="order-progress-section">
              <div className="progress-info">
                <span className="progress-name">
                  <i className="fas fa-chart-line"></i>
                  Production Progress
                </span>
                <span className="progress-percent">{selectedOrder.progress_percentage || 0}%</span>
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar-fill" style={{ width: `${selectedOrder.progress_percentage || 0}%` }}></div>
              </div>
            </div>
            <div className="order-details-section">
              <div className="order-priority">
                <span className="label">Priority</span>
                <span className={`priority-badge ${getPriorityClass(selectedOrder.priority)}`}>
                  {selectedOrder.priority?.charAt(0).toUpperCase() + selectedOrder.priority?.slice(1) || 'Normal'}
                </span>
              </div>
              <div className="order-status">
                <span className="label">Status</span>
                <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
              {selectedOrder.required_by_date && (
                <div className="order-deadline">
                  <span className="label">Required By</span>
                  <span className="value">
                    <i className="fas fa-calendar-alt"></i>
                    {new Date(selectedOrder.required_by_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-order-selected">
            <i className="fas fa-shopping-cart"></i>
            <p>No active order selected</p>
          </div>
        )}
      </div>






      {/* Recent Orders Component with Expandable Rows */}
      <RecentOrders />

      {/* Recent Heats Card with LF Control buttons */}
{/*       <div className="recent-heats-card"> */}
{/*         <div className="card-header"> */}
{/*           <h3 className="card-title"> */}
{/*             <i className="fas fa-history"></i> */}
{/*             Recent Heats */}
{/*           </h3> */}
{/*           <div className="card-actions"> */}
{/*             <button className="btn-add-heat" onClick={handleOpenModal} disabled={isLoadingHeats}> */}
{/*               <i className="fas fa-plus"></i> New Heat */}
{/*             </button> */}
{/*             <Link to="/lf/heats" className="btn-link"> */}
{/*               View All <i className="fas fa-arrow-right"></i> */}
{/*             </Link> */}
{/*           </div> */}
{/*         </div> */}
{/*         <div className="card-body"> */}
{/*           {isLoadingHeats ? ( */}
{/*             <div className="loading-spinner">Loading heats...</div> */}
{/*           ) : ( */}
{/*             <div className="heats-table-wrapper"> */}
{/*               <table className="heats-table"> */}
{/*                 <thead> */}
{/*                   <tr> */}
{/*                     <th>Heat #</th> */}
{/*                     <th>Steel Grade</th> */}
{/*                     <th>Status</th> */}
{/*                     <th>Start Time</th> */}
{/*                     <th>LF Actions</th> */}
{/*                   </tr> */}
{/*                 </thead> */}
{/*                 <tbody> */}
{/*                   {recentHeats.map((heat) => ( */}
{/*                     <tr */}
{/*                       key={heat.id} */}
{/*                       className={`${heat.status === 'running' ? 'active-row' : ''} ${selectedHeat?.id === heat.id ? 'selected-row' : ''}`} */}
{/*                       onClick={() => handleHeatSelect(heat)} */}
{/*                       style={{ cursor: 'pointer' }} */}
{/*                     > */}
{/*                       <td className="heat-number-cell">{heat.heat_number}</td> */}
{/*                       <td className="steel-grade-cell">{heat.steel_grade}</td> */}
{/*                       <td className="status-cell"> */}
{/*                         <span className={`status-badge ${heat.status}`}> */}
{/*                           {heat.status === 'running' ? 'Running' : */}
{/*                            heat.status === 'ready_to_tap' ? 'Ready to Tap' : */}
{/*                            heat.status === 'completed' ? 'Completed' : */}
{/*                            heat.status === 'cancelled' ? 'Cancelled' : 'Pending'} */}
{/*                         </span> */}
{/*                       </td> */}
{/*                       <td className="time-cell">{heat.start_time ? new Date(heat.start_time).toLocaleString() : '—'}</td> */}
{/*                       <td className="actions-cell"> */}
{/*                         <div className="lf-action-buttons"> */}
{/*                           <button */}
{/*                             className="btn-lf-details" */}
{/*                             onClick={(e) => { e.stopPropagation(); handleHeatSelect(heat); }} */}
{/*                             title="View heat details" */}
{/*                           > */}
{/*                             <i className="fas fa-info-circle"></i> Details */}
{/*                           </button> */}
{/*                           <button */}
{/*                             className="btn-lf-control" */}
{/*                             onClick={(e) => { e.stopPropagation(); handleGoToLFWithHeat(heat); }} */}
{/*                             title="Go to LF Control" */}
{/*                           > */}
{/*                             <i className="fas fa-tint"></i> LF Control */}
{/*                           </button> */}
{/*                           {(heat.status === 'completed' || heat.status === 'cancelled') && ( */}
{/*                             <button */}
{/*                               className="btn-lf-report" */}
{/*                               onClick={(e) => { e.stopPropagation(); alert(`Viewing report for Heat #${heat.heat_number}`); }} */}
{/*                               title="View report" */}
{/*                             > */}
{/*                               <i className="fas fa-file-alt"></i> Report */}
{/*                             </button> */}
{/*                           )} */}
{/*                         </div> */}
{/*                       </td> */}
{/*                     </tr> */}
{/*                   ))} */}
{/*                                     ))} */}
{/*                   {recentHeats.length === 0 && ( */}
{/*                     <tr> */}
{/*                       <td colSpan="5" className="no-data">No heats found</td> */}
{/*                     </tr> */}
{/*                   )} */}
{/*                 </tbody> */}
{/*               </table> */}
{/*             </div> */}
{/*           )} */}
{/*         </div> */}
{/*       </div> */}





        <div className="grid-row">
          <div className="grid-col col-6">
            <AlarmPanel alarms={dashboardData.alarms} onAcknowledge={handleAcknowledgeAlarm} />
          </div>
          <div className="grid-col col-6">
            <EnergyConsumptionChart energyData={dashboardData.metrics.energy} timeRange={timeRange} />
          </div>
        </div>

        <div className="grid-row">
          <div className="grid-col col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title"><i className="fas fa-industry"></i> Process Status</h3>
                <div className="card-actions">
                  <Link to="/process/eaf-control" className="btn-link">Control Process <i className="fas fa-arrow-right"></i></Link>
                </div>
              </div>
              <div className="card-body">
                <ProcessStatusPanel data={dashboardData.process} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid-row">
          <div className="grid-col col-4"><QualityMetrics data={dashboardData.metrics.quality} /></div>
          <div className="grid-col col-4"><HeatProgressTracker /></div>
          <div className="grid-col col-4"><MaterialConsumption /></div>
        </div>

        <div className="grid-row">
          <div className="grid-col col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title"><i className="fas fa-bolt"></i> Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions">
                  <button className="btn-action" onClick={() => navigate('/lf/monitoring')}>
                    <i className="fas fa-tint"></i> LF Control
                  </button>
                  <button className="btn-action"><i className="fas fa-file-alt"></i> Daily Report</button>
                  <button className="btn-action"><i className="fas fa-chart-line"></i> Performance Analysis</button>
                  <button className="btn-action"><i className="fas fa-cogs"></i> System Settings</button>
                  <button className="btn-action"><i className="fas fa-history"></i> Historical Data</button>
                  <button className="btn-action btn-action-danger"><i className="fas fa-exclamation-triangle"></i> Emergency Stop</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-left">
          <span className="footer-text"><i className="fas fa-info-circle"></i> Level 2 Automation System - v1.0.0</span>
        </div>
        <div className="footer-right">
          <span className="footer-text">Welcome, {user.name} | Last Data Update: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Add New Heat Modal */}
      {showAddHeatModal && (
        <div className="modal-overlay" onClick={() => setShowAddHeatModal(false)}>
          <div className="modal-content add-heat-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-plus-circle"></i> Add New Heat</h3>
              <button className="modal-close" onClick={() => setShowAddHeatModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label>Heat Number *</label>
                <input type="number" name="heat_number" value={newHeatData.heat_number} className="form-control" disabled />
                <small className="form-hint">Auto-generated based on last heat</small>
              </div>
              <div className="form-group">
                <label>Steel Grade *</label>
                <select name="steel_grade" value={newHeatData.steel_grade} onChange={handleInputChange} className="form-control">
                  {steelGradesList.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Liquid Weight (tons)</label>
                  <input type="number" name="liquid_weight" value={newHeatData.liquid_weight} onChange={handleInputChange} className="form-control" step="0.5" />
                </div>
                <div className="form-group half">
                  <label>Target Weight (tons)</label>
                  <input type="number" name="target_liquid_weight" value={newHeatData.target_liquid_weight} onChange={handleInputChange} className="form-control" step="0.5" />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea name="notes" value={newHeatData.notes} onChange={handleInputChange} placeholder="Optional notes..." className="form-control" rows="3" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddHeatModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddNewHeat} disabled={isSubmitting}>
                {isSubmitting ? <><i className="fas fa-spinner spin"></i> Saving...</> : <><i className="fas fa-save"></i> Add Heat</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;