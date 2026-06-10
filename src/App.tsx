/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PlanillaData } from "./types";
import { examplePlanillaData, initialEmptyData } from "./data";
import PlanillaForm from "./components/PlanillaForm";
import PlanillaPreview from "./components/PlanillaPreview";
import PlanillaHistory from "./components/PlanillaHistory";
import { generatePdfFromHtml } from "./utils/pdfGenerator";
import { FileDown, Printer, Eye, History, Settings, Sparkles, BookOpen, Info, ShieldCheck } from "lucide-react";

export default function App() {
  // Load initial data from localStorage if present, otherwise default to examplePlanillaData
  const [data, setData] = useState<PlanillaData>(() => {
    try {
      const saved = localStorage.getItem("planilla_gcba_data");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    return examplePlanillaData;
  });

  const [activeTab, setActiveTab] = useState<"form" | "preview" | "history">("form");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  // Save changes to localStorage on data updates
  useEffect(() => {
    try {
      localStorage.setItem("planilla_gcba_data", JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [data]);

  // Check if inside iframe and auto-trigger printing if `?print=true`
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIframe(window.self !== window.top);
      
      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "true") {
        // Clear print parameter to prevent loops on refresh
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("print");
          window.history.replaceState({}, document.title, url.toString());
        } catch (e) {
          console.warn(e);
        }
        
        // Wait slightly for mounting to finish, then trigger native print
        const timer = setTimeout(() => {
          window.focus();
          window.print();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Load example data
  const handleLoadExample = () => {
    setData(examplePlanillaData);
  };

  // Clear all form data
  const handleClear = () => {
    setData(initialEmptyData);
  };

  // Export PDF calling html2canvas + jspdf
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfError(null);
    try {
      await generatePdfFromHtml("planilla-frente", "planilla-dorso", data.docenteNombre);
    } catch (err: any) {
      console.error(err);
      setPdfError("Ocurrió un error al generar el PDF. Por favor, intente de nuevo.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print utilizing native browser print dialog
  const handlePrint = () => {
    window.focus();
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {/* Dynamic style sheet for perfect printing capability */}
      <style>{`
        @media screen {
          .print-only {
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
          }
        }
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          html, body, #root, body > div {
            background-color: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: 0 !important;
            width: auto !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            transform: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
            position: static !important;
            width: 297mm !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Mantener el diseño tabular de las tablas para una alineación perfecta de columnas */
          .print-only table {
            display: table !important;
            width: 100% !important;
          }
          .print-only thead {
            display: table-header-group !important;
          }
          .print-only tbody {
            display: table-row-group !important;
          }
          .print-only tr {
            display: table-row !important;
          }
          .print-only td, .print-only th {
            display: table-cell !important;
          }

          /* Forzar contenedores horizontales A4 de alta calidad para el Frente y el Dorso */
          #planilla-frente, #planilla-dorso {
            display: flex !important; /* Mantener diseño flex interno de la tarjeta */
            flex-direction: column !important;
            justify-content: space-between !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 10mm !important;
            width: 297mm !important;
            height: 210mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background-color: #ffffff !important;
            transform: none !important;
            position: static !important;
          }
          
          #planilla-frente {
            page-break-after: always !important;
            break-after: page !important;
          }
          
          #planilla-dorso {
            page-break-before: always !important;
            break-before: page !important;
          }

          .planilla-page-wrapper {
            display: block !important;
            width: 297mm !important;
            height: 210mm !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            background-color: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            position: static !important;
          }

          .planilla-sheet-inner {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            position: static !important;
            transform: none !important;
            width: 297mm !important;
            height: 210mm !important;
            box-shadow: none !important;
            border: none !important;
            padding: 12mm !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Main Header - hidden when printing */}
      <header className="bg-white border-b border-slate-200 py-5 px-6 shrink-0 no-print shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-100">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Planilla de Recorrido GCBA
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                  Formato Oficial
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Escuela Domiciliaria Nº 1 - Sección Domicilios • Inscripción, Asistencia y Horario
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download and print controls */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:pointer-events-none"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generando PDF...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Descargar PDF Oficial
                </>
              )}
            </button>

            {isIframe ? (
              <a
                href={`${window.location.pathname === "/" ? "" : window.location.pathname}?print=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Planilla
              </a>
            ) : (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Planilla
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto p-4 md:p-6 flex flex-col gap-6 no-print max-w-[1440px]">
        
        {/* Navigation/View chooser - Tab Selector is always visible on top */}
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-row gap-1 self-start md:w-[580px] w-full no-print">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-grow flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "form"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            Formulario de Carga
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-grow flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Printer className="w-4 h-4" />
            Vista Previa de Impresión
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-grow flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4" />
            Historial de Planillas
          </button>
        </div>

        {activeTab === "form" && (
          <div className="flex flex-col md:flex-row gap-6 w-full no-print">
            {/* Left column / sidebar with helpful GCBA rules from "PLANILLA DE RECORRIDO EJEMPLO.PDF" */}
            <section className="w-full md:w-80 shrink-0 flex flex-col gap-5 no-print">
              
              {/* Quick Stats Summary */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Estado de la Planilla
                </h3>
                
                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Maestro/a:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[140px]" title={data.docenteNombre}>
                      {data.docenteNombre || "Sin asignar"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Cargo:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[140px]" title={data.cargo}>
                      {data.cargo || "Sin asignar"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium font-sans">Alumnos Cargados:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                      {data.estudiantes.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500 font-medium">En Frente (Pág 1):</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {data.estudiantes.filter((s) => s.incluirFrente).length} alumnos
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500 font-medium">En Dorso (Pág 2):</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {data.estudiantes.filter((s) => s.incluirDorso).length} alumnos
                    </span>
                  </div>
                </div>
              </div>

              {/* Guidelines block from example PDF */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 leading-relaxed">
                <h3 className="text-xs font-bold text-amber-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-amber-800" />
                  Guía de Confección
                </h3>
                
                <ul className="text-[11px] text-amber-800 font-medium flex flex-col gap-2.5 list-disc pl-4">
                  <li>
                    <strong>Frente (Mes que finalizó):</strong> Coloque el último día hábil del mes como la fecha arriba a la derecha. Confeccione la nómina e indique las inasistencias y las asistencias reales de cada alumno.
                  </li>
                  <li>
                    <strong>Dorso (Mes que empieza):</strong> Coloque el primer día hábil y el mes que se inicia. Se debe detallar el <strong>horario completo real de trabajo</strong> del docente que está registrado en su Declaración Jurada (DDJJ) de la Escuela.
                  </li>
                  <li>
                    <strong>Clases Dadas:</strong> Registre el número total. Por ejemplo, en domiciliarias si cada día atiende a 2 alumnos con 4 clases dará un total de 8 asistencias multiplicadas.
                  </li>
                  <li>
                    <strong>Observaciones de Asistencia:</strong> Indicar la fecha de reuniones de personal con nombres de vicedirectoras o receso invernal/estival.
                  </li>
                </ul>
              </div>
              
              {pdfError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-medium">
                  {pdfError}
                </div>
              )}

            </section>

            {/* Right column - Workdesk Form */}
            <section className="flex-1 flex flex-col w-full min-w-0">
              <PlanillaForm
                data={data}
                onChange={setData}
                onLoadExample={handleLoadExample}
                onClear={handleClear}
              />
            </section>
          </div>
        )}

        {activeTab === "preview" && (
          /* Vista Previa View - Full Screen Width Layout (no sidebar) to maximize display space and prevent cut offs */
          <div className="w-full flex flex-col gap-6 no-print">
            
            {/* Elegant Top Help Banner for Print instructions */}
            <div className="flex bg-amber-50 p-4 border border-amber-200 rounded-2xl text-xs gap-3 items-start no-print shadow-xs">
              <Info className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
              <div className="leading-relaxed font-sans font-medium text-slate-800">
                <strong className="text-amber-900">Aviso de Configuración Oficial:</strong> La planilla se muestra de manera óptima en esta vista de pantalla completa. Al pulsar <strong className="text-slate-900">"Imprimir Planilla"</strong> en el panel de arriba, se abrirá la ventana de impresión nativa del navegador. Asegurate de configurar tu navegador en: <strong className="text-indigo-700 font-bold">Orientación Horizontal (Landscape)</strong>, tamaño de papel <strong className="text-indigo-700 font-bold">A4</strong>, and <strong className="text-indigo-700 font-bold">Márgenes Mínimos o Ninguno</strong> (Escala 100%) para calcar exactamente las planillas GCBA analógicas requeridas.
              </div>
            </div>

            <PlanillaPreview data={data} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="w-full no-print">
            <PlanillaHistory 
              currentData={data} 
              onLoadData={(loadedData) => {
                setData(loadedData);
                setActiveTab("form");
              }} 
            />
          </div>
        )}

      </main>

      {/* Hidden print-only workspace element to ensure standard print behavior regardless of the current active tab */}
      <div className="print-only">
        <PlanillaPreview data={data} />
      </div>

      {/* Footer - hidden when printing */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-medium shrink-0 no-print mt-auto">
        <p>© 2026 Ministerio de Educación GCBA - Escuela Domiciliaria Nº 1 • Diseñado para la carga ágil del personal docente.</p>
      </footer>

    </div>
  );
}
