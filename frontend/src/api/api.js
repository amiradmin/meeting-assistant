import axios from "axios";

// Use Vite env variable with fallback
const API_URL ="http://192.168.150.10:8000/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor (optional, e.g., for auth token)
api.interceptors.request.use(
  (config) => {
    // Example: attach auth token if available
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

// Helper function for file uploads
export const uploadFile = async (url, file, extraData = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Add any extra data
  Object.keys(extraData).forEach((key) => {
    formData.append(key, extraData[key]);
  });

  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;
