import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/', 
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error Network Trigger:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;