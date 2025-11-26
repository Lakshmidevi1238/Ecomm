import axios from "axios";

let navigateFunction;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      if (navigateFunction) {
        navigateFunction("/login"); 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
