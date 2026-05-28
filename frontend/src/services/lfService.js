// src/services/lfService.js
import axios from 'axios';

// ============================================
// تنظیمات پایه API
// ============================================

// توجه: baseURL به /api/lf ختم می‌شود
// پس نیازی به اضافه کردن مجدد lf/ در مسیرها نیست
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/lf';

console.log('🔧 API_BASE_URL:', API_BASE_URL);

// ============================================
// ثابت‌های مورد نیاز برای فرانت‌اند
// ============================================

export const STEEL_TEMP_REFERENCES = {
  'ST37-2': { min: 1570, max: 1590, target: 1580 },
  'ST52-3': { min: 1590, max: 1610, target: 1600 },
  'CK45': { min: 1600, max: 1620, target: 1610 },
  '16MnCr5': { min: 1610, max: 1630, target: 1620 },
  '42CrMo4': { min: 1600, max: 1620, target: 1610 },
};

export const STEEL_ANALYSIS_LIMITS = {
  'ST37-2': {
    C: { min: 0.08, max: 0.12, target: 0.10 },
    Mn: { min: 0.40, max: 0.60, target: 0.50 },
    Si: { min: 0.15, max: 0.30, target: 0.22 },
    P: { min: 0, max: 0.035 },
    S: { min: 0, max: 0.035 }
  },
  'ST52-3': {
    C: { min: 0.12, max: 0.18, target: 0.15 },
    Mn: { min: 0.90, max: 1.20, target: 1.05 },
    Si: { min: 0.15, max: 0.35, target: 0.25 },
    P: { min: 0, max: 0.030 },
    S: { min: 0, max: 0.030 }
  },
  'CK45': {
    C: { min: 0.42, max: 0.50, target: 0.46 },
    Mn: { min: 0.50, max: 0.80, target: 0.65 },
    Si: { min: 0.15, max: 0.35, target: 0.25 },
    P: { min: 0, max: 0.025 },
    S: { min: 0, max: 0.025 }
  },
};

export const ALLOYS_REFERENCE = {
  FeMn_LC: { id: 'FEMN_LC', name: 'Low Carbon Ferro Manganese', composition: { Mn: 80.0, C: 0.5 }, yield: { Mn: 95, C: 90 } },
  FeSi: { id: 'FESI', name: 'Ferro Silicon', composition: { Si: 75.0 }, yield: { Si: 90 } },
  C: { id: 'C', name: 'Carbon Raiser', composition: { C: 98.0 }, yield: { C: 95 } },
};

// ============================================
// توکن احراز هویت
// ============================================

const getAuthToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

// ایجاد axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor برای توکن
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor برای پاسخ
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized! Please login again.');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// توابع کمکی
// ============================================

const extractData = (response) => {
  if (Array.isArray(response.data)) return response.data;
  if (response.data?.results && Array.isArray(response.data.results)) return response.data.results;
  return response.data;
};

// ============================================
// کلاس سرویس اصلی LF
// ============================================

export class LFService {

  // دریافت لیست گریدهای فولاد
  static async getSteelGrades() {
    try {
      // ✅ مسیر درست: چون baseURL به /api/lf ختم می‌شود
      const response = await axiosInstance.get('lf/steel-grades/');
      return extractData(response);
    } catch (error) {
      console.error('Error fetching steel grades:', error);
      return Object.entries(STEEL_TEMP_REFERENCES).map(([code, temp]) => ({
        code: code,
        name: code,
        temp_min: temp.min,
        temp_target: temp.target,
        temp_max: temp.max,
        analysis_limits: STEEL_ANALYSIS_LIMITS[code] || {}
      }));
    }
  }

  // دریافت لیست ذوب‌ها
  static async getHeats(furnaceId = null) {
    try {
      let url = 'lf/heats/';
      if (furnaceId) url += `?furnace_id=${furnaceId}`;
      const response = await axiosInstance.get(url);
      return extractData(response);
    } catch (error) {
      console.error('Error fetching heats:', error);
      return [];
    }
  }

  // دریافت ذوب جاری
  static async getCurrentHeat(furnaceId = 1) {
    try {
      const response = await axiosInstance.get(`lf/current-heat/${furnaceId}/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('No active heat found');
        return null;
      }
      console.error('Error fetching current heat:', error);
      return null;
    }
  }

  // دریافت تاریخچه دماها
  static async getTemperatureHistory(heatId, limit = 50) {
    try {
      const response = await axiosInstance.get(`lf/temperatures/${heatId}/?limit=${limit}`);
      const data = extractData(response);
      console.log(`📊 Temperatures received: ${data?.length || 0} records`);
      return data;
    } catch (error) {
      console.error('Error fetching temperature history:', error);
      return [];
    }
  }

  // دریافت تاریخچه آنالیزها
  static async getAnalysisHistory(heatId) {
    try {
      const response = await axiosInstance.get(`lf/analyses/${heatId}/`);
      const data = extractData(response);
      console.log(`🧪 Analyses received: ${data?.length || 0} records`);
      return data;
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }
  }

  // دریافت لیست افزودنی‌ها
  static async getAdditions(heatId) {
    try {
      const response = await axiosInstance.get(`lf/additions/${heatId}/`);
      const data = extractData(response);
      console.log(`📦 Additions received: ${data?.length || 0} records`);
      return data;
    } catch (error) {
      console.error('Error fetching additions:', error);
      return [];
    }
  }

  // دریافت فازهای فرآیند
  static async getProcessPhases() {
    try {
      const response = await axiosInstance.get('lf/phases/');
      return extractData(response);
    } catch (error) {
      console.error('Error fetching phases:', error);
      return [
        { id: 'preparation', name: 'Preparation', order: 1, icon: 'fa-fire', color: '#ff6b35' },
        { id: 'ladle_arrival', name: 'Ladle Arrival', order: 2, icon: 'fa-truck', color: '#4299e1' },
        { id: 'heating', name: 'Arc Heating', order: 3, icon: 'fa-bolt', color: '#ecc94b' },
        { id: 'alloying', name: 'Alloying', order: 4, icon: 'fa-cubes', color: '#48bb78' },
        { id: 'trimming', name: 'Fine Trimming', order: 5, icon: 'fa-sliders-h', color: '#9f7aea' },
        { id: 'holding', name: 'Holding', order: 6, icon: 'fa-spinner', color: '#ed8936' },
        { id: 'tapping', name: 'Ready to Tap', order: 7, icon: 'fa-check-circle', color: '#38a169' }
      ];
    }
  }

  // محاسبه فروآلیاژها
  static calculateAlloys(liquidWeight, currentAnalysis, targetSteelGrade, steelGradesData = null) {
    let targetLimits = null;

    if (steelGradesData) {
      const targetGrade = steelGradesData.find(g => g.code === targetSteelGrade);
      if (targetGrade?.analysis_limits) targetLimits = targetGrade.analysis_limits;
    }

    if (!targetLimits) targetLimits = STEEL_ANALYSIS_LIMITS[targetSteelGrade];
    if (!targetLimits) {
      console.warn(`Steel grade ${targetSteelGrade} not found`);
      return { calculations: [], totalWeightIncrease: 0, finalLiquidWeight: liquidWeight };
    }

    const calculations = [];
    const liquidKg = liquidWeight * 1000;

    for (const [element, target] of Object.entries(targetLimits)) {
      if (!target.target) continue;

      const currentValue = currentAnalysis[element] || 0;
      const deficit = (target.target - currentValue) / 100;
      if (deficit <= 0) continue;

      let suitableAlloy = null;
      for (const [alloyKey, alloy] of Object.entries(ALLOYS_REFERENCE)) {
        if (alloy.composition[element]) {
          suitableAlloy = { key: alloyKey, ...alloy };
          break;
        }
      }

      if (suitableAlloy) {
        const elementContent = suitableAlloy.composition[element] / 100;
        const elementYield = (suitableAlloy.yield[element] || 85) / 100;
        const requiredKg = (deficit * liquidKg) / (elementContent * elementYield);

        calculations.push({
          alloy: suitableAlloy.name,
          alloyKey: suitableAlloy.key,
          element: element,
          requiredAmount: Math.ceil(requiredKg),
          currentValue: currentValue,
          targetValue: target.target,
          deficit: deficit * 100
        });
      }
    }

    const totalWeightIncrease = calculations.reduce((sum, calc) => {
      const alloy = ALLOYS_REFERENCE[calc.alloyKey];
      const liquidYield = (alloy.yield[calc.element] || 85) / 100;
      return sum + (calc.requiredAmount * liquidYield);
    }, 0);

    return {
      calculations,
      totalWeightIncrease: totalWeightIncrease / 1000,
      finalLiquidWeight: liquidWeight + (totalWeightIncrease / 1000)
    };
  }

  // ثبت دمای جدید
  static async recordTemperature(heatId, temperature, oxygenActivity = null) {
    try {
      const response = await axiosInstance.post(`lf/heats/${heatId}/record_temperature/`, {
        temperature,
        oxygen_activity: oxygenActivity
      });
      return response.data;
    } catch (error) {
      console.error('Error recording temperature:', error);
      throw error;
    }
  }

  // ثبت آنالیز جدید
  static async recordAnalysis(heatId, elements) {
    try {
      const response = await axiosInstance.post(`lf/heats/${heatId}/record_analysis/`, {
        elements
      });
      return response.data;
    } catch (error) {
      console.error('Error recording analysis:', error);
      throw error;
    }
  }

  // تایید افزودنی
  static async confirmAddition(heatId, additionId, confirmedQty) {
    try {
      const response = await axiosInstance.patch(`lf/additions/${additionId}/`, {
        confirmed_qty: confirmedQty,
        status: 'confirmed'
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming addition:', error);
      throw error;
    }
  }

  // تغییر فاز
  static async changePhase(heatId, phase) {
    try {
      const response = await axiosInstance.post(`lf/heats/${heatId}/change_phase/`, {
        phase
      });
      return response.data;
    } catch (error) {
      console.error('Error changing phase:', error);
      throw error;
    }
  }

  // تایید آمادگی تخلیه
  static async markReadyToTap(heatId, finalTemp, finalAnalysis) {
    try {
      const response = await axiosInstance.post(`lf/heats/${heatId}/ready_to_tap/`, {
        final_temperature: finalTemp,
        final_analysis: finalAnalysis
      });
      return response.data;
    } catch (error) {
      console.error('Error marking ready to tap:', error);
      throw error;
    }
  }

  // تنظیم توکن
  static setAuthToken(token) {
    if (token) {
      localStorage.setItem('access_token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('access_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // خروج
  static logout() {
    this.setAuthToken(null);
  }
}

export default LFService;