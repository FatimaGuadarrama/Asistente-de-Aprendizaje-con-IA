import Flashcard from '../models/Flashcard.js';

// @desc    Obtener todas las tarjetas de estudio de un documento
// @route   GET /api/flashcards/:documentId
// @access  Privado
export const getFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener todos los conjuntos de tarjetas de estudio de un usuario
// @route   GET /api/flashcards
// @access  Privado
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({ userId: req.user._id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Marcar la tarjeta de estudio como revisada
// @route   POST /api/flashcards/:cardId/review
// @access  Privado
export const reviewFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Conjunto de tarjetas o tarjeta no encontrada',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Tarjeta no encontrada en el conjunto",
                statusCode: 404
            });
        }
        
        // Actualizar información de revisión
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Tarjeta de estudio revisada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Activar o desactivar favorito en la tarjeta de estudio
// @route   PUT /api/flashcards/:cardId/star
// @access  Privado
export const toggleStarFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Conjunto de tarjetas o tarjeta no encontrada',
                statusCode: 404
            });
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);

        if (cardIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Tarjeta no encontrada en el conjunto",
                statusCode: 404
            });
        }

        // Alternar favorito
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'Agregado a favoritos' : 'Eliminado de favoritos'}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Eliminar el conjunto de tarjetas de estudio
// @route   DELETE /api/flashcards/:id
// @access  Privado
export const deleteFlashcardSet = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: "Conjunto de tarjetas no encontrado",
                statusCode: 404
            });
        }

        await flashcardSet.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Conjunto de tarjetas eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
};