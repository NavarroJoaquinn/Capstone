// src/features/auth/LoginPage.tsx
import { useState } from "react";
import { login } from "@/api/auth";
import { useAuth } from "@/store/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const setToken = useAuth((s) => s.setToken);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { access_token } = await login({ email, password });
      setToken(access_token);
      nav("/datasets");
    } catch (e: any) {
      setErr(e?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-zinc-900 p-6 rounded-xl">
        <h1 className="text-xl font-bold">Iniciar sesión</h1>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <div className="space-y-2">
          <label className="text-sm opacity-80">Email</label>
          <input
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Password</label>
          <input
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-indigo-600 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}