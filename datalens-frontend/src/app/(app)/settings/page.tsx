"use client";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
          Configuración
        </h1>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-4">
            Preferencias
          </h2>

          <div className="space-y-6 text-sm sm:text-base">
            {/* Tema */}
            <div>
              <h3 className="font-semibold mb-1">Tema</h3>
              <p className="text-gray-400 mb-2">
                Próximamente podrás elegir entre tema claro y oscuro.
              </p>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs"
              >
                Oscuro (predeterminado)
              </button>
            </div>

            {/* Idioma */}
            <div>
              <h3 className="font-semibold mb-1">Idioma</h3>
              <p className="text-gray-400 mb-2">
                Actualmente DataLens Analytics está configurado en español.
                En futuras versiones podrás cambiar el idioma de la interfaz.
              </p>
              <button
                type="button"
                className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs"
              >
                Español
              </button>
            </div>

            {/* Notificaciones (solo descriptivo) */}
            <div>
              <h3 className="font-semibold mb-1">Notificaciones</h3>
              <p className="text-gray-400">
                En versiones posteriores podrás activar correos de alerta cuando
                un dataset falle al cargar o cuando se agreguen nuevos análisis a
                tus proyectos.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}