// src/services/question.service.ts
import api from './api';

// Tüm soruları getir (filtreleme ve sayfalama ile)
export const getQuestions = async (page = 1, filters = {}) => {
    const response = await api.get('/questions', {
        params: { page, ...filters }
    });
    return response.data;
};

// Tek bir soruyu getir
export const getQuestion = async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
};

// Yeni soru oluştur
export const createQuestion = async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
};

// Soruyu güncelle
export const updateQuestion = async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
};

// Soruyu sil
export const deleteQuestion = async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
};

// Resim yükleme
export const uploadQuestionImage = async (formData) => {
    const response = await api.post('/questions/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};