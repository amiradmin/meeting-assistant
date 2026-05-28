// services/modelVersionService.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.150.10:8000/api';

export const modelVersionService = {
  // Get all model versions
  getAllModelVersions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/model-versions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model versions:', error);
      throw error;
    }
  },

  // Get latest versions for each type
  getLatestVersions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/model-versions/get_latest_versions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest versions:', error);
      // Return empty structure instead of throwing error
      return {
        status: 'success',
        latest_versions: {},
        total_types: 0
      };
    }
  },

  // Get models by type
  getByType: async (type) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/model-versions/get_by_type/?type=${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching models by type ${type}:`, error);
      throw error;
    }
  },

  // Get model types
  getTypes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/model-versions/get_types/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model types:', error);
      throw error;
    }
  },

  // Get statistics - handle 500 errors gracefully
  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/model-versions/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model stats:', error);
      // Return default stats instead of throwing error
      return {
        status: 'success',
        stats: {
          total_models: 0,
          types_breakdown: {},
          recent_models_30_days: 0,
          latest_model: null
        }
      };
    }
  }
};