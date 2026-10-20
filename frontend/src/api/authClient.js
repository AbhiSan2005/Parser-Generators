import apiClient from './axiosClient';

export const googleLoginApi = async (credential) => {
    const response = await apiClient.post('/api/auth/google', { credential });
    return response.data;
};

export const getAuthUserApi = async (userId) => {
    const response = await apiClient.get(`/api/auth/me/${userId}`);
    return response.data;
};
