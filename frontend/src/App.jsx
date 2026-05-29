import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Profile from './pages/Profile';
import LFLayout from './pages/LF/LFLayout';
import ProductionOrders from './components/Production/ProductionOrders';
import ProductionBuckets from './components/Production/ProductionBuckets';
import ProductionHeats from './components/Production/ProductionHeats';
import LFMainDashboard from './components/LF/LFMainDashboard';
import EAFMainDashboard from './components/EAF/EAFMainDashboard';
import UserManagement from './components/Admin/UserManagement';

// Import PLC components
import PLCDashboard from './components/PLC/PLCDashboard';
import ControlPanel from './components/PLC/ControlPanel';
import PLCConnectionStatus from './components/PLC/PLCConnectionStatus';
import PLCTagMonitor from './components/PLC/PLCTagMonitor';
import PLCS7Bus from './components/PLC/PLCS7Bus';
import PLCOpcUaServer from './components/PLC/PLCOpcUaServer';
import PLCExternalOpcUa from './components/PLC/PLCExternalOpcUa';
import PLCDataLogger from './components/PLC/PLCDataLogger';
import PLCAlarms from './components/PLC/PLCAlarms';
import PLCHistoricalData from './components/PLC/PLCHistoricalData';
import PLCConfiguration from './components/PLC/PLCConfiguration';

// Import Meeting components
import MeetingRecorder from './pages/MeetingRecorder';
import MeetingDetails from './pages/MeetingDetails';
import MeetingsList from './pages/MeetingsList';

import '@fortawesome/fontawesome-free/css/all.min.css';


function App() {
    return (
        <Router>
            <Routes>
                {/* Login Route - Public */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes with DashboardLayout */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Nested routes will render inside <Outlet /> */}
                    <Route index element={<Dashboard />} />
                    <Route path="locations" element={<Locations />} />
                    <Route path="profile" element={<Profile />} />

                    {/* ==================== MEETING ASSISTANT ROUTES ==================== */}
                    {/* Meeting Routes */}
                    <Route path="meetings" element={<MeetingRecorder />} />
                    <Route path="meetings/recorder" element={<MeetingRecorder />} />
                    <Route path="meetings/list" element={<MeetingsList />} />
                    <Route path="meeting/:id" element={<MeetingDetails />} />

                    {/* ==================== PLC COMMUNICATION ROUTES ==================== */}
                    {/* Main PLC Routes */}
                    <Route path="plc/dashboard" element={<PLCDashboard />} />
                    <Route path="plc/connection" element={<PLCConnectionStatus />} />
                    <Route path="plc/control" element={<ControlPanel />} />
                    <Route path="plc/tags" element={<PLCTagMonitor />} />

                    {/* Connection Type Specific Routes */}
                    <Route path="plc/s7-bus" element={<PLCS7Bus />} />
                    <Route path="plc/opcua-server" element={<PLCOpcUaServer />} />
                    <Route path="plc/external-opcua" element={<PLCExternalOpcUa />} />

                    {/* Data & Monitoring Routes */}
                    <Route path="plc/data-logger" element={<PLCDataLogger />} />
                    <Route path="plc/alarms" element={<PLCAlarms />} />
                    <Route path="plc/history" element={<PLCHistoricalData />} />
                    <Route path="plc/configuration" element={<PLCConfiguration />} />

                    {/* Settings Routes */}
                    <Route path="settings/plc" element={<PLCConfiguration />} />

                    {/* Production Routes */}
                    <Route path="production/orders" element={<ProductionOrders />} />
                    <Route path="production/buckets" element={<ProductionBuckets />} />
                    <Route path="production/heats" element={<ProductionHeats />} />

                    {/* LF Routes */}
                    <Route path="lf/monitoring" element={<LFMainDashboard />} />
                    <Route path="lf/heat-data" element={<LFMainDashboard />} />
                    <Route path="lf/temperature-control" element={<LFMainDashboard />} />
                    <Route path="lf/alloy-calculation" element={<LFMainDashboard />} />
                    <Route path="lf/analysis" element={<LFMainDashboard />} />
                    <Route path="lf/process-progress" element={<LFMainDashboard />} />
                    <Route path="lf/events" element={<LFMainDashboard />} />
                    <Route path="lf/delays" element={<LFMainDashboard />} />
                    <Route path="lf/*" element={<LFLayout />} />

                    {/* EAF Routes */}
                    <Route path="eaf/melting-control" element={<EAFMainDashboard />} />
                    <Route path="eaf/heat-data" element={<EAFMainDashboard />} />
                    <Route path="eaf/charging" element={<EAFMainDashboard />} />
                    <Route path="eaf/energy-monitor" element={<EAFMainDashboard />} />
                    <Route path="eaf/electrical-profile" element={<EAFMainDashboard />} />
                    <Route path="eaf/events" element={<EAFMainDashboard />} />
                    <Route path="eaf/delays" element={<EAFMainDashboard />} />

                    {/* Admin Routes */}
                    <Route path="admin/users" element={<UserManagement />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;