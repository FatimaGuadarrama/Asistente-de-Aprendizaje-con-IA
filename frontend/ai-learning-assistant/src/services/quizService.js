import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getQuizzesForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
        return response.data.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener quizzes' };
    }
};

const getQuizById = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
        return response.data.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener quiz' };
    }
};

const submitQuiz = async (quizId, answers) => {
    try {
        const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), { answers });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al enviar quiz' };
    }
};

const getQuizResults = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener resultados del quiz' };
    }
};

const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar quiz' };
    }
};

const quizService = {
    getQuizzesForDocument,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
};

export default quizService;