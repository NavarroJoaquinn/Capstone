import axios, { AxiosInstance } from "axios";

// Helper para adjuntar el token JWT desde localStorage
const withAuth = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  return instance;
};

// URLs base de cada microservicio (puedes ajustarlas o moverlas a .env)
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ?? "http://localhost:8000";
const DATASET_BASE_URL =
  process.env.NEXT_PUBLIC_DATASET_SERVICE_URL ?? "http://localhost:8001";
const PROJECT_BASE_URL =
  process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL ?? "http://localhost:8003";
const ANALYTICS_BASE_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL ?? "http://localhost:8004";

// Instancias HTTP
export const authHttp = axios.create({
  baseURL: AUTH_BASE_URL,
});

// Estos sí necesitan siempre el token
export const datasetHttp = withAuth(
  axios.create({
    baseURL: DATASET_BASE_URL,
  })
);

export const projectHttp = withAuth(
  axios.create({
    baseURL: PROJECT_BASE_URL,
  })
);

export const analyticsHttp = withAuth(
  axios.create({
    baseURL: ANALYTICS_BASE_URL,
  })
);