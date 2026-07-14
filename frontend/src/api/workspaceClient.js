import apiClient from './axiosConfig';

export const fetchUserWorkspaces = async (userId) => {
    const response = await apiClient.get(`/workspaces/user/${userId}`);
    return response.data;
};

export const fetchWorkspaceById = async (workspaceId) => {
    const response = await apiClient.get(`/workspaces/${workspaceId}`);
    return response.data;
};

export const createWorkspace = async (workspaceData) => {
    const response = await apiClient.post('/workspaces', workspaceData);
    return response.data;
};

export const createTab = async (workspaceId, tabData) => {
    const response = await apiClient.post(`/workspaces/${workspaceId}/tabs`, tabData);
    return response.data;
};

export const setActiveTabApi = async (workspaceId, activeTabId) => {
    const response = await apiClient.put(`/workspaces/${workspaceId}/active-tab`, { activeTabId });
    return response.data;
};