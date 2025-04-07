import api from './api.js'

export const login = async (payload) => {
    const res = await api.post('/auth/login', payload)
    return res.data
}

export const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    return res.data
}

export const getGoogleAuthUrl = () => {
    return `${api.defaults.baseURL}/auth/google`;
};

export const handleOAuthCallback = (token) => {
    localStorage.setItem('token', token);
    return { token };
};
