import apiClient from './axiosClient';

export const googleLoginApi = async (credential) => {
    const response = await apiClient.post('/auth/google', { credential });
    return response.data;
};

export const getAuthUserApi = async (userId) => {
    const response = await apiClient.get(`/auth/me/${userId}`);
    return response.data;
};
