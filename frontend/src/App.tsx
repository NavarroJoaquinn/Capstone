import { useSummary } from "./features/dashboard/useSummary";

const TOKEN = "FAKE.JWT";
const DATASET_ID = "abc123";

export default function App() {
  const { data, isLoading, error } = useSummary(DATASET_ID, TOKEN);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <div>hola mundo (sin clases)</div>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
        <h1 className="text-3xl font-bold mb-4">DataLens • Dashboard (Summary)</h1>

        {isLoading && <div className="opacity-70">Cargando…</div>}
        {error && <div className="text-red-400 text-sm">{String(error)}</div>}

        {!!data && (
          <pre className="bg-zinc-900 p-4 rounded-lg overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}

        <div className="mt-4 text-sm opacity-60">
          Modo mocks: {import.meta.env.VITE_USE_MOCKS === "true" ? "ON" : "OFF"}
        </div>
      </div>
      );
    </div>)
}