// =============================== 
// IMPORTACIONES
// ===============================
import React, { useState, useEffect } from "react";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock
} from "lucide-react";

// ===============================
// COMPONENTE DASHBOARD
// ===============================
const DashboardPage = () => {

  // -------------------------------
  // ESTADOS
  // -------------------------------
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // EFECTO PARA CARGAR DATOS
  // -------------------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data__getDashboardData", data);
        setDashboardData(data.data);
      } catch (error) {
        toast.error("Error al obtener datos del dashboard.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ===============================
  // VALIDACIÓN DE CARGA
  // ===============================
  if (loading) { 
    return <Spinner />;
  }

  // ===============================
  // VALIDACIÓN DE DATOS VACÍOS
  // ===============================
  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-sm">
            No hay datos disponibles del dashboard.
          </p>
        </div>
      </div>
    );
  }

  // ===============================
  // ESTADÍSTICAS DEL DASHBOARD
  // ===============================
  const stats = [
    {
      label: "Documentos Totales",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      label: "Tarjetas de Estudio Totales",
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
    },
    {
      label: "Quizzes Totales",
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: "from-emerald-400 to-teal-500",
    }
  ];

  // ===============================
  // RENDER PRINCIPAL
  // ===============================
  return (
    <div className="min-h-screen relative">
      <div className="relative max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Revisa tu progreso y actividad de aprendizaje
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="bg-white border rounded-xl p-5 shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {stat.label}
                  </span>

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="text-3xl font-semibold text-slate-900">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border rounded-2xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-900">
              Actividad Reciente
            </h3>
          </div>

          {dashboardData.recentActivity &&
          (dashboardData.recentActivity.documents.length > 0 ||
            dashboardData.recentActivity.quizzes.length > 0) ? (

            [...(dashboardData.recentActivity.documents || []).map(doc => ({
              id: doc._id,
              description: doc.title,
              timestamp: doc.lastAccessed,
              link: `/documents/${doc._id}`,
              type: "document"
            })),
            ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
              id: quiz._id,
              description: quiz.title,
              timestamp: quiz.lastAttempted,
              link: `/quizzes/${quiz._id}`,
              type: "quiz"
            }))]

              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border mb-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {activity.type === "document"
                        ? "Documento accedido: "
                        : "Quiz intentado: "}
                      <span className="text-slate-700">
                        {activity.description}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {activity.link && (
                    <a
                      href={activity.link}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Ver
                    </a>
                  )}
                </div>
              ))

          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-3">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">
                No hay actividad reciente todavía.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Comienza a aprender para ver tu progreso aquí
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
