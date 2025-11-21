"use client";

import {
  FaFolderOpen,
  FaChartBar,
  FaDatabase,
  FaPlus,
  FaUpload,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="w-full min-h-screen bg-[#0d1117] text-white flex justify-center">
      <div className="w-full max-w-7xl px-8 py-12">

        {/* Encabezado */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Hola, Usuario 👋</h1>
          <p className="text-gray-400 text-lg">
            Bienvenido a DataLens. ¿Qué quieres hacer hoy?
          </p>
        </div>

        {/* Tarjetas de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Proyectos */}
          <div
            onClick={() => router.push("/projects")}
            className="cursor-pointer bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <FaFolderOpen className="text-4xl mb-4 text-blue-400" />
            <h2 className="text-2xl font-semibold mb-2">Proyectos</h2>
            <p className="text-gray-400">
              Crea, gestiona y analiza tus proyectos.
            </p>
          </div>

          {/* Datasets */}
          <div
            onClick={() => router.push("/datasets")}
            className="cursor-pointer bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <FaDatabase className="text-4xl mb-4 text-green-400" />
            <h2 className="text-2xl font-semibold mb-2">Datasets</h2>
            <p className="text-gray-400">
              Sube y organiza tus datasets fácilmente.
            </p>
          </div>

          {/* Analíticas */}
          <div
            onClick={() => router.push("/analytics")}
            className="cursor-pointer bg-[#111827] p-6 rounded-2xl border border-[#1f2937] shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <FaChartBar className="text-4xl mb-4 text-purple-400" />
            <h2 className="text-2xl font-semibold mb-2">Analíticas</h2>
            <p className="text-gray-400">
              Explora dashboards, KPIs e insights.
            </p>
          </div>

        </div>

        {/* Acciones rápidas */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold text-center mb-4">
            Acciones rápidas
          </h2>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/projects/new")}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md"
            >
              <FaPlus /> Crear Proyecto
            </button>

            <button
              onClick={() => router.push("/datasets/upload")}
              className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-md"
            >
              <FaUpload /> Subir Dataset
            </button>

            <button
              onClick={() => router.push("/analytics")}
              className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md"
            >
              <FaChartBar /> Ver Insights
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}