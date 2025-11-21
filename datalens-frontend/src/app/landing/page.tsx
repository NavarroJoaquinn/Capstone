import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-center items-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        Bienvenido a <span className="text-blue-500">DataLens</span>
      </h1>
      <p className="text-zinc-400 max-w-lg mb-8">
        DataLens es una plataforma de análisis inteligente que te permite
        subir, explorar y visualizar tus datasets con facilidad.
      </p>

      <div className="space-x-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 border border-blue-500 text-blue-400 hover:bg-blue-900/30 rounded-lg"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}