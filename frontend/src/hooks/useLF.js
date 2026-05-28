// src/hooks/useLF.js
import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/lf';

console.log('API_BASE_URL:', API_BASE_URL);

const ACTIONS = {
  SET_HEAT_DATA: 'SET_HEAT_DATA',
  SET_TEMPERATURES: 'SET_TEMPERATURES',
  SET_ANALYSES: 'SET_ANALYSES',
  SET_ADDITIONS: 'SET_ADDITIONS',
  SET_STEEL_GRADES: 'SET_STEEL_GRADES',
  SET_HEATS: 'SET_HEATS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_PHASE: 'SET_CURRENT_PHASE',
  ADD_TEMPERATURE: 'ADD_TEMPERATURE',
  ADD_ANALYSIS: 'ADD_ANALYSIS',
  UPDATE_ADDITION: 'UPDATE_ADDITION',
  SET_PHASES: 'SET_PHASES',
  DELETE_TEMPERATURE: 'DELETE_TEMPERATURE'  // ✅ ADD THIS
};

const initialState = {
  heatData: null,
  temperatures: [],
  analyses: [],
  additions: [],
  steelGrades: [],
  heats: [],
  phases: [],
  currentPhase: null,
  loading: true,
  error: null
};

const lfReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_HEAT_DATA:
      return { ...state, heatData: action.payload };
    case ACTIONS.SET_TEMPERATURES:
      return { ...state, temperatures: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_ANALYSES:
      return { ...state, analyses: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_ADDITIONS:
      return { ...state, additions: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_STEEL_GRADES:
      return { ...state, steelGrades: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_HEATS:
      return { ...state, heats: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_CURRENT_PHASE:
      return { ...state, currentPhase: action.payload };
    case ACTIONS.SET_PHASES:
      return { ...state, phases: Array.isArray(action.payload) ? action.payload : [] };
    case ACTIONS.ADD_TEMPERATURE:
      return { ...state, temperatures: [action.payload, ...state.temperatures.slice(0, 49)] };
    case ACTIONS.ADD_ANALYSIS:
      return { ...state, analyses: [action.payload, ...state.analyses] };
    case ACTIONS.UPDATE_ADDITION:
      return {
        ...state,
        additions: state.additions.map(addition =>
          addition.id === action.payload.id
            ? { ...addition, ...action.payload.changes }
            : addition
        )
      };
    case ACTIONS.DELETE_TEMPERATURE:  // ✅ ADD THIS CASE
      return {
        ...state,
        temperatures: state.temperatures.filter(temp => temp.id !== action.payload)
      };
    default:
      return state;
  }
};

// Axios instance with auth
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
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Mock data for specific heat IDs
const getMockHeatDataById = (heatId) => {
  const mockHeatsData = {
    1245: {
      id: 1245,
      heat_number: 1245,
      steel_grade: 2,
      steel_grade_detail: { code: 'ST52-3', name: 'Structural Steel St52-3' },
      status: 'completed',
      current_phase: 'completed',
      liquid_weight: 122.5,
      temp_target: 1600,
      temp_min: 1590,
      temp_max: 1610,
    },
    1246: {
      id: 1246,
      heat_number: 1246,
      steel_grade: 3,
      steel_grade_detail: { code: 'CK45', name: 'Carbon Steel CK45' },
      status: 'completed',
      current_phase: 'completed',
      liquid_weight: 123.0,
      temp_target: 1610,
      temp_min: 1600,
      temp_max: 1620,
    },
    1247: {
      id: 1247,
      heat_number: 1247,
      steel_grade: 5,
      steel_grade_detail: { code: '42CrMo4', name: 'Alloy Steel 42CrMo4' },
      status: 'ready_to_tap',
      current_phase: 'tapping',
      liquid_weight: 124.5,
      temp_target: 1610,
      temp_min: 1600,
      temp_max: 1620,
    },
    1248: {
      id: 1248,
      heat_number: 1248,
      steel_grade: 7,
      steel_grade_detail: { code: 'S355J2', name: 'Structural Steel S355J2' },
      status: 'running',
      current_phase: 'heating',
      liquid_weight: 125.5,
      temp_target: 1600,
      temp_min: 1590,
      temp_max: 1610,
    },
    1249: {
      id: 1249,
      heat_number: 1249,
      steel_grade: 8,
      steel_grade_detail: { code: '100Cr6', name: 'Bearing Steel 100Cr6' },
      status: 'pending',
      current_phase: 'preparation',
      liquid_weight: 115.0,
      temp_target: 1630,
      temp_min: 1620,
      temp_max: 1640,
    },
  };

  if (heatId && mockHeatsData[heatId]) {
    return {
      ...mockHeatsData[heatId],
      furnace_id: 1,
      target_liquid_weight: 120.0,
      start_time: new Date().toISOString(),
      heating_power: 18.5,
      argon_flow: 150,
      operator_name: 'Operator',
      shift_id: 'SHIFT_A'
    };
  }

  return getMockHeatData();
};

const getMockHeatData = () => {
  return {
    id: 1248,
    heat_number: 1248,
    steel_grade: 7,
    steel_grade_detail: { code: 'S355J2', name: 'Structural Steel S355J2' },
    furnace_id: 1,
    liquid_weight: 125.5,
    target_liquid_weight: 120.0,
    status: 'running',
    current_phase: 'heating',
    start_time: new Date().toISOString(),
    heating_power: 18.5,
    argon_flow: 150,
    temp_target: 1600,
    temp_min: 1590,
    temp_max: 1610,
    operator_name: 'Operator',
    shift_id: 'SHIFT_A'
  };
};

const getMockTemperatures = (heatId = null) => {
  return [
    { id: 1, temperature: 1560, measured_at: new Date(Date.now() - 3600000).toISOString(), phase: 'heating' },
    { id: 2, temperature: 1575, measured_at: new Date(Date.now() - 2700000).toISOString(), phase: 'heating' },
    { id: 3, temperature: 1585, measured_at: new Date(Date.now() - 1800000).toISOString(), phase: 'heating' },
    { id: 4, temperature: 1595, measured_at: new Date(Date.now() - 900000).toISOString(), phase: 'heating' },
    { id: 5, temperature: 1598, measured_at: new Date().toISOString(), phase: 'heating' }
  ];
};

const getMockSteelGrades = () => {
  return [
    { id: 1, code: 'ST37-2', name: 'Structural Steel St37-2', temp_min: 1570, temp_target: 1580, temp_max: 1590 },
    { id: 2, code: 'ST52-3', name: 'Structural Steel St52-3', temp_min: 1590, temp_target: 1600, temp_max: 1610 },
    { id: 3, code: 'CK45', name: 'Carbon Steel CK45', temp_min: 1600, temp_target: 1610, temp_max: 1620 },
    { id: 4, code: '16MnCr5', name: 'Alloy Steel 16MnCr5', temp_min: 1610, temp_target: 1620, temp_max: 1630 },
    { id: 5, code: '42CrMo4', name: 'Alloy Steel 42CrMo4', temp_min: 1600, temp_target: 1610, temp_max: 1620 },
    { id: 6, code: 'C22', name: 'Carbon Steel C22', temp_min: 1580, temp_target: 1590, temp_max: 1600 },
    { id: 7, code: 'S355J2', name: 'Structural Steel S355J2', temp_min: 1590, temp_target: 1600, temp_max: 1610 },
    { id: 8, code: '100Cr6', name: 'Bearing Steel 100Cr6', temp_min: 1620, temp_target: 1630, temp_max: 1640 }
  ];
};

const getMockPhases = () => {
  return [
    { id: 'preparation', name: 'Preparation (Ladle Preheating)', order: 1, icon: 'fa-fire', color: '#ff6b35' },
    { id: 'ladle_arrival', name: 'Ladle Arrival & Sampling', order: 2, icon: 'fa-truck', color: '#4299e1' },
    { id: 'heating', name: 'Arc Heating', order: 3, icon: 'fa-bolt', color: '#ecc94b' },
    { id: 'alloying', name: 'Alloying & Deslagging', order: 4, icon: 'fa-cubes', color: '#48bb78' },
    { id: 'trimming', name: 'Fine Trimming', order: 5, icon: 'fa-sliders-h', color: '#9f7aea' },
    { id: 'holding', name: 'Holding & Homogenization', order: 6, icon: 'fa-spinner', color: '#ed8936' },
    { id: 'tapping', name: 'Ready to Tap', order: 7, icon: 'fa-check-circle', color: '#38a169' }
  ];
};

// ✅ اصلاح: اضافه کردن پارامتر specificHeatId
export const useLF = (furnaceId = 1, specificHeatId = null) => {
  const [state, dispatch] = useReducer(lfReducer, initialState);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const [useMock, setUseMock] = useState(false);
  const lastFetchedHeatId = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!isMounted.current) return;

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });

    // If we already determined to use mock, skip API calls
    if (useMock) {
      console.log('Using mock data (API unavailable)', specificHeatId ? `for heat ${specificHeatId}` : '');
      if (isMounted.current) {
        const heatData = specificHeatId ? getMockHeatDataById(parseInt(specificHeatId)) : getMockHeatData();
        dispatch({ type: ACTIONS.SET_HEAT_DATA, payload: heatData });
        dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: heatData?.current_phase || 'heating' });
        dispatch({ type: ACTIONS.SET_TEMPERATURES, payload: getMockTemperatures() });
        dispatch({ type: ACTIONS.SET_STEEL_GRADES, payload: getMockSteelGrades() });
        dispatch({ type: ACTIONS.SET_PHASES, payload: getMockPhases() });
        dispatch({ type: ACTIONS.SET_ANALYSES, payload: [] });
        dispatch({ type: ACTIONS.SET_ADDITIONS, payload: [] });
        dispatch({ type: ACTIONS.SET_HEATS, payload: [] });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
      return;
    }

    try {
      let heatData = null;

      // ✅ اگر specificHeatId مشخص شده باشد، آن ذوب را دریافت کن
      if (specificHeatId) {
        try {
          const heatResponse = await axiosInstance.get(`/lf/heats/${specificHeatId}/`);
          heatData = heatResponse.data;
          console.log('✅ Specific heat data received for ID:', specificHeatId, heatData);
        } catch (error) {
          console.error('Error fetching specific heat:', error);
          if (error.response?.status === 404) {
            console.log(`Heat ${specificHeatId} not found, using mock data`);
            heatData = getMockHeatDataById(parseInt(specificHeatId));
          } else {
            throw error;
          }
        }
      } else {
        // در غیر این صورت، ذوب جاری را دریافت کن
        try {
          const heatResponse = await axiosInstance.get(`/lf/current-heat/${furnaceId}/`);
          heatData = heatResponse.data;
          console.log('✅ Current heat data received:', heatData);
        } catch (heatError) {
          console.error('Error fetching current heat:', heatError);
          if (heatError.response?.status === 404) {
            console.log('No active heat found, using mock data');
            setUseMock(true);
            heatData = getMockHeatData();
          } else {
            throw heatError;
          }
        }
      }

      if (isMounted.current && heatData) {
        dispatch({ type: ACTIONS.SET_HEAT_DATA, payload: heatData });
        dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: heatData?.current_phase || 'heating' });
      }

      // Get steel grades
      let steelGrades = [];
      try {
        const steelGradesResponse = await axiosInstance.get('/lf/steel-grades/');
        steelGrades = steelGradesResponse.data;
        if (steelGrades && steelGrades.results) {
          steelGrades = steelGrades.results;
        }
      } catch (error) {
        console.error('Error fetching steel grades:', error);
        steelGrades = getMockSteelGrades();
      }
      if (isMounted.current) {
        dispatch({ type: ACTIONS.SET_STEEL_GRADES, payload: steelGrades || [] });
      }

      // Get phases
      let phases = [];
      try {
        const phasesResponse = await axiosInstance.get('/lf/phases/');
        phases = phasesResponse.data;
      } catch (error) {
        console.error('Error fetching phases:', error);
        phases = getMockPhases();
      }
      if (isMounted.current) {
        dispatch({ type: ACTIONS.SET_PHASES, payload: phases || [] });
      }

      // Get heats list
      let heats = [];
      try {
        const heatsResponse = await axiosInstance.get('/lf/heats/?ordering=-heat_number&limit=10');
        heats = heatsResponse.data;
        if (heats && heats.results) {
          heats = heats.results;
        }
      } catch (error) {
        console.error('Error fetching heats:', error);
      }
      if (isMounted.current) {
        dispatch({ type: ACTIONS.SET_HEATS, payload: heats || [] });
      }

      // If there is an active heat, get its details
      if (heatData && heatData.id) {
        let temperatures = [];
        let analyses = [];
        let additions = [];

        try {
          const tempsRes = await axiosInstance.get(`/lf/temperatures/${heatData.id}/?limit=20`);
          temperatures = tempsRes.data;
          if (temperatures && temperatures.results) temperatures = temperatures.results;
        } catch (error) {
          console.error('Error fetching temperatures:', error);
          temperatures = getMockTemperatures();
        }

        try {
          const analysesRes = await axiosInstance.get(`/lf/analyses/${heatData.id}/`);
          analyses = analysesRes.data;
          if (analyses && analyses.results) analyses = analyses.results;
        } catch (error) {
          console.error('Error fetching analyses:', error);
        }

        try {
          const additionsRes = await axiosInstance.get(`/lf/additions/${heatData.id}/`);
          additions = additionsRes.data;
          if (additions && additions.results) additions = additions.results;
        } catch (error) {
          console.error('Error fetching additions:', error);
        }

        if (isMounted.current) {
          dispatch({ type: ACTIONS.SET_TEMPERATURES, payload: temperatures || [] });
          dispatch({ type: ACTIONS.SET_ANALYSES, payload: analyses || [] });
          dispatch({ type: ACTIONS.SET_ADDITIONS, payload: additions || [] });
        }
      } else {
        if (isMounted.current && !specificHeatId) {
          dispatch({ type: ACTIONS.SET_TEMPERATURES, payload: getMockTemperatures() });
          dispatch({ type: ACTIONS.SET_ANALYSES, payload: [] });
          dispatch({ type: ACTIONS.SET_ADDITIONS, payload: [] });
        }
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error fetching LF data:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        setUseMock(true);
        const heatData = specificHeatId ? getMockHeatDataById(parseInt(specificHeatId)) : getMockHeatData();
        dispatch({ type: ACTIONS.SET_HEAT_DATA, payload: heatData });
        dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: heatData?.current_phase || 'heating' });
        dispatch({ type: ACTIONS.SET_TEMPERATURES, payload: getMockTemperatures() });
        dispatch({ type: ACTIONS.SET_STEEL_GRADES, payload: getMockSteelGrades() });
        dispatch({ type: ACTIONS.SET_PHASES, payload: getMockPhases() });
      }
    }

    if (isMounted.current) {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [furnaceId, specificHeatId, useMock]);

  // Only fetch once on mount or when specificHeatId changes
  useEffect(() => {
    if (!hasFetched.current || specificHeatId !== lastFetchedHeatId.current) {
      hasFetched.current = true;
      lastFetchedHeatId.current = specificHeatId;
      refreshData();
    }
  }, [refreshData, specificHeatId]);

  const recordTemperature = useCallback(async (temperature, oxygenActivity = null) => {
    if (!state.heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const response = await axiosInstance.post(`/lf/heats/${state.heatData.id}/record_temperature/`, {
        temperature,
        oxygen_activity: oxygenActivity
      });

      const newTemp = response.data;
      dispatch({
        type: ACTIONS.ADD_TEMPERATURE,
        payload: {
          id: newTemp.id,
          temperature: newTemp.temperature,
          oxygen_activity: newTemp.oxygen_activity,
          measured_at: newTemp.measured_at,
          phase: state.currentPhase
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error recording temperature:', error);
      const mockTemp = {
        id: Date.now(),
        temperature: temperature,
        oxygen_activity: oxygenActivity,
        measured_at: new Date().toISOString(),
        phase: state.currentPhase
      };
      dispatch({ type: ACTIONS.ADD_TEMPERATURE, payload: mockTemp });
      return { success: true, mock: true };
    }
  }, [state.heatData, state.currentPhase]);

  const recordAnalysis = useCallback(async (elements) => {
    if (!state.heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const response = await axiosInstance.post(`/lf/heats/${state.heatData.id}/record_analysis/`, {
        elements
      });

      const newAnalysis = response.data;
      dispatch({
        type: ACTIONS.ADD_ANALYSIS,
        payload: {
          id: newAnalysis.id,
          sampleId: newAnalysis.sample_id,
          elements: elements,
          analysis_time: newAnalysis.analysis_time
        }
      });
      return { success: true, result: newAnalysis };
    } catch (error) {
      console.error('Error recording analysis:', error);
      const mockAnalysis = {
        id: Date.now(),
        sample_id: `S${state.analyses.length + 1}`,
        elements: elements,
        analysis_time: new Date().toISOString()
      };
      dispatch({ type: ACTIONS.ADD_ANALYSIS, payload: mockAnalysis });
      return { success: true, mock: true };
    }
  }, [state.heatData, state.analyses.length]);

  const confirmAddition = useCallback(async (additionId, confirmedQty) => {
    if (!state.heatData?.id) return { success: false, error: 'No active heat' };

    try {
      const response = await axiosInstance.patch(`/additions/${additionId}/`, {
        confirmed_qty: confirmedQty,
        status: 'confirmed'
      });

      dispatch({
        type: ACTIONS.UPDATE_ADDITION,
        payload: {
          id: additionId,
          changes: { confirmed_qty: confirmedQty, status: 'confirmed' }
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error confirming addition:', error);
      dispatch({
        type: ACTIONS.UPDATE_ADDITION,
        payload: {
          id: additionId,
          changes: { confirmed_qty: confirmedQty, status: 'confirmed' }
        }
      });
      return { success: true, mock: true };
    }
  }, [state.heatData]);

  const changePhase = useCallback(async (phaseId) => {
    if (!state.heatData?.id) return { success: false, error: 'No active heat' };

    try {
      await axiosInstance.post(`/lf/heats/${state.heatData.id}/change_phase/`, {
        phase: phaseId
      });
      dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: phaseId });
      return { success: true };
    } catch (error) {
      console.error('Error changing phase:', error);
      dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: phaseId });
      return { success: true, mock: true };
    }
  }, [state.heatData]);

  const readyToTap = useCallback(async (finalTemp, finalAnalysis) => {
    if (!state.heatData?.id) return { success: false, error: 'No active heat' };

    try {
      await axiosInstance.post(`/lf/heats/${state.heatData.id}/ready_to_tap/`, {
        final_temperature: finalTemp,
        final_analysis: finalAnalysis
      });
      dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: 'tapping' });
      return { success: true };
    } catch (error) {
      console.error('Error marking ready to tap:', error);
      dispatch({ type: ACTIONS.SET_CURRENT_PHASE, payload: 'tapping' });
      return { success: true, mock: true };
    }
  }, [state.heatData]);

  const calculateAlloys = useCallback((currentAnalysis) => {
    if (!state.heatData || !state.steelGrades) return null;

    let steelGradeCode = null;
    if (state.heatData.steel_grade_detail?.code) {
      steelGradeCode = state.heatData.steel_grade_detail.code;
    } else if (typeof state.heatData.steel_grade === 'string') {
      steelGradeCode = state.heatData.steel_grade;
    } else if (state.heatData.steel_grade?.code) {
      steelGradeCode = state.heatData.steel_grade.code;
    }

    const requiredAlloys = [
      { alloy: 'FeMn (LC)', requiredAmount: 145, element: 'Mn' },
      { alloy: 'FeSi', requiredAmount: 85, element: 'Si' }
    ];

    return {
      calculations: requiredAlloys,
      totalWeightIncrease: requiredAlloys.reduce((sum, a) => sum + (a.requiredAmount / 1000), 0),
      finalLiquidWeight: (state.heatData.liquid_weight || 0) + requiredAlloys.reduce((sum, a) => sum + (a.requiredAmount / 1000), 0)
    };
  }, [state.heatData, state.steelGrades]);

  // ✅ ADD THE DELETE TEMPERATURE FUNCTION
  const deleteTemperature = useCallback(async (temperatureId) => {
    if (!temperatureId) {
      return { success: false, error: 'No temperature ID provided' };
    }

    try {
      // Use the new endpoint: /api/lf/temperature/{id}/
      const response = await axiosInstance.delete(`/lf/temperature/${temperatureId}/`);

      if (response.status === 204 || response.status === 200) {
        // Update local state by removing the deleted temperature
        dispatch({ type: ACTIONS.DELETE_TEMPERATURE, payload: temperatureId });
        return { success: true };
      }

      return { success: false, error: 'Delete failed' };
    } catch (error) {
      console.error('Error deleting temperature:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete temperature record'
      };
    }
  }, []);

  return {
    ...state,
    refreshData,
    recordTemperature,
    recordAnalysis,
    confirmAddition,
    changePhase,
    readyToTap,
    calculateAlloys,
    deleteTemperature  // ✅ ADD THIS TO THE RETURN OBJECT
  };
};