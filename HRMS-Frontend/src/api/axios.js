import axios from "axios";

// Debug: Log the environment variable
console.log('🔍 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('🔍 All env vars:', import.meta.env);

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8082/api"; // Fixed: backend runs on 8082 with /api prefix

const api = axios.create({
  baseURL: BASE_URL,
});

// Debug: Log the baseURL being used
console.log('🔍 Axios baseURL:', api.defaults.baseURL);

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR =================
   Auto logout on token expiry / invalid token
========================================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
