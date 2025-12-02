// src/api/axiosInstance.js
import axios from "axios";

let navigateFunction;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/v1` : "/api/v1",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network or CORS error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;
    if (status === 401) {
      localStorage.clear();
      if (navigateFunction) navigateFunction("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
