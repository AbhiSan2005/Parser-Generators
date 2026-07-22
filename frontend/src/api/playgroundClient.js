import apiClient from './axiosClient';

export const createPlayground = async (playgroundData) => {
    const response = await apiClient.post('/playgrounds', playgroundData);
    return response.data;
};

export const getUserPlaygrounds = async (userId) => {
    const response = await apiClient.get(`/playgrounds/user/${userId}`);
    return response.data;
};

export const getPlayground = async (playgroundId) => {
    const response = await apiClient.get(`/playgrounds/${playgroundId}`);
    return response.data;
};

export const saveGrammar = async (playgroundId, grammarData) => {
    const response = await apiClient.put(`/playgrounds/${playgroundId}/grammar`, grammarData);
    return response.data;
};

export const compileParser = async (playgroundId) => {
    const response = await apiClient.post(`/playgrounds/${playgroundId}/compile`);
    return response.data;
};

export const deletePlayground = async (playgroundId) => {
    const response = await apiClient.delete(`/playgrounds/${playgroundId}`);
    return response.data;
};

export const updatePlayground = async (playgroundId, playgroundData) => {
    const response = await apiClient.put(`/playgrounds/${playgroundId}`, playgroundData);
    return response.data;
};

export const evaluateTestString = async (playgroundId, test_input) => {
    const response = await apiClient.post(`/playgrounds/${playgroundId}/evaluate`, { test_input });
    return response.data;
};