"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import DatasetStep from "@/components/analytics/DatasetStep";
import ColumnsStep from "@/components/analytics/ColumnsStep";
import ConfirmColumnsStep from "@/components/analytics/ConfirmColumnsStep";
import VisualizationStep from "@/components/analytics/VisualizationStep";
import PlotView from "@/components/analytics/PlotView";

import { datasetService } from "@/services/datasetService";
import { analyticsService } from "@/services/analyticsService";

export default function AnalyticsPage() {
    const searchParams = useSearchParams();
    const datasetFromQuery = searchParams.get("dataset");

    // ========= ESTADOS =========
    const [step, setStep] = useState(1);

    const [datasets, setDatasets] = useState<any[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

    const [columns, setColumns] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [confirmedColumns, setConfirmedColumns] = useState<string[]>([]);

    const [semanticTypes, setSemanticTypes] = useState<Record<string, string>>({});
    const [visualizationType, setVisualizationType] = useState<"histogram" | "piechart" | "heatmap" | null>(null);
    const [plotData, setPlotData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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

    // ========= CAMBIO DE DATASET =========
    const handleDatasetSelect = async (id: string) => {
        setSelectedDataset(id);
        setSelectedColumns([]);
        setConfirmedColumns([]);
        setVisualizationType(null);
        setPlotData(null);

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
            alert("Debes seleccionar al menos una columna.");
            return;
        }
        setConfirmedColumns([...selectedColumns]);
        setStep(4);
    };

    // ========= EJECUTAR VISUALIZACIÓN =========
    const runVisualization = async (type: "histogram" | "piechart" | "heatmap") => {
        if (!selectedDataset) {
            alert("Primero selecciona un dataset.");
            return;
        }

        setVisualizationType(type);
        setLoading(true);

        let response;

        try {
            if (type === "histogram") {
                response = await analyticsService.histogram(
                    selectedDataset,
                    confirmedColumns[0]
                );

            } else if (type === "piechart") {
                response = await analyticsService.pie(
                    selectedDataset,
                    confirmedColumns[0]
                );

            } else if (type === "heatmap") {
                response = await analyticsService.heatmap(selectedDataset);
            }

            if (!response) {
                alert("No se recibió respuesta del servidor.");
                return;
            }

            setPlotData(response.data);

        } catch (err: any) {
            console.error("Error generando visualización:", err);

            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Error generando visualización.";

            alert(msg);

        } finally {
            setLoading(false);
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
        <div className="p-10 text-white">
            <h1 className="text-4xl font-bold mb-10">Analíticas del Dataset</h1>

            <div className="mb-6">
                <p className="text-lg">
                    Paso <span className="font-bold">{step}</span> de 4
                </p>
            </div>

            {renderStep()}

            {/* Navegación entre pasos */}
            <div className="flex justify-between mt-10 max-w-3xl">
                <button
                    disabled={step === 1}
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className={`px-6 py-3 rounded bg-zinc-800 hover:bg-zinc-700 ${step === 1 ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                >
                    ← Anterior
                </button>

                <button
                    disabled={
                        (step === 1 && !selectedDataset) ||
                        (step === 2 && selectedColumns.length === 0) ||
                        step === 4
                    }
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    className={`px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 ${(step === 1 && !selectedDataset) ||
                        (step === 2 && selectedColumns.length === 0) ||
                        step === 4
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                        }`}
                >
                    Siguiente →
                </button>
            </div>

            {/* Resultado del gráfico */}
            {loading && (
                <p className="mt-10 text-gray-400">Generando gráfico...</p>
            )}

            {plotData && visualizationType && (
                <div className="mt-10">
                    <PlotView type={visualizationType} data={plotData} />
                </div>
            )}
        </div>
    );
}