import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';
import { authorizeDoc } from '../middleware/authorizeDoc.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener un quiz específico
router.get('/quiz/:id', getQuizById);

// Enviar respuestas a un quiz
router.post('/:id/submit', submitQuiz);

// Obtener resultados de un quiz (viewer o creator pueden acceder)
router.get('/:id/results', authorizeDoc("read"), getQuizResults);

// Eliminar un quiz (solo creator puede hacerlo)
router.delete('/:id', authorizeDoc("write"), deleteQuiz);

// Obtener todos los quizzes de un documento (viewer o creator pueden acceder)
router.get('/:documentId', authorizeDoc("read"), getQuizzes);

export default router;