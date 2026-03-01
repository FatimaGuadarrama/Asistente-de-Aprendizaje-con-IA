import express from 'express';
import {
    getFlashcards,
    getAllFlashcardSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,
} from '../controllers/flashcardController.js';
import protect from '../middleware/auth.js';
import { authorizeDoc } from '../middleware/authorizeDoc.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener todos los sets de flashcards del usuario
router.get('/', getAllFlashcardSets);

// Obtener flashcards de un documento específico (viewer o creator pueden acceder)
router.get('/:documentId', authorizeDoc("read"), getFlashcards);

// Revisar una flashcard (viewer o creator pueden hacerlo)
router.post('/:cardId/review', authorizeDoc("read"), reviewFlashcard);

// Marcar/desmarcar una flashcard como favorita (solo creator puede hacerlo)
router.put('/:cardId/star', authorizeDoc("write"), toggleStarFlashcard);

// Eliminar un set de flashcards (solo creator puede hacerlo)
router.delete('/:id', authorizeDoc("write"), deleteFlashcardSet);

export default router;