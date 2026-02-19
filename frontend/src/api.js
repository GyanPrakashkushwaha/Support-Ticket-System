import axios from 'axios';

// Because we set up the proxy in Vite, we just use the relative path!
const api = axios.create({
    baseURL: '/api', 
});

export default api;