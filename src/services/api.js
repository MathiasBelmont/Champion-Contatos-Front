import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080' // Endereço do seu Backend Java
});

// Interceptador: Antes de cada requisição, veja se tem token e anexe
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;