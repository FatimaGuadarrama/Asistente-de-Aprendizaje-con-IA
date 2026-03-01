import mongoose from "mongoose";
import DocumentPermission from "../models/DocumentPermission.js";
import Document from "../models/Document.js";

// Middleware para verificar permisos sobre un documento
export const authorizeDoc = (requiredRole = "read") => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;

      const docId =
        req.params.documentId ||
        req.params.id ||
        req.body.documentId;

      if (!docId) {
        return res.status(400).json({
          success: false,
          error: "ID de documento no proporcionado",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(docId)) {
        return res.status(400).json({
          success: false,
          error: "ID de documento inválido",
        });
      }

      const objectId = new mongoose.Types.ObjectId(docId);

      // Verificar si el documento existe
      const document = await Document.findById(objectId);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: "Documento no encontrado",
        });
      }

      // Si es el dueño, permitir automáticamente
      if (document.userId.toString() === userId.toString()) {
        return next();
      }

      // Si no es dueño, buscar permiso
      const permission = await DocumentPermission.findOne({
        userId,
        documentId: objectId,
      });

      if (!permission) {
        return res.status(403).json({
          success: false,
          error: "No tienes acceso a este documento",
        });
      }

      // Validar rol según lo requerido
      if (requiredRole !== "read" && permission.role === "viewer") {
        return res.status(403).json({
          success: false,
          error: "Solo puedes visualizar este documento",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Error interno de autorización",
      });
    }
  };
};