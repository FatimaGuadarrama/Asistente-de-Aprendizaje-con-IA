import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock, Share2 } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import documentService from '../../services/documentService';

//Función auxiliar para formatear el tamaño del archivo
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();
  const [shareCode, setShareCode] = useState(null);

  // Navegar al detalle del documento
  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  // Eliminar documento
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  // Compartir documento y generar código
  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const code = await documentService.shareDocument(document._id);
      setShareCode(code);
      toast.success("Código de acceso generado.");
    } catch (error) {
      toast.error(error?.message || "Error al compartir documento.");
    }
  };

  return (
    <div
      className="group relative w-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 hover:border-slate-300/60 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
      onClick={handleNavigate}
    >
      {/* Sección de encabezado */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="shrink-0 w-12 h-12 bg-linear-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
            <FileText className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex gap-2">
            {document.role === "creator" && (
              <>
                {/* Botón para compartir */}
                <button
                  onClick={handleShare}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" strokeWidth={2} />
                </button>
                {/* Botón para eliminar */}
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-base font-semibold text-slate-900 truncate mb-2" title={document.title}>
          {document.title}
        </h3>

        {/* Información del documento */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {document.fileSize !== undefined && (
            <span className="font-medium">{formatFileSize(document.fileSize)}</span>
          )}
        </div>

        {/* Sección de estadísticas */}
        <div className="flex items-center gap-3">
          {document.flashcardCount !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" strokeWidth={2} />
              <span className="text-xs font-semibold text-purple-700">{document.flashcardCount} Flashcards</span>
            </div>
          )}
          {document.quizCount !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2}/>
              <span className="text-xs font-semibold text-emerald-700">{document.quizCount} Quizzes</span>
            </div>
          )}
        </div>

        {/* Mostrar código de acceso si existe */}
        {shareCode && (
          <div className="mt-3 text-xs text-slate-600">
            Código de acceso: <span className="font-semibold">{shareCode}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(shareCode);
                toast.success("Código copiado al portapapeles.");
              }}
              className="ml-2 text-emerald-600 hover:underline"
            >
              Copiar
            </button>
          </div>
        )}
      </div>

      {/* Sección de pie de tarjeta */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Subido {moment(document.createdAt).fromNow()}</span>
        </div>
      </div>

      {/* Indicador de hover */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 to-teal-500/0 pointer-events-none" />
    </div>
  );
};

export default DocumentCard; 