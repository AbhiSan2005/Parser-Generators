import apiClient from './axiosClient';

export const createPlayground = async (playgroundData) => {
    const response = await apiClient.post('/api/playgrounds', playgroundData);
    return response.data;
};

export const getUserPlaygrounds = async (userId) => {
    const response = await apiClient.get(`/api/playgrounds/user/${userId}`);
    return response.data;
};

export const getPlayground = async (playgroundId) => {
    const response = await apiClient.get(`/api/playgrounds/${playgroundId}`);
    return response.data;
};

export const saveGrammar = async (playgroundId, grammarData) => {
    const response = await apiClient.put(`/api/playgrounds/${playgroundId}/grammar`, grammarData);
    return response.data;
};

export const compileParser = async (playgroundId) => {
    const response = await apiClient.post(`/api/playgrounds/${playgroundId}/compile`);
    return response.data;
};

export const deletePlayground = async (playgroundId) => {
    const response = await apiClient.delete(`/api/playgrounds/${playgroundId}`);
    return response.data;
};

export const updatePlayground = async (playgroundId, playgroundData) => {
    const response = await apiClient.put(`/api/playgrounds/${playgroundId}`, playgroundData);
    return response.data;
};

export const evaluateTestString = async (playgroundId, test_input) => {
    const response = await apiClient.post(`/api/playgrounds/${playgroundId}/evaluate`, { test_input });
    return response.data;
};