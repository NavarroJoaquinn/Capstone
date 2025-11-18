'use client';
import { useState } from 'react';

export default function NewProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      alert('El nombre del proyecto es obligatorio');
      return;
    }

    // ⚙️ Aquí luego conectaremos al backend
    console.log({
      nombre: projectName,
      descripcion: description,
      dataset: file ? file.name : 'Ninguno',
    });

    alert('Proyecto creado (demo). Pronto conectaremos con el backend.');
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 transition">
      <h1 className="text-2xl font-bold mb-6 text-center">Crear Nuevo Proyecto</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Nombre del Proyecto *</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Ej: Análisis de ventas"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="Breve descripción del proyecto..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Subir Dataset (CSV)</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 dark:text-white cursor-pointer"
          />
          {file && <p className="text-sm mt-2">Archivo seleccionado: <strong>{file.name}</strong></p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Crear Proyecto
        </button>
      </form>
    </div>
  );
}