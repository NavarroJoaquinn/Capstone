import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (t: string | null) => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: sessionStorage.getItem("DL_TOKEN"),
  setToken: (t) => {
    if (t) sessionStorage.setItem("DL_TOKEN", t);
    else sessionStorage.removeItem("DL_TOKEN");
    set({ token: t });
  },
}));