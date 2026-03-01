import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY no está configurada en las variables de entorno.');
    process.exit(1);
}


/**
 * Generar tarjetas de estudio a partir de texto
 * @param {string} text - Document text
 * @param {number} count - Número de tarjetas a generar
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Answer in Spanish. Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
        });

        const generatedText = response.text;

        // Parsear respuesta
        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for (const line of lines) {
                if (line.startsWith('Q:')) {
                    question = line.substring(2).trim();
                } else if (line.startsWith('A:')) {
                    answer = line.substring(2).trim();
                } else if (line.startsWith('D:')) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Error en Gemini API:', error);
        throw new Error('No se pudieron generar las tarjetas de estudio');
    }
};

/**
 * Generar preguntas de quizz
 * @param {string} text - Texto del documento
 * @param {number} numQuestions - Número de preguntas
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Please answer in Spanish. Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]

    Separate questions with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent ({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;

        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.match(/^O\d:/)) {
                    options.push(trimmed.substring(3).trim());
                } else if (trimmed.startsWith('C:')) {
                    correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('E:')) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                    difficulty = diff;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Error en Gemini API:', error);
        throw new Error('No se pudieron generar las preguntas del quiz');
    }
};

/**
 * Generar resumen del documento
 * @param {string} text - Texto del documento
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
    const prompt = `Please answer in Spanish. Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
    Keep the summary clear and structured.

    Text:
    ${text.substring(0, 20000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText;
    } catch (error) {
        console.error('Error en Gemini API:', error);
        throw new Error('No se pudo generar el resumen');
    }
};

/**
 * Chat con contexto del documento
 * @param {string} question - Pregunta del usuario
 * @param {Array<Object>} chunks - Fragmentos relevantes del documento
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Please answer in Spanish. Based on the following context from a document, Analyse the context and answer the user's question
    If the answer is not in the context, say so.

    Context:
    ${context}
    
    Question: ${question}

    Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText
    } catch (error) {
        console.error('Error en Gemini API:', error);
        throw new Error('Failed to process chat request');
    }
};

/**
 * No se pudo procesar la solicitud de chat
 * @param {string} concept - Concepto a explicar
 * @param {string} context - Contexto relevante
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
    const prompt = `Please answer in Spanish. Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        const generatedText = response.text;
        return generatedText
    } catch (error) {
        console.error('Error en Gemini API:', error);
        throw new Error('No se pudo explicar el concepto');
    }
};