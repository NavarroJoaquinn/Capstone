"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        company_name: companyName,   
      });

      router.push("/login");
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Error al registrar usuario.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-zinc-900 p-6 rounded-xl"
      >
        <h1 className="text-xl font-bold text-center">Crear cuenta</h1>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        {/* Empresa */}
        <div className="space-y-2">
          <label className="text-sm opacity-80">Nombre de la Empresa</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            required
          />
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm */}
        <div className="space-y-2">
          <label className="text-sm opacity-80">Confirmar contraseña</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 rounded bg-zinc-800 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>

        <p className="text-center text-sm text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}