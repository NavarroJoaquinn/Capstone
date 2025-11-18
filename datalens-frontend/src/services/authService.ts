import { authHttp } from "../lib/https";

export const authService = {
  register: (data: { email: string; password: string; company_name: string }) =>
    authHttp.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    authHttp.post("/auth/login", data),

  me: () => authHttp.get("/auth/me"),
};