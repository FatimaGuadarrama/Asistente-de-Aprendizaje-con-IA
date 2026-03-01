import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// @desc    Genera tarjetas de estudio desde documento
// @route   POST /api/ai/generate-flashcards
// @access  Privado
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json ({
                success: false,
                error: 'Por favor proporciona el ID del documento',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado o no listo',
                statusCode: 404
            });
        }

        // Generar tarjetas de estudio usando Gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        // Guardar en base de datos
        const flashcardset = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardset,
            message: 'Tarjetas de estudio generadas exitosamente'
        });
    } catch (error) {
        next (error);
    }
};

// @desc    Genera cuestionario desde documento
// @route   POST /api/ai/generate-quiz
// @access  Privado
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado o no listo',
                statusCode: 404
            });
        }

        // Generar cuestionario usando Gemini
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // Guardar en base de datos
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json ({
            success: true,
            data: quiz,
            message: 'Quiz generado exitosamente'
        });
    } catch (error) {
        next(error)
    }
};

// @desc    Genera resumen de documento
// @route   POST /api/ai/generate-summary
// @access  Privado
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el ID del documento',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
            success: false,
            error: 'Documento no encontrado o no listo',
            statusCode: 404
            });
        }
        
        // Generar resumen usando Gemini
        const summary = await geminiService.generateSummary(document.extractedText);

        res.status(200).json ({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Resumen generado exitosamente'
        });
    } catch (error) {
        next(error)
    }
};

// @desc    Chat con documento
// @route   POST /api/ai/chat
// @access  Privado
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el ID del documento y pregunta',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado o no listo',
                statusCode: 404
            });
        }

        // Encontrar fragmentos relevantes
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // Obtener o crear historial de chat
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }

        // Generar respuesta usando Gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // Guardar conversación
        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: []
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            },
        );
        
        await chatHistory.save();
        
        res.status(200).json ({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Respuesta generada exitosamente'
        });
    } catch (error) {
        next(error)
    }
};

// @desc    Explica un concepto desde documento
// @route   POST /api/ai/explain-concept
// @access  Privado
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el ID del documento y concepto',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json ({
                success: false,
                error: 'Documento no encontrado o no listo',
                statusCode: 404
            });
        }

        // Encontrar fragmentos relevantes para el concepto
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');
        
        // Generar explicación usando Gemini
        const explanation = await geminiService.explainConcept (concept, context);

        res.status(200).json ({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explicación generada exitosamente'
        });
    } catch (error) {
        next(error)
    }
};

// @desc    Obtiene el historial de chat de un documento
// @route   GET /api/ai/chat-history/:documentId
// @access  Privado
export const getChatHistory = async (req, res, next) => {
      try {
        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Por favor proporciona el ID del documento',
                statusCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('messages'); // Solo recupera el arreglo de mensajes
    
        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [], // Devuelve un arreglo vacío si no se encuentra historial de chat
                message: 'No se encontró historial de chat para este documento'
            });
        }
        
        res.status(200).json ({
            success: true,
            data: chatHistory.messages,
            message: 'Historial de chat recuperado exitosamente'
        });
    } catch (error) {
        next(error)
    }  
};