"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login({ email, password });

      // Guardar token
      const token = res.data.access_token;
      localStorage.setItem("token", token);

      // Ir aa la pagina principal
      router.push("/");
    } catch (err: any) {
      console.error(err);

      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Credenciales incorrectas";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 grid place-items-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 bg-zinc-900 p-6 rounded-xl"
      >
        <h1 className="text-xl font-bold text-center">Iniciar sesión</h1>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        <div className="space-y-2">
          <label className="text-sm opacity-80">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Iniciar sesión"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Crear una
          </Link>
        </p>
      </form>
    </div>
  );
}