"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { projectService } from "@/services/projectService";
import { datasetService } from "@/services/datasetService";
import { analyticsService } from "@/services/analyticsService";
import { useToast } from "@/components/ToastProvider";

// Plotly solo en cliente
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type AnalysisType = "histogram" | "piechart" | "heatmap" | string;

interface AnalysisDoc {
  _id: string;
  project_id: string;
  dataset_id: string;
  type: AnalysisType;
  columns: string[];
  name?: string;
  description?: string;
  created_at?: string;
}

interface DatasetDoc {
  id?: string;
  _id?: string;
  name: string;
  columns?: string[];
  [key: string]: any;
}

// ================== COMPONENTE PARA MOSTRAR EL GRÁFICO ==================

function AnalysisChart({ analysis }: { analysis: AnalysisDoc }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [plotData, setPlotData] = useState<any[]>([]);
  const [layout, setLayout] = useState<any>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        if (!analysis.dataset_id) return;

        // Escogemos endpoint según tipo
        if (analysis.type === "histogram") {
          const col = analysis.columns[0];
          const res = await analyticsService.histogram(
            analysis.dataset_id,
            col
          );
          if (cancelled) return;
          const data = res.data;
          setPlotData([
            {
              type: "bar",
              x: data.bins,
              y: data.counts,
            },
          ]);
          setLayout({
            title: analysis.name || `Histograma: ${col}`,
            xaxis: { title: col },
            yaxis: { title: "Frecuencia" },
          });
        } else if (analysis.type === "piechart") {
          const col = analysis.columns[0];
          const res = await analyticsService.pie(analysis.dataset_id, col);
          if (cancelled) return;
          const data = res.data;
          setPlotData([
            {
              type: "pie",
              labels: data.labels,
              values: data.values,
              textinfo: "label+percent",
            },
          ]);
          setLayout({
            title: analysis.name || `Gráfico de torta: ${col}`,
          });
        } else if (analysis.type === "heatmap") {
          const res = await analyticsService.heatmap(analysis.dataset_id);
          if (cancelled) return;
          const data = res.data;
          setPlotData([
            {
              type: "heatmap",
              z: data.matrix,
              x: data.columns,
              y: data.columns,
              colorscale: "Viridis",
            },
          ]);
          setLayout({
            title: analysis.name || "Mapa de calor",
          });
        } else {
          if (!cancelled) {
            toast.show(
              "Este tipo de análisis aún no tiene visualización embebida.",
              "info"
            );
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          toast.show("No se pudo cargar el gráfico del análisis.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [analysis, toast]);

  if (loading) {
    return (
      <p className="text-sm text-zinc-400 mt-2">
        Cargando visualización del análisis...
      </p>
    );
  }

  if (!plotData.length) {
    return (
      <p className="text-sm text-zinc-400 mt-2">
        No se encontraron datos para dibujar el gráfico.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <Plot
        data={plotData}
        layout={{
          ...layout,
          autosize: true,
          height: 320,
          margin: { l: 40, r: 20, t: 40, b: 40 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          font: { color: "#f9fafb" },
        }}
        style={{ width: "100%", height: "320px" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}

// ================== PÁGINA PRINCIPAL ==================

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [project, setProject] = useState<any>(null);
  const [datasets, setDatasets] = useState<DatasetDoc[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisDoc[]>([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);

  // ---------- edición proyecto ----------
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // ---------- agregar datasets ----------
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [availableDatasets, setAvailableDatasets] = useState<DatasetDoc[]>([]);
  const [loadingAvailableDatasets, setLoadingAvailableDatasets] =
    useState(false);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);

  // ---------- nombres de datasets para análisis ----------
  const [datasetNames, setDatasetNames] = useState<Record<string, string>>({});

  const getDatasetDocId = (ds: DatasetDoc) => ds.id ?? ds._id ?? "";

  const getDatasetName = (datasetId: string) => {
    // 1) Buscar en los datasets ya cargados del proyecto
    const ds = datasets.find((d) => getDatasetDocId(d) === datasetId);
    if (ds) return ds.name || datasetId;

    // 2) Buscar en el mapa resuelto adicional
    if (datasetNames[datasetId]) return datasetNames[datasetId];

    // 3) Fallback
    return datasetId;
  };

  // Cargar proyecto + datasets + análisis
  useEffect(() => {
    async function load() {
      try {
        // 1) Proyecto
        const res = await projectService.getById(id as string);
        const proj = res.data;
        setProject(proj);

        // 2) Datasets asociados al proyecto
        if (proj.dataset_ids && proj.dataset_ids.length > 0) {
          const datasetDetails = await Promise.all(
            proj.dataset_ids.map((dsId: string) =>
              datasetService.get(dsId).catch(() => null)
            )
          );

          const dsClean: DatasetDoc[] = datasetDetails
            .filter((d: any) => d !== null)
            .map((d: any) => d.data);

          setDatasets(dsClean);

          // precargar nombres de datasets
          const nameMap: Record<string, string> = {};
          dsClean.forEach((d: DatasetDoc) => {
            const docId = getDatasetDocId(d);
            if (docId) nameMap[docId] = d.name;
          });
          setDatasetNames((prev) => ({ ...prev, ...nameMap }));
        }

        setLoadingProject(false);

        // 3) Análisis del proyecto (usa el ID real como project_id)
        setLoadingAnalyses(true);

        // clave única del proyecto: prioriza id, luego _id, y como último recurso el name
        const projectKey = proj.id ?? proj._id ?? proj.name;

        const analysesRes = await analyticsService.analysesByProject(projectKey);
        const list: any[] = analysesRes.data || [];
        setAnalyses(list);

        // 4) Resolver nombres de datasets que NO están aún en datasetNames
        const idsFromAnalyses: string[] = Array.from(
          new Set<string>(list.map((a: any) => String(a.dataset_id)))
        );

        const missing: string[] = idsFromAnalyses.filter(
          (dsId: string) => !datasetNames[dsId]
        );

        if (missing.length > 0) {
          const extra = await Promise.all(
            missing.map((dsId: string) =>
              datasetService
                .get(dsId)
                .then((r) => ({ id: dsId, name: r.data.name as string }))
                .catch(() => null)
            ));

          setDatasetNames((prev) => {
            const next = { ...prev };
            for (const item of extra) {
              if (item) next[item.id] = item.name;
            }
            return next;
          });
        }
      } catch (err) {
        console.error(err);
        toast.show("No se pudo cargar el proyecto", "error");
      } finally {
        setLoadingProject(false);
        setLoadingAnalyses(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ------- handlers de edición -------
  const startEdit = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const saveEdit = async () => {
    if (!project) return;
    if (!editName.trim()) {
      toast.show("El nombre del proyecto no puede estar vacío", "error");
      return;
    }

    try {
      const payload = {
        name: editName.trim(),
        description: editDescription.trim(),
      };

      const res = await projectService.update(project.id, payload);
      const updated = res.data;
      setProject(updated);
      setEditMode(false);
      toast.show("Proyecto actualizado correctamente.", "success");
    } catch (err) {
      console.error(err);
      toast.show("No se pudo actualizar el proyecto.", "error");
    }
  };

  // ------- handlers agregar datasets -------

  // Abrir modal y precargar selección con los datasets actuales del proyecto
  const openDatasetModal = async () => {
    if (!project) return;

    setShowDatasetModal(true);
    setLoadingAvailableDatasets(true);

    try {
      const res = await datasetService.list();
      setAvailableDatasets(res.data || []);

      // pre-seleccionamos lo que ya está asociado al proyecto
      setSelectedDatasetIds(project.dataset_ids || []);
    } catch (err) {
      console.error(err);
      toast.show("No se pudieron cargar los datasets disponibles.", "error");
    } finally {
      setLoadingAvailableDatasets(false);
    }
  };

  // Marcar / desmarcar un dataset
  const toggleDatasetSelection = (datasetId: string) => {
    setSelectedDatasetIds((prev) =>
      prev.includes(datasetId)
        ? prev.filter((id) => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  // Guardar cambios en la API y refrescar la vista
  const saveDatasetsToProject = async () => {
    if (!project) return;

    try {
      const payload = {
        name: project.name,
        description: project.description,
        user_email: project.user_email,
        dataset_ids: selectedDatasetIds,
      };

      const res = await projectService.update(project.id, payload);
      const updated = res?.data ?? {
        ...project,
        dataset_ids: selectedDatasetIds,
      };

      setProject(updated);

      // recargar datasets asociados
      if (updated.dataset_ids && updated.dataset_ids.length > 0) {
        const datasetDetails = await Promise.all(
          updated.dataset_ids.map((dsId: string) =>
            datasetService.get(dsId).catch(() => null)
          )
        );

        const dsClean: DatasetDoc[] = datasetDetails
          .filter((d: any) => d !== null)
          .map((d: any) => d.data);

        setDatasets(dsClean);

        const nameMap: Record<string, string> = {};
        dsClean.forEach((d: DatasetDoc) => {
          const docId = getDatasetDocId(d);
          if (docId) nameMap[docId] = d.name;
        });
        setDatasetNames((prev) => ({ ...prev, ...nameMap }));
      } else {
        setDatasets([]);
      }

      setShowDatasetModal(false);
      toast.show("Datasets actualizados correctamente.", "success");
    } catch (err) {
      console.error(err);
      toast.show("No se pudo actualizar la lista de datasets del proyecto.", "error");
    }
  };

  // ------- handlers de análisis: renombrar / eliminar -------

  const handleRenameAnalysis = async (analysis: AnalysisDoc) => {
    const currentName = analysis.name ?? "";
    const newName = window.prompt(
      "Nuevo nombre para el análisis:",
      currentName
    );

    if (newName === null) return; // cancelado
    const trimmed = newName.trim();
    if (!trimmed || trimmed === currentName) return;

    try {
      // Supondremos que existirán estos endpoints:
      // PATCH /analytics/analyses/{analysis_id}  -> analyticsService.updateAnalysis
      const res = await analyticsService.updateAnalysis(analysis._id, {
        name: trimmed,
      });

      const updated: AnalysisDoc = res.data ?? {
        ...analysis,
        name: trimmed,
      };

      setAnalyses((prev) =>
        prev.map((a) => (a._id === analysis._id ? { ...a, ...updated } : a))
      );
      toast.show("Nombre de análisis actualizado.", "success");
    } catch (err) {
      console.error(err);
      toast.show("No se pudo renombrar el análisis.", "error");
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar este análisis? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      // Supondremos que existirán estos endpoints:
      // DELETE /analytics/analyses/{analysis_id} -> analyticsService.deleteAnalysis
      await analyticsService.deleteAnalysis(analysisId);

      setAnalyses((prev) => prev.filter((a) => a._id !== analysisId));
      toast.show("Análisis eliminado correctamente.", "success");
    } catch (err) {
      console.error(err);
      toast.show("No se pudo eliminar el análisis.", "error");
    }
  };

  // ================== RENDER ==================

  if (loadingProject) {
    return (
      <main className="min-h-screen bg-black text-white">
        <p className="p-10">Cargando proyecto...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="text-red-400 p-10">
          <h2 className="text-2xl font-bold">Proyecto no encontrado</h2>
          <button
            onClick={() => router.push("/projects")}
            className="mt-4 bg-zinc-800 px-4 py-2 rounded"
          >
            ← Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto pt-12 pb-16 px-4">
        {/* ------------ CABECERA CENTRADA ------------ */}
        <header className="text-center mb-8">
          {editMode ? (
            <div className="space-y-3">
              <input
                className="w-full max-w-xl mx-auto text-center text-3xl sm:text-4xl font-bold bg-transparent border-b border-zinc-600 focus:outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <textarea
                className="w-full max-w-xl mx-auto text-center text-sm sm:text-base bg-zinc-900 border border-zinc-700 rounded-lg p-2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripción del proyecto"
              />
              <div className="flex justify-center gap-3">
                <button
                  onClick={saveEdit}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {project.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                {project.description || "Sin descripción"}
              </p>
            </>
          )}
        </header>

        {/* ------------ INFO DEL PROYECTO + ACCIONES ------------ */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1 text-sm sm:text-base">
            <p>
              📅 <strong>Creado:</strong>{" "}
              {new Date(project.created_at).toLocaleString()}
            </p>
            <p>
              🕒 <strong>Modificado:</strong>{" "}
              {new Date(project.updated_at).toLocaleString()}
            </p>
            <p>
              📂 <strong>Datasets asociados:</strong>{" "}
              {project.dataset_ids?.length || 0}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            {!editMode && (
              <button
                onClick={startEdit}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold"
              >
                ✏️ Editar proyecto
              </button>
            )}

            <button
              onClick={openDatasetModal}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ➕ Agregar dataset
            </button>

            <button
              onClick={async () => {
                if (
                  confirm(
                    "¿Seguro que deseas eliminar este proyecto? Esta acción no se puede deshacer."
                  )
                ) {
                  await projectService.delete(project.id);
                  router.push("/projects");
                }
              }}
              className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              🗑️ Eliminar
            </button>
          </div>
        </section>

        {/* ------------ DATASETS ASOCIADOS ------------ */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-semibold">Datasets asociados</h2>
            <span className="text-xs text-gray-400">
              {datasets.length > 0
                ? `${datasets.length} dataset(s)`
                : "Sin datasets"}
            </span>
          </div>

          {datasets.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Este proyecto aún no tiene datasets asociados.
              Puedes subir datasets desde la sección de Analíticas y luego
              vincularlos a este proyecto.
            </p>
          ) : (
            <div className="space-y-4">
              {datasets.map((ds) => (
                <div
                  key={getDatasetDocId(ds)}
                  className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{ds.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Columnas: {ds.columns?.length ?? 0}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/datasets/${getDatasetDocId(ds)}`)
                    }
                    className="self-start sm:self-auto bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
                  >
                    Ver dataset →
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ------------ ANÁLISIS DEL PROYECTO ------------ */}
        <section className="mb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-semibold">Análisis del proyecto</h2>
            <span className="text-xs text-gray-400">
              {analyses.length > 0
                ? `${analyses.length} análisis guardado(s)`
                : "Sin análisis guardados"}
            </span>
          </div>

          {loadingAnalyses ? (
            <p className="text-gray-400 text-sm">
              Cargando análisis guardados...
            </p>
          ) : analyses.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Este proyecto aún no tiene análisis guardados.
              Ve a la sección <span className="font-semibold">Analíticas</span>,
              genera un gráfico y usa la opción{" "}
              <span className="italic">“Guardar análisis en proyecto”</span> para
              comenzar a construir tu dashboard.
            </p>
          ) : (
            <div className="space-y-4">
              {analyses.map((a) => {
                const dsName = getDatasetName(a.dataset_id);
                const created = a.created_at
                  ? new Date(a.created_at).toLocaleString()
                  : "Fecha no disponible";

                const typeLabel =
                  a.type === "histogram"
                    ? "Histograma"
                    : a.type === "piechart"
                      ? "Gráfico de torta"
                      : a.type === "heatmap"
                        ? "Mapa de calor"
                        : a.type.toUpperCase();

                return (
                  <article
                    key={a._id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">
                          {a.name || "Análisis sin título"}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Dataset:{" "}
                          <span className="font-medium">{dsName}</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          Columnas:{" "}
                          {Array.isArray(a.columns) && a.columns.length > 0
                            ? a.columns.join(", ")
                            : "No especificadas"}
                        </p>
                        {a.description && (
                          <p className="text-gray-500 text-xs">
                            {a.description}
                          </p>
                        )}
                        <p className="text-gray-500 text-xs">Creado el {created}</p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200">
                          {typeLabel}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRenameAnalysis(a)}
                            className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-lg text-xs"
                          >
                            Renombrar
                          </button>
                          <button
                            onClick={() => handleDeleteAnalysis(a._id)}
                            className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded-lg text-xs"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico embebido */}
                    <AnalysisChart analysis={a} />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ------------ BOTÓN VOLVER ------------ */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/projects")}
            className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
          >
            ← Volver a mis proyectos
          </button>
        </div>
      </div>

      {/* ------------ MODAL AGREGAR DATASETS ------------ */}
      {showDatasetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              Asociar datasets al proyecto
            </h3>

            {loadingAvailableDatasets ? (
              <p className="text-gray-400 text-sm">
                Cargando datasets disponibles...
              </p>
            ) : availableDatasets.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No tienes datasets disponibles. Primero sube un dataset en la
                sección de Analíticas.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                {availableDatasets.map((ds) => {
                  const docId = getDatasetDocId(ds);
                  return (
                    <label
                      key={docId}
                      className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDatasetIds.includes(docId)}
                        onChange={() => toggleDatasetSelection(docId)}
                        className="accent-blue-500"
                      />
                      <span>
                        <span className="font-medium">{ds.name}</span>
                        {ds.columns && (
                          <span className="text-gray-400 ml-2">
                            ({ds.columns.length} columnas)
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowDatasetModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={saveDatasetsToProject}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-semibold"
                disabled={loadingAvailableDatasets}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}