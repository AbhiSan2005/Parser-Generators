import apiClient from './axiosClient';

// Core Math & Minimization Engines
export const executeAlgorithm = async (workspaceId, tabId, payload) => {
    const response = await apiClient.post(`/api/workspaces/${workspaceId}/tabs/${tabId}/execute`, payload);
    return response.data;
};

// CFG Tools
export const analyzeCFG = async (cfgData) => {
    const response = await apiClient.post('/api/cfg/analyze', cfgData);
    return response.data;
};

// AI Assistants
export const generateRegexAI = async (promptText) => {
    const response = await apiClient.post('/api/ai/generate-regex', { description: promptText });
    return response.data;
};

export const generateCfgAI = async (promptText) => {
    const response = await apiClient.post('/api/ai/generate-cfg', { description: promptText });
    return response.data;
};