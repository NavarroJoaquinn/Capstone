"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Aquí más adelante conectaremos con el auth-service
      console.log("Intentando login:", { email, password });
      alert("Inicio de sesión simulado ✅");
    } catch (err) {
      setError("Error al iniciar sesión");
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-80">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            required
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