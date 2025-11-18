import axios from "axios";

// === BASE URLs según microservicio ===
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8000";
const DATASET_URL = process.env.NEXT_PUBLIC_DATASET_URL || "http://localhost:8001";
const PROJECT_URL = process.env.NEXT_PUBLIC_PROJECT_URL || "http://localhost:8003";

// === Helper para crear instancia con interceptores ===
function createClient(baseURL: string) {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      console.error("[HTTP Error]", err.response?.data || err.message);
      return Promise.reject(err);
    }
  );

  return instance;
}

// === Instancias separadas ===
export const authHttp = createClient(AUTH_URL);
export const datasetHttp = createClient(DATASET_URL);
export const projectHttp = createClient(PROJECT_URL);