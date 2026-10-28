import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("wavecape_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith("/auth/")) {
    localStorage.removeItem("wavecape_token");
    localStorage.removeItem("wavecape_user");
    window.dispatchEvent(new Event("auth-expired"));
  }
  return Promise.reject(error);
});

export default api;
