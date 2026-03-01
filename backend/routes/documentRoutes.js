import express from 'express';
import {
    uploadDocument,
    getDocuments,
    getDocument,
    deleteDocument,
    shareDocument,
    joinDocumentByCode,
} from '../controllers/documentController.js';
import protect from '../middleware/auth.js';
import upload from '../config/multer.js';
import { authorizeDoc } from '../middleware/authorizeDoc.js';

const router = express.Router();

// Todas las rutas están protegidas
router.use(protect);

// Subir documento (solo creator puede hacerlo)
router.post('/upload', upload.single('file'), uploadDocument);

// Obtener todos los documentos del usuario autenticado
router.get('/', getDocuments);

// Unirse a un documento con código
router.post("/join", joinDocumentByCode);

// Obtener un documento específico (viewer o creator pueden acceder)
router.get('/:id', authorizeDoc("read"), getDocument);

// Eliminar documento (solo creator puede hacerlo)
router.delete('/:id', authorizeDoc("write"), deleteDocument);

// Compartir documento
router.post("/:id/share", authorizeDoc("write"), shareDocument);

export default router;