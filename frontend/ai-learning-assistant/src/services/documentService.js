import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getDocuments = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS) ;
        return response.data?.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener documentos' };
    }
};

const uploadDocument = async (formData) => {
    try {
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al subir documento' };
    }
};

const deleteDocument = async (id) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar documento' };
    }
};

const getDocumentById = async (id) => {
    try {
        const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id));
        return response.data?.data; 
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener detalles del documento' };
    }
};

const shareDocument = async (id) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.DOCUMENTS.SHARE_DOCUMENT(id)
    );
    return response.data.data.code;
  } catch (error) {
    throw error.response?.data || { message: 'Error al compartir documento' };
  }
};

const joinDocumentByCode = async (code) => {
  try {
    const response = await axiosInstance.post(API_PATHS.DOCUMENTS.JOIN_BY_CODE, { code });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al unirse al documento' };
  }
};

const documentService = {
    getDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentById,
    shareDocument,
    joinDocumentByCode,
};

export default documentService;