import axios from 'axios'
import Swal from 'sweetalert2'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isSessionExpired = false

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config.url.includes('/auth/login')
        if (!isSessionExpired && error.response?.status === 401 && !isLoginRequest) {
            isSessionExpired = true
            localStorage.removeItem('token')
            Swal.fire({
                icon: 'warning',
                title: 'Session หมดอายุ',
                text: 'กรุณาเข้าสู่ระบบใหม่',
                confirmButtonText: 'ยืนยัน',
            }).then(() => {
                window.location.href = '/auth'
                isSessionExpired = false
            })
        }
        return Promise.reject(error)
    }
)
export default api