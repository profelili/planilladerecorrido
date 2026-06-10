/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlanillaData, Student } from "../types";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles, RefreshCw, FileText } from "lucide-react";
import { examplePlanillaData, initialEmptyData } from "../data";

interface PlanillaFormProps {
  data: PlanillaData;
  onChange: (newData: PlanillaData) => void;
  onLoadExample: () => void;
  onClear: () => void;
}

export default function PlanillaForm({ data, onChange, onLoadExample, onClear }: PlanillaFormProps) {
  // Tab to separate students general data, Frente specific fields, and Dorso specific fields inside the table for space efficiency.
  const [studentEditTab, setStudentEditTab] = useState<"general" | "frente" | "dorso">("general");

  // Helper to update main data fields
  const updateField = (field: keyof PlanillaData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Helper to update specific student fields
  const updateStudent = (id: string, field: keyof Student, value: any) => {
    const updatedEstudiantes = data.estudiantes.map((st) => {
      if (st.id === id) {
        return { ...st, [field]: value };
      }
      return st;
    });
    onChange({ ...data, estudiantes: updatedEstudiantes });
  };

  // Add new student
  const addStudent = () => {
    const nextOrden = data.estudiantes.length + 1;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      orden: nextOrden,
      nomina: "",
      grado: "",
      edad: "",
      nac: "arg.",
      diagnostico: "",
      domicilio: "",
      telefono: "",
      incluirFrente: true,
      incluirDorso: true,
      frenteAus: "-",
      frentePres: "",
      frenteHorario: "",
      frenteCalif: "",
      frenteObservaciones: "",
      dorsoDias: "",
      dorsoHoras: "",
      dorsoTotalHoras: "",
    };
    onChange({
      ...data,
      estudiantes: [...data.estudiantes, newStudent],
    });
  };

  // Remove student
  const removeStudent = (id: string) => {
    const remaining = data.estudiantes.filter((st) => st.id !== id);
    // Re-adjust orden numbers
    const updated = remaining.map((st, index) => ({
      ...st,
      orden: index + 1,
    }));
    onChange({ ...data, estudiantes: updated });
  };

  // Move student up/down for re-ordering
  const moveStudent = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === data.estudiantes.length - 1) return;

    const newEstudiantes = [...data.estudiantes];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    
    // Swap
    const temp = newEstudiantes[index];
    newEstudiantes[index] = newEstudiantes[targetIdx];
    newEstudiantes[targetIdx] = temp;

    // Repopulate sequential orden order
    const ordered = newEstudiantes.map((st, i) => ({
      ...st,
      orden: i + 1,
    }));

    onChange({ ...data, estudiantes: ordered });
  };

  // Auto-calculate helper for teacher's form based on the average total hours
  const handleAutoFillAsistenciaDocente = () => {
    // Fill the bottom based on typical school rules or standard example parameters
    onChange({
      ...data,
      asistenciaClasesDadas: "20.",
      asistenciaAsistencias: "7 días",
      asistenciaLicencias: "Ninguna / Licencia 70 A si corresponde",
      asistenciaDiasHabiles: "11 días.",
      asistenciaObservaciones: "Actividades curriculares y de acompañamiento domiciliario regulares.",
    });
  };

  return (
    <div className="flex flex-col gap-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full font-sans">
      
      {/* Quick Action Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Carga rápida de datos</h3>
          <p className="text-[11px] text-slate-500">Comience cargando la planilla de ejemplo o limpie para ingresar datos nuevos.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs rounded-lg font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Cargar datos de ejemplo
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs rounded-lg font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Limpiar Planilla
          </button>
        </div>
      </div>

      {/* SECTION 1: CABECERA Y DATOS DEL DOCENTE */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-indigo-500" />
          1. Datos del Docente y Cabecera de la Planilla
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre y Apellido Maestro/a</label>
            <input
              type="text"
              value={data.docenteNombre}
              onChange={(e) => updateField("docenteNombre", e.target.value)}
              placeholder="Ej: Andrea Gómez"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo</label>
            <select
              value={data.cargo}
              onChange={(e) => updateField("cargo", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white transition-colors"
            >
              <option value="Maestra/o de Grado">Maestra/o de Grado</option>
              <option value="Maestra/o de Educación Musical">Maestra/o de Educación Musical</option>
              <option value="Maestro/a de Educación Plástica">Maestro/a de Educación Plástica</option>
              <option value="Maestro/a de Educación Artesanal y Técnica">Maestro/a de Educación Artesanal y Técnica</option>
              <option value="Maestra de Atención Temprana">Maestra de Atención Temprana</option>
              <option value="Maestra de Sección">Maestra de Sección</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Turno</label>
            <select
              value={data.turno}
              onChange={(e) => updateField("turno", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white transition-colors"
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Vespertino">Vespertino</option>
              <option value="Mañana/Tarde">Mañana/Tarde</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Módulo (Opcional)</label>
            <input
              type="text"
              value={data.modulo}
              onChange={(e) => updateField("modulo", e.target.value)}
              placeholder="Ej: Módulo I"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Page 1 (Frente) Date details representing "Month that ended" */}
          <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/60 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Fecha Frente (Fin de mes)</span>
            <div className="grid grid-cols-3 gap-1">
              <div>
                <input
                  type="text"
                  maxLength={2}
                  value={data.frenteDia}
                  onChange={(e) => updateField("frenteDia", e.target.value)}
                  placeholder="Día"
                  className="w-full text-center text-xs p-1.5 border border-amber-200/60 rounded bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  maxLength={2}
                  value={data.frenteMes}
                  onChange={(e) => updateField("frenteMes", e.target.value)}
                  placeholder="Mes"
                  className="w-full text-center text-xs p-1.5 border border-amber-200/60 rounded bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={data.frenteAnio}
                  onChange={(e) => updateField("frenteAnio", e.target.value)}
                  placeholder="Año"
                  className="w-full text-center text-xs p-1.5 border border-amber-200/60 rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Page 2 (Dorso) Date details representing "Month that starts" */}
          <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/60 flex flex-col gap-2 col-span-2">
            <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Fecha Dorso (Mes de inicio)</span>
            <div className="grid grid-cols-4 gap-1.5">
              <div>
                <input
                  type="text"
                  maxLength={2}
                  value={data.dorsoDia}
                  onChange={(e) => updateField("dorsoDia", e.target.value)}
                  placeholder="Día"
                  className="w-full text-center text-xs p-1.5 border border-indigo-200/60 rounded bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  maxLength={2}
                  value={data.dorsoMes}
                  onChange={(e) => updateField("dorsoMes", e.target.value)}
                  placeholder="Mes"
                  className="w-full text-center text-xs p-1.5 border border-indigo-200/60 rounded bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={data.dorsoAnio}
                  onChange={(e) => updateField("dorsoAnio", e.target.value)}
                  placeholder="Año"
                  className="w-full text-center text-xs p-1.5 border border-indigo-200/60 rounded bg-white"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={data.dorsoMesDe}
                  onChange={(e) => updateField("dorsoMesDe", e.target.value)}
                  placeholder="Nombre de Mes (ej: Agosto)"
                  className="w-full text-xs p-1.5 border border-indigo-200/60 rounded bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ESTUDIANTES */}
      <div className="border-t border-slate-150 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-500" />
              2. Nómina de Alumnos y Asistencia
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Configure los datos de cada estudiante. Los datos se distribuyen automáticamente entre el Frente y el Dorso.</p>
          </div>

          {/* Sub-tab chooser inside the table */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setStudentEditTab("general")}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${studentEditTab === "general" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Datos Generales
            </button>
            <button
              type="button"
              onClick={() => setStudentEditTab("frente")}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${studentEditTab === "frente" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Específico Frente (Pág 1)
            </button>
            <button
              type="button"
              onClick={() => setStudentEditTab("dorso")}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-colors ${studentEditTab === "dorso" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
            >
              Específico Dorso (Pág 2)
            </button>
          </div>
        </div>

        {/* Table representation for high speed entries */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-2 text-center w-12">Ord.</th>
                <th className="py-2.5 px-3 min-w-[180px]">Nombre Completo (Nómina)</th>
                
                {studentEditTab === "general" && (
                  <>
                    <th className="py-2.5 px-2 w-20">Grado</th>
                    <th className="py-2.5 px-2 w-14 text-center">Edad</th>
                    <th className="py-2.5 px-2 w-14 text-center">Nac.</th>
                    <th className="py-2.5 px-3 w-[150px]">Diagnóstico</th>
                    <th className="py-2.5 px-3 w-[180px]">Domicilio</th>
                    <th className="py-2.5 px-3 w-[110px]">Teléfono</th>
                    <th className="py-2.5 px-2 text-center w-[90px]">Visibilidad</th>
                  </>
                )}

                {studentEditTab === "frente" && (
                  <>
                    <th className="py-2.5 px-2 text-center w-16 bg-amber-50/30">Aus.</th>
                    <th className="py-2.5 px-2 text-center w-16 bg-amber-50/30">Pres.</th>
                    <th className="py-2.5 px-3 w-[160px] bg-amber-50/30">Horario Frente</th>
                    <th className="py-2.5 px-2 text-center w-16 bg-amber-50/30">Calif.</th>
                    <th className="py-2.5 px-3 bg-amber-50/30">Observaciones Frente</th>
                  </>
                )}

                {studentEditTab === "dorso" && (
                  <>
                    <th className="py-2.5 px-3 w-[140px] bg-indigo-50/30">Días Horario</th>
                    <th className="py-2.5 px-3 w-[140px] bg-indigo-50/30">Horas Horario</th>
                    <th className="py-2.5 px-2 text-center w-20 bg-indigo-50/30">Total Hrs</th>
                  </>
                )}

                <th className="py-2.5 px-3 text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {data.estudiantes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-xs text-slate-400 font-medium">
                    No hay alumnos cargados. ¡Haga clic en "Agregar Alumno" o "Cargar datos de ejemplo" abajo!
                  </td>
                </tr>
              ) : (
                data.estudiantes.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                    <td className="py-2 px-1 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        value={st.nomina}
                        onChange={(e) => updateStudent(st.id, "nomina", e.target.value)}
                        placeholder="Ej: Susanita Giménez"
                        className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                      />
                    </td>

                    {/* GENERAL DETAILS */}
                    {studentEditTab === "general" && (
                      <>
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={st.grado}
                            onChange={(e) => updateStudent(st.id, "grado", e.target.value)}
                            placeholder="3° / 2 años"
                            className="w-full text-xs px-1.5 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={st.edad}
                            onChange={(e) => updateStudent(st.id, "edad", e.target.value)}
                            placeholder="8"
                            className="w-full text-center text-xs px-1 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="text"
                            value={st.nac}
                            onChange={(e) => updateStudent(st.id, "nac", e.target.value)}
                            placeholder="arg."
                            className="w-full text-center text-xs px-1 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={st.diagnostico}
                            onChange={(e) => updateStudent(st.id, "diagnostico", e.target.value)}
                            placeholder="Broncoespasmo."
                            className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={st.domicilio}
                            onChange={(e) => updateStudent(st.id, "domicilio", e.target.value)}
                            placeholder="Av. Gaona 803 - 1° A."
                            className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1.5">
                          <input
                            type="text"
                            value={st.telefono}
                            onChange={(e) => updateStudent(st.id, "telefono", e.target.value)}
                            placeholder="11-8888-2002"
                            className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1 text-center scale-90">
                          <div className="flex flex-col gap-0.5 justify-center items-center">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={st.incluirFrente}
                                onChange={(e) => updateStudent(st.id, "incluirFrente", e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                              />
                              <span className="text-[10px] text-amber-700 font-semibold">Pág 1</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={st.incluirDorso}
                                onChange={(e) => updateStudent(st.id, "incluirDorso", e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                              />
                              <span className="text-[10px] text-blue-700 font-semibold">Pág 2</span>
                            </label>
                          </div>
                        </td>
                      </>
                    )}

                    {/* FRENTE SPECIFICS */}
                    {studentEditTab === "frente" && (
                      <>
                        <td className="py-2 px-1 bg-amber-50/10">
                          <input
                            type="text"
                            value={st.frenteAus}
                            onChange={(e) => updateStudent(st.id, "frenteAus", e.target.value)}
                            placeholder="-"
                            className="w-full text-center text-xs px-1 py-1 border border-orange-200/60 rounded bg-orange-50/20 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-1 bg-amber-50/10">
                          <input
                            type="text"
                            value={st.frentePres}
                            onChange={(e) => updateStudent(st.id, "frentePres", e.target.value)}
                            placeholder="3"
                            className="w-full text-center text-xs px-1 py-1 border border-orange-200/60 rounded bg-orange-50/20 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-1.5 bg-amber-50/10">
                          <input
                            type="text"
                            value={st.frenteHorario}
                            onChange={(e) => updateStudent(st.id, "frenteHorario", e.target.value)}
                            placeholder="Martes y jueves 08:00 a 10:00"
                            className="w-full text-xs px-2 py-1 border border-orange-200/60 rounded bg-orange-50/20 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-1 bg-amber-50/10">
                          <input
                            type="text"
                            value={st.frenteCalif}
                            onChange={(e) => updateStudent(st.id, "frenteCalif", e.target.value)}
                            placeholder="Calif"
                            className="w-full text-center text-xs px-1 py-1 border border-orange-200/60 rounded bg-orange-50/20 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-1.5 bg-amber-50/10">
                          <input
                            type="text"
                            value={st.frenteObservaciones}
                            onChange={(e) => updateStudent(st.id, "frenteObservaciones", e.target.value)}
                            placeholder="Notas de ingreso/egreso"
                            className="w-full text-xs px-2 py-1 border border-orange-200/60 rounded bg-orange-50/20 focus:outline-none focus:border-amber-400"
                          />
                        </td>
                      </>
                    )}

                    {/* DORSO SPECIFICS */}
                    {studentEditTab === "dorso" && (
                      <>
                        <td className="py-2 px-1.5 bg-indigo-50/10">
                          <input
                            type="text"
                            value={st.dorsoDias}
                            onChange={(e) => updateStudent(st.id, "dorsoDias", e.target.value)}
                            placeholder="Ej: Martes y jueves"
                            className="w-full text-xs px-2 py-1 border border-indigo-200/60 rounded bg-indigo-50/20 focus:outline-none focus:border-indigo-400"
                          />
                        </td>
                        <td className="py-2 px-1.5 bg-indigo-50/10">
                          <input
                            type="text"
                            value={st.dorsoHoras}
                            onChange={(e) => updateStudent(st.id, "dorsoHoras", e.target.value)}
                            placeholder="Ej: 08:00 a 10:00 hs."
                            className="w-full text-xs px-2 py-1 border border-indigo-200/60 rounded bg-indigo-50/20 focus:outline-none focus:border-indigo-400"
                          />
                        </td>
                        <td className="py-2 px-1 bg-indigo-50/10">
                          <input
                            type="text"
                            value={st.dorsoTotalHoras}
                            onChange={(e) => updateStudent(st.id, "dorsoTotalHoras", e.target.value)}
                            placeholder="Ej: 8"
                            className="w-full text-center text-xs px-1.5 py-1 border border-indigo-200/60 rounded bg-indigo-50/20 focus:outline-none focus:border-indigo-400"
                          />
                        </td>
                      </>
                    )}

                    <td className="py-2 px-2.5 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          onClick={() => moveStudent(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStudent(idx, "down")}
                          disabled={idx === data.estudiantes.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStudent(st.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Eliminar Alumno"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Student button */}
        <div className="flex justify-start mt-3">
          <button
            type="button"
            onClick={addStudent}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir Alumno a la Nómina
          </button>
        </div>
      </div>

      {/* SECTION 3: ASISTENCIA DOCENTE Y OBSERVACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-150 pt-6">
        {/* Page 1 (Frente) Docente info */}
        <div className="bg-amber-50/35 p-4 rounded-xl border border-amber-100 flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              Asistencia Docente (Frente / Pág 1)
            </h4>
            <button
              type="button"
              onClick={handleAutoFillAsistenciaDocente}
              className="text-[10px] text-amber-700 font-semibold hover:underline flex items-center gap-1"
            >
              Autocompletar valores estándar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clases Dadas</label>
              <input
                type="text"
                value={data.asistenciaClasesDadas}
                onChange={(e) => updateField("asistenciaClasesDadas", e.target.value)}
                placeholder="Ej: 20."
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asistencias</label>
              <input
                type="text"
                value={data.asistenciaAsistencias}
                onChange={(e) => updateField("asistenciaAsistencias", e.target.value)}
                placeholder="Ej: 7 días"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Días Hábiles</label>
              <input
                type="text"
                value={data.asistenciaDiasHabiles}
                onChange={(e) => updateField("asistenciaDiasHabiles", e.target.value)}
                placeholder="Ej: 11 días."
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Inasistencias y Licencias</label>
              <input
                type="text"
                value={data.asistenciaLicencias}
                onChange={(e) => updateField("asistenciaLicencias", e.target.value)}
                placeholder="Ej: licencia 70 A"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Observaciones Frente</label>
            <textarea
              rows={3}
              value={data.asistenciaObservaciones}
              onChange={(e) => updateField("asistenciaObservaciones", e.target.value)}
              placeholder="Escriba los comentarios o aclaraciones de clases dadas o receso..."
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Page 2 (Dorso) Observaciones */}
        <div className="bg-indigo-50/35 p-4 rounded-xl border border-indigo-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3">
              Información del Horario (Dorso / Pág 2)
            </h4>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Observaciones Dorso</label>
                <textarea
                  rows={4}
                  value={data.dorsoObservaciones}
                  onChange={(e) => updateField("dorsoObservaciones", e.target.value)}
                  placeholder="Se anotan observaciones adicionales o indicaciones de cargo..."
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-white/70 rounded-lg border border-indigo-100/50 text-[10px] text-slate-500 leading-relaxed">
                <strong>Recordatorio:</strong> En el dorso se define el horario de trabajo completo real que figura en su Declaración Jurada (DDJJ) de la Escuela Domiciliaria Nº 1, no solamente las horas de atención a cada alumno individual.
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
