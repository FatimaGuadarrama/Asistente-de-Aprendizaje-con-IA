import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import DocumentPermission from "../models/DocumentPermission.js";
import { v4 as uuidv4 } from "uuid";

// @desc    Subir documento PDF
// @route   POST /api/documents/upload
// @access  Privado
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "Por favor sube un archivo PDF",
            statusCode: 400,
        });
        }

        const { title } = req.body;

        if (!title) {
        // Eliminar archivo subido si no se proporciona título
        await fs.unlink(req.file.path);
        return res.status(400).json({
            success: false,
            error: "Por favor proporciona un título para el documento",
            statusCode: 400,
        });
        }

        // Construir la URL para el archivo subido
        const baseUrl = process.env.SERVER_URL;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        // Crear registro del documento
        const document = await Document.create({
        userId: req.user._id,
        title,
        fileName: req.file.originalname,
        fileUrl,   // para el frontend
        filePath,  // para el backend
        fileSize: req.file.size,
        status: "processing",
        });

        // Crear permiso para el dueño como creator
        await DocumentPermission.create({
        userId: req.user._id,
        documentId: document._id,
        role: "creator",
        });

        // Procesar PDF en segundo plano
        processPDF(document._id, req.file.path).catch((err) => {
        console.error("Error al procesar el PDF:", err);
        });

        res.status(201).json({
        success: true,
        data: document,
        message: "Documento subido exitosamente. Procesamiento en progreso...",
        });
    } catch (error) {
        // Limpiar archivo en caso de error
        if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// Función auxiliar para procesar PDF
const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);

        // Crear fragmentos
        const chunks = chunkText(text, 500, 50);

        // Actualizar documento
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Documento ${documentId} procesado exitosamente`);
    } catch (error) {
        console.error(`Error al procesar el documento ${documentId}:`, error);
        
        await Document.findByIdAndUpdate(documentId, { 
            status: 'failed' 
        });
    }
};

// @desc    Obtener todos los documentos del usuario
// @route   GET /api/documents
// @access  Privado
export const getDocuments = async (req, res, next) => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user._id);

        const documents = await Document.aggregate([
        {
            $lookup: {
            from: "documentpermissions",
            localField: "_id",
            foreignField: "documentId",
            as: "permissions"
            }
        },
        {
            $match: {
            $or: [
                { userId: userObjectId }, // documentos propios
                { "permissions.userId": userObjectId } // documentos compartidos
            ]
            }
        },
        {
            $lookup: {
            from: "flashcards",
            localField: "_id",
            foreignField: "documentId",
            as: "flashcardSets"
            }
        },
        {
            $lookup: {
            from: "quizzes",
            localField: "_id",
            foreignField: "documentId",
            as: "quizzes"
            }
        },
        {
            $addFields: {
            flashcardCount: { $size: "$flashcardSets" },
            quizCount: { $size: "$quizzes" },
            role: {
                $cond: [
                { $eq: ["$userId", userObjectId] },
                "creator",
                {
                    $ifNull: [
                    {
                        $arrayElemAt: [
                        {
                            $map: {
                            input: {
                                $filter: {
                                input: "$permissions",
                                as: "perm",
                                cond: { $eq: ["$$perm.userId", userObjectId] }
                                }
                            },
                            as: "p",
                            in: "$$p.role"
                            }
                        },
                        0
                        ]
                    },
                    "viewer" // valor por defecto si no hay permiso
                    ]
                }
                ]
            }
            }
        },
        {
            $project: {
            extractedText: 0,
            chunks: 0,
            flashcardSets: 0,
            quizzes: 0,
            permissions: 0
            }
        },
        {
            $sort: { uploadDate: -1 }
        }
        ]);

        res.status(200).json({
        success: true,
        count: documents.length,
        data: documents
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un documento individual con fragmentos.
// @route   GET /api/documents/:id
// @access  Privado
export const getDocument = async (req, res, next) => {
  try {
    const docId = req.params.id;
    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Documento no encontrado",
        statusCode: 404,
      });
    }

    // Verificar permisos
    const permission = await DocumentPermission.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (document.userId.toString() !== req.user._id.toString() && !permission) {
      return res.status(403).json({
        success: false,
        error: "No tienes acceso a este documento",
        statusCode: 403,
      });
    }

    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id });

    document.lastAccessed = Date.now();
    await document.save();

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;
    documentData.role =
      document.userId.toString() === req.user._id.toString()
        ? "creator"
        : permission?.role || "viewer";

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar documento
// @route   DELETE /api/documents/:id
// @access  Privado
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!document) {
            return res.status(404).json({
            success: false,
            error: 'Documento no encontrado',
            statusCode: 404
            });
        }

        // Eliminar archivo del sistema de archivos
        await fs.unlink(document.filePath).catch(() => {});

        // Eliminar documento
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Documento eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Compartir documento con otro usuario (rol viewer)
// @route   POST /api/documents/:id/share
// @access  Privado (solo creator)
export const shareDocument = async (req, res, next) => {
  try {
    const docId = req.params.id;

    // Verificar que el documento existe y pertenece al usuario autenticado
    const document = await Document.findOne({ _id: docId, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Documento no encontrado o no eres el dueño",
        statusCode: 404,
      });
    }

    // Generar un código único
    const code = uuidv4();

    // Guardar el código en el documento
    document.shareCode = code;
    await document.save();

    res.status(201).json({
      success: true,
      message: "Código generado exitosamente",
      data: { code },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unirse a un documento con código
// @route   POST /api/documents/join
// @access  Privado
export const joinDocumentByCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Debes proporcionar un código",
        statusCode: 400,
      });
    }

    // Buscar documento por shareCode
    const document = await Document.findOne({ shareCode: code });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Código inválido",
        statusCode: 404,
      });
    }

    // Verificar si ya tiene permiso
    const existingPermission = await DocumentPermission.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (existingPermission) {
      return res.status(400).json({
        success: false,
        error: "Ya tienes acceso a este documento",
        statusCode: 400,
      });
    }

    // Crear permiso como viewer
    await DocumentPermission.create({
      userId: req.user._id,
      documentId: document._id,
      role: "viewer",
    });

    res.status(200).json({
      success: true,
      message: "Te has unido al documento exitosamente",
    });
  } catch (error) {
    next(error);
  }
};