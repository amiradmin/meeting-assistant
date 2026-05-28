import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for CSRF token
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || { error: error.message };
  }
);

// PLC Connection APIs
export const plcApi = {
  // Get all connection statuses
  getStatus: () => api.get('/plc/api/status/'),

  // Connect to PLC(s)
  connect: (connectionId = null) => api.post('/plc/api/connect/', { connection_id: connectionId }),

  // Disconnect from PLC(s)
  disconnect: (connectionId = null) => api.post('/plc/api/disconnect/', { connection_id: connectionId }),

  // Read tags
  readTags: (tags = null) => {
    const params = tags ? { tags: tags.join(',') } : {};
    return api.get('/plc/api/read/', { params });
  },

  // Write to a tag
  writeTag: (tag, value) => api.post('/plc/api/write/', { tag, value }),

  // Get PLC info (CPU details)
  getPLCInfo: () => api.get('/plc/api/plc-info/'),

  // Browse OPC UA nodes
  browseOPCUA: (connectionId = 'cp_opcua_server', node = 'Root') =>
    api.get('/plc/api/browse-opcua/', { params: { connection_id: connectionId, node } }),
};

// Tag configuration (matches Django settings)
export const TAG_CONFIG = {
  temperature: {
    name: 'Temperature',
    unit: '°C',
    address: 'DB10.REAL0',
    connectionType: 's7_bus',
    min: 0,
    max: 150,
    warning: 100,
    critical: 120,
  },
  pressure: {
    name: 'Pressure',
    unit: 'bar',
    address: 'DB10.REAL4',
    connectionType: 's7_bus',
    min: 0,
    max: 10,
    warning: 7,
    critical: 9,
  },
  motor_speed: {
    name: 'Motor Speed',
    unit: 'RPM',
    address: 'DB10.INT8',
    connectionType: 's7_bus',
    min: 0,
    max: 3000,
    warning: 2500,
    critical: 2800,
  },
  valve_position: {
    name: 'Valve Position',
    unit: '%',
    address: 'DB10.REAL12',
    connectionType: 's7_bus',
    min: 0,
    max: 100,
    warning: 90,
    critical: 95,
  },
  conveyor_running: {
    name: 'Conveyor',
    unit: '',
    address: 'DB10.BOOL16.0',
    connectionType: 's7_bus',
    type: 'boolean',
  },
  production_rate: {
    name: 'Production Rate',
    unit: 'units/hr',
    address: 'ns=3;s=ProductionData.Rate',
    connectionType: 'cp_opcua_server',
    min: 0,
    max: 1000,
  },
  energy_consumption: {
    name: 'Energy Consumption',
    unit: 'kW',
    address: 'ns=2;s=Energy.MainMeter',
    connectionType: 'external_opcua',
    min: 0,
    max: 500,
  },
};

export default plcApi;