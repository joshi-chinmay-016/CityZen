/*
SHARED MODULE: API Service
*/

import axios from 'axios';

const DEFAULT_API_BASE_URL = "http://localhost:5000";

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const baseUrl = (rawUrl || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const requestUrl = `${config.baseURL || ""}${config.url || ""}`;
  console.log("[api] request", {
    method: config.method,
    url: requestUrl,
    payload: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("[api] response", {
      url: `${response.config.baseURL || ""}${response.config.url || ""}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[api] error", {
      url: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;
