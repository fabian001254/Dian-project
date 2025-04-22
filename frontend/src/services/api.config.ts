import axios from 'axios';

// Crear una instancia de axios con la configuración base
// Usamos una URL absoluta para asegurarnos de que las solicitudes vayan al servidor backend
// independientemente de dónde se esté ejecutando el frontend
const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // URL absoluta al backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Log para depuración
console.log('API configurada con baseURL:', api.defaults.baseURL);

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      // Limpiar el token y redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    
    // Formatear el mensaje de error para una mejor experiencia de usuario
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

export default api;
