import apiClient from './axiosConfig';

export const executeAlgorithm = async (workspaceId, tabId, payload) => {
    const response = await apiClient.post(`/workspaces/${workspaceId}/tabs/${tabId}/execute`, payload);
    return response.data;
};