import { authHttp } from "../lib/https";

export const authService = {
  register: (data: { email: string; password: string; company_name: string }) =>
    authHttp.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    authHttp.post("/auth/login", data),

   me: () => {
    // Leer token desde localStorage (ajusta la clave si usas otra)
    let token: string | null = null;

    if (typeof window !== "undefined") {
      token = window.localStorage.getItem("token");
    }

    return authHttp.get("/auth/me", {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}, // si no hay token, va vacío y el backend devolverá 403 (que ya manejamos en el front)
    });
  },
};