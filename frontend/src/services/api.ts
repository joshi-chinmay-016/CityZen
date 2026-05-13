import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

/**
 * =========================================================
 * BACKEND CORS INSTRUCTIONS
 * =========================================================
 * To allow the frontend to communicate with the backend,
 * ensure the backend Express app has CORS configured correctly:
 * 
 * const cors = require('cors');
 * app.use(cors({
 *   origin: 'http://localhost:3000',
 *   credentials: true
 * }));
 * =========================================================
 */

// Create a reusable Axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Centralized robust error handling
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        console.error('[API Error] Timeout: The request took too long and was aborted.', error.config?.url);
        return Promise.reject(error);
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
        // Treat 404 as a warning (some endpoints are optional and handled by callers)
        if (error.response.status === 404) {
          console.warn(`[API Warning 404] at ${error.config?.url}:`, error.response.data || {});
        } else {
          console.error(`[API Error ${error.response.status}] at ${error.config?.url}:`, error.response.data);
        }
        // Preserve original axios error so callers can inspect `error.response`
        return Promise.reject(error);
    } else if (error.request) {
      // The request was made but no response was received
        console.error(`[API Error] Network failure at ${error.config?.url}. Backend may be unavailable or CORS blocked.`, error.request);
        return Promise.reject(error);
    } else {
      // Something happened in setting up the request that triggered an Error
        console.error(`[API Error] Request setup failed:`, error.message);
        return Promise.reject(error);
    }
  }
);

export default api;
