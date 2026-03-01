import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";

const AIActions = () => {
  const { id: documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  // ================================
  // GENERAR RESUMEN
  // ================================
  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Resumen generado");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch {
      toast.error("Error al generar el resumen.");
    } finally {
      setLoadingAction(null);
    }
  };

  // ================================
  // EXPLICAR CONCEPTO
  // ================================
  const handleExplainConcept = async () => {
    if (!concept.trim()) return;

    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(
        documentId,
        concept
      );
      setModalTitle(`Explicación: ${concept}`);
      setModalContent(explanation);
      setIsModalOpen(true);
    } catch {
      toast.error("Error al explicar el concepto.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl">
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Asistente IA
              </h3>
              <p className="text-xs text-slate-500">
                Impulsado por IA avanzada
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Generar resumen */}
          <div className="p-5 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-900">
                    Generar resumen
                  </h4>
                </div>
                <p className="text-sm text-slate-600">
                  Obtén un resumen conciso de todo el documento.
                </p>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {loadingAction === "summary" ? "Cargando..." : "Generar"}
              </button>
            </div>
          </div>

          {/* Explicar concepto */}
          <div className="p-5 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="font-semibold text-slate-900">
                Explicar un concepto
              </h4>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Ingresa un tema o concepto del documento para obtener una explicación detallada.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="ej: 'Full Stack'"
                className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50"
                disabled={loadingAction === "explain"}
              />

              <button
                onClick={handleExplainConcept}
                disabled={loadingAction === "explain" || !concept.trim()}
                className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {loadingAction === "explain" ? "Cargando..." : "Explicar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de resultado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto prose prose-sm max-w-none">
          <MarkdownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  );
};

export default AIActions;