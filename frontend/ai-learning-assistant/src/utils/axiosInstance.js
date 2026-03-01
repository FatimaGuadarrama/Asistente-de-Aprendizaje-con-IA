import axios from "axios";
import { BASE_URL } from "./apiPaths";

const API = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: API,
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Interceptor de solicitudes
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 500) {
                console.error("Error del servidor. Inténtalo de nuevo más tarde.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Tiempo de espera agotado. Inténtalo de nuevo.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;