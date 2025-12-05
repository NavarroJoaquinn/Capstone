"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import DatasetStep from "@/components/analytics/DatasetStep";
import ColumnsStep from "@/components/analytics/ColumnsStep";
import ConfirmColumnsStep from "@/components/analytics/ConfirmColumnsStep";
import VisualizationStep from "@/components/analytics/VisualizationStep";
import PlotView from "@/components/analytics/PlotView";
import WizardSteps from "@/components/analytics/WizardSteps";

import { datasetService } from "@/services/datasetService";
import { analyticsService } from "@/services/analyticsService";
import { projectService } from "@/services/projectService";
import InsightsPanel from "@/components/analytics/InsightsPanel";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const datasetFromQuery = searchParams.get("dataset");
  const projectFromQuery = searchParams.get("project");

  // ========= ESTADOS =========
  const [step, setStep] = useState(1);
  const [columnStats, setColumnStats] = useState<any | null>(null);
  const [categorySummary, setCategorySummary] = useState<
    { label: string; count: number }[] | null
  >(null);

  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [confirmedColumns, setConfirmedColumns] = useState<string[]>([]);

  const [semanticTypes, setSemanticTypes] = useState<Record<string, string>>({});
  const [visualizationType, setVisualizationType] = useState<
    "histogram" | "piechart" | "heatmap" | null
  >(null);
  const [plotData, setPlotData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Proyectos para guardar análisis
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // ========= 1) CARGAR DATASETS =========
  useEffect(() => {
    async function load() {
      try {
        const res = await datasetService.list();
        setDatasets(res.data);

        if (datasetFromQuery) {
          setSelectedDataset(datasetFromQuery);

          const preview = await datasetService.preview(datasetFromQuery);
          setColumns(preview.data.columns ?? []);

          const sem = await analyticsService.semanticTypes(datasetFromQuery);
          setSemanticTypes(sem.data.semantic_types || {});
        }
      } catch (err) {
        console.error("Error cargando datasets:", err);
      }
    }
    load();
  }, [datasetFromQuery]);

  // ========= 2) CARGAR PROYECTOS PARA GUARDAR ANÁLISIS =========
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoadingProjects(true);

        const res = await projectService.list();
        const projectsData = res.data || [];

        setProjects(projectsData);

        // Si viene un project en la URL y existe en la lista, usarlo
        if (
          projectFromQuery &&
          projectsData.some((p: any) => p.id === projectFromQuery)
        ) {
          setSelectedProjectId(projectFromQuery);
        } else if (projectsData.length > 0) {
          // Si no, tomar el primero
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (err) {
        console.error("Error cargando proyectos:", err);
      } finally {
        setLoadingProjects(false);
      }
    }

    loadProjects();
  }, [projectFromQuery]);

  // ========= CAMBIO DE DATASET =========
  const handleDatasetSelect = async (id: string) => {
    setSelectedDataset(id);
    setSelectedColumns([]);
    setConfirmedColumns([]);
    setVisualizationType(null);
    setPlotData(null);
    setColumnStats(null);
    setCategorySummary(null);
    try {
      const previewRes = await datasetService.preview(id);
      setColumns(previewRes.data.columns ?? []);

      const sem = await analyticsService.semanticTypes(id);
      setSemanticTypes(sem.data.semantic_types || {});
    } catch (err) {
      console.error("Error cargando preview / semantic types:", err);
    }
  };

  // ========= CONFIRMAR COLUMNAS =========
  const handleConfirmColumns = () => {
    if (selectedColumns.length === 0) {
      toast.show("Debes seleccionar al menos una columna.");
      return;
    }
    setConfirmedColumns([...selectedColumns]);
    setStep(4);
  };

  // ========= Helper: tipo semántico de una columna =========
  const getColumnType = (col: string | undefined): string | undefined => {
    if (!col) return undefined;
    return semanticTypes[col];
  };

  // ========= EJECUTAR VISUALIZACIÓN =========
  const runVisualization = async (
    type: "histogram" | "piechart" | "heatmap"
  ) => {
    if (!selectedDataset) {
      toast.show("Primero selecciona un dataset.");
      return;
    }

    const primaryColumn = confirmedColumns[0];

    // Reglas de compatibilidad básicas usando semanticTypes
    if (type === "histogram") {
      const colType = getColumnType(primaryColumn)?.toLowerCase();

      const isNumeric =
        colType?.includes("num") ||
        colType === "float" ||
        colType === "int" ||
        colType === "integer";

      if (!primaryColumn) {
        toast.show("Debes confirmar al menos una columna para el histograma.");
        return;
      }

      if (!isNumeric) {
        toast.show(
          `La columna "${primaryColumn}" no es numérica según el análisis semántico. Selecciona una columna numérica para generar un histograma.`
        );
        setPlotData(null);
        return;
      }
    }

    if (type === "piechart") {
      const colType = getColumnType(primaryColumn)?.toLowerCase();

      const isCategorical =
        colType?.includes("cat") ||
        colType?.includes("str") ||
        colType === "object" ||
        colType === "categoria" ||
        colType === "categórica";

      if (!primaryColumn) {
        toast.show("Debes confirmar una columna categórica para el gráfico de torta.");
        return;
      }

      if (!isCategorical) {
        toast.show(
          `La columna "${primaryColumn}" no es categórica según el análisis semántico. Selecciona una columna categórica (por ejemplo, región, estado, tipo) para generar un gráfico de torta.`
        );
        setPlotData(null);
        return;
      }
    }

    setVisualizationType(type);
    setLoading(true);
    setPlotData(null); // limpiamos visualización anterior

    try {
      // ---------- GRÁFICO ----------
      if (type === "histogram") {
        const response = await analyticsService.histogram(
          selectedDataset,
          primaryColumn
        );

        const { bins, counts, column } = response.data;

        const plotPayload = {
          data: [
            {
              x: bins,
              y: counts,
              type: "bar",
            },
          ],
          layout: {
            title: `Histograma - ${column}`,
            xaxis: { title: column },
            yaxis: { title: "Frecuencia" },
          },
        };

        setPlotData(plotPayload);
      } else if (type === "piechart") {
        const response = await analyticsService.pie(
          selectedDataset,
          primaryColumn
        );

        const { labels, values } = response.data;

        const plotPayload = {
          data: [
            {
              type: "pie",
              labels,
              values,
              textinfo: "label+percent",
              hoverinfo: "label+value+percent",
            },
          ],
          layout: {
            title: `Gráfico de torta - ${primaryColumn}`,
          },
        };

        setPlotData(plotPayload);
      } else if (type === "heatmap") {
        const response = await analyticsService.heatmap(selectedDataset);

        const { columns: corrColumns, matrix } = response.data;

        const plotPayload = {
          data: [
            {
              z: matrix,
              x: corrColumns,
              y: corrColumns,
              type: "heatmap",
              zmin: -1,
              zmax: 1,
              colorbar: { title: "Correlación" },
            },
          ],
          layout: {
            title: "Heatmap de correlación",
            xaxis: { side: "top" },
            yaxis: { autorange: "reversed" },
          },
        };

        setPlotData(plotPayload);
      }

      // ---------- INSIGHTS ----------
      if (primaryColumn) {
        const statsRes = await analyticsService.columnStats(
          selectedDataset,
          primaryColumn
        );
        setColumnStats(statsRes.data);

        const colType = getColumnType(primaryColumn)?.toLowerCase();
        const isCategorical =
          colType?.includes("cat") ||
          colType?.includes("str") ||
          colType === "object" ||
          colType === "categoria" ||
          colType === "categórica";

        if (isCategorical) {
          const vcRes = await analyticsService.valueCounts(
            selectedDataset,
            primaryColumn
          );
          const countsObj = vcRes.data?.value_counts || {};
          const top = Object.entries(countsObj)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 5)
            .map(([label, value]) => ({
              label: String(label),
              count: Number(value),
            }));

          setCategorySummary(top);
        } else {
          setCategorySummary(null);
        }
      } else {
        setColumnStats(null);
        setCategorySummary(null);
      }
    } catch (err: any) {
      console.error("Error generando visualización:", err);

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Error generando visualización.";

      toast.show(msg);
    } finally {
      setLoading(false);
    }
  };

  // ========= GUARDAR ANÁLISIS ACTUAL =========
  const handleSaveAnalysis = async () => {
    if (!visualizationType || !selectedDataset || confirmedColumns.length === 0) {
      toast.show("Primero genera una visualización con columnas confirmadas.");
      return;
    }

    if (!selectedProjectId) {
      toast.show("Selecciona un proyecto donde guardar el análisis.");
      return;
    }

    setSaving(true);
    try {
      const niceName =
        visualizationType === "histogram"
          ? `Histograma - ${confirmedColumns.join(", ")}`
          : visualizationType === "piechart"
            ? `Gráfico de torta - ${confirmedColumns.join(", ")}`
            : "Heatmap de correlación";

      await analyticsService.saveAnalysis({
        project_id: selectedProjectId,
        dataset_id: selectedDataset,
        type: visualizationType,
        columns: confirmedColumns,
        name: niceName,
        description: "Análisis generado desde el asistente de analíticas.",
      });

      toast.show("Análisis guardado correctamente en el proyecto.");
    } catch (err: any) {
      console.error("Error guardando análisis:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Error guardando análisis.";
      toast.show(msg);
    } finally {
      setSaving(false);
    }
  };

  // ========= RENDER DE PASO ACTUAL =========
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <DatasetStep
            datasets={datasets}
            selectedDataset={selectedDataset}
            onSelect={handleDatasetSelect}
          />
        );
      case 2:
        return (
          <ColumnsStep
            columns={columns}
            selectedColumns={selectedColumns}
            onChange={setSelectedColumns}
          />
        );
      case 3:
        return (
          <ConfirmColumnsStep
            selectedColumns={selectedColumns}
            semanticTypes={semanticTypes}
            onConfirm={handleConfirmColumns}
          />
        );
      case 4:
        return (
          <VisualizationStep
            selectedColumns={confirmedColumns}
            onVisualize={runVisualization}
          />
        );
      default:
        return null;
    }
  };

  // ========= RENDER PRINCIPAL =========
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Título centrado */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Analíticas del Dataset</h1>
          <p className="text-base text-gray-300">
            Selecciona un dataset, elige las columnas y genera la visualización que necesitas.
          </p>
        </header>

        {/* Stepper centrado */}
        <div className="flex justify-center mb-4">
          <WizardSteps step={step} />
        </div>

        {/* Texto Paso X de 4 centrado */}
        <div className="mb-6 text-center">
          <p className="text-lg">
            Paso <span className="font-bold">{step}</span> de 4
          </p>
        </div>

        {/* Contenido del paso centrado */}
        <div className="mt-4 max-w-4xl mx-auto">{renderStep()}</div>

        {/* Navegación entre pasos centrada */}
        <div className="flex justify-between mt-10 max-w-3xl mx-auto">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`px-6 py-3 rounded bg-zinc-800 hover:bg-zinc-700 ${step === 1 ? "opacity-40 cursor-not-allowed" : ""
              }`}
          >
            ← Anterior
          </button>

          {step !== 3 && step !== 4 && (
            <button
              disabled={
                (step === 1 && !selectedDataset) ||
                (step === 2 && selectedColumns.length === 0)
              }
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              className={`px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 ${(step === 1 && !selectedDataset) ||
                (step === 2 && selectedColumns.length === 0)
                ? "opacity-40 cursor-not-allowed"
                : ""
                }`}
            >
              Siguiente →
            </button>
          )}
        </div>

        {/* Mensaje de carga de gráfico */}
        {loading && (
          <p className="mt-10 text-center text-gray-400">
            Generando gráfico...
          </p>
        )}

        {/* Gráfico + insights + sección para guardar análisis, centrados */}
        {visualizationType && (
          <div className="mt-10 max-w-5xl mx-auto space-y-6">
            {/* Gráfico */}
            <PlotView type={visualizationType} data={plotData} />

            {/* NUEVO: Insights de la columna principal */}
            <InsightsPanel
              stats={columnStats}
              categorySummary={categorySummary}
              columnName={confirmedColumns[0] || ""}
            />

            {/* Guardar análisis en proyecto */}
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700">
              <h2 className="text-lg font-semibold mb-3">
                Guardar análisis en un proyecto
              </h2>

              {loadingProjects ? (
                <p className="text-gray-400">Cargando proyectos...</p>
              ) : projects.length === 0 ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="text-gray-300">
                    No tienes proyectos creados todavía. Crea un proyecto para
                    poder guardar este análisis.
                  </p>
                  <button
                    onClick={() => router.push("/projects")}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
                  >
                    Ir a Proyectos
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-1 text-gray-300">
                      Selecciona el proyecto
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-sm"
                    >
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.title || p.id}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-2">
                      Se guardará un análisis de tipo{" "}
                      <span className="font-semibold text-blue-400">
                        {visualizationType === "histogram" && "Histograma"}
                        {visualizationType === "piechart" && "Gráfico de Torta"}
                        {visualizationType === "heatmap" && "Heatmap de Correlación"}
                      </span>{" "}
                      usando las columnas:{" "}
                      <span className="font-mono">
                        {confirmedColumns.join(", ")}
                      </span>
                      .
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAnalysis}
                    disabled={saving || !plotData}
                    className={`px-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500 ${saving || !plotData ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    {saving ? "Guardando..." : "Guardar análisis en proyecto"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}