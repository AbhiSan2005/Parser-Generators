import apiClient from './axiosClient';

// Workspace Actions
export const getUserWorkspaces = async (userId) => {
    const response = await apiClient.get(`/api/workspaces/user/${userId}`);
    return response.data;
};

export const getWorkspaceById = async (workspaceId) => {
    const response = await apiClient.get(`/api/workspaces/${workspaceId}`);
    return response.data;
};

export const createWorkspace = async (workspaceData) => {
    const response = await apiClient.post('/api/workspaces', workspaceData);
    return response.data;
};

export const deleteWorkspace = async (workspaceId) => {
    const response = await apiClient.delete(`/api/workspaces/${workspaceId}`);
    return response.data;
};

export const updateWorkspace = async (workspaceId, workspaceData) => {
    const response = await apiClient.put(`/api/workspaces/${workspaceId}`, workspaceData);
    return response.data;
};

// Tab Operations inside Workspaces
export const createTab = async (workspaceId, tabData) => {
    const response = await apiClient.post(`/api/workspaces/${workspaceId}/tabs`, tabData);
    return response.data;
};

export const updateTab = async (workspaceId, tabId, tabData) => {
    const response = await apiClient.put(`/api/workspaces/${workspaceId}/tabs/${tabId}`, tabData);
    return response.data;
};

export const setActiveTab = async (workspaceId, tabId) => {
    const response = await apiClient.put(`/api/workspaces/${workspaceId}/active-tab`, { tabId });
    return response.data;
};

export const deleteTab = async (workspaceId, tabId) => {
    const response = await apiClient.delete(`/api/workspaces/${workspaceId}/tabs/${tabId}`);
    return response.data;
};