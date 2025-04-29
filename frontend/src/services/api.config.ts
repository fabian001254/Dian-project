import axios from 'axios';

// Crear una instancia de axios con la configuración base
// Usamos una URL absoluta para asegurarnos de que las solicitudes vayan al servidor backend
// independientemente de dónde se esté ejecutando el frontend
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',  // Quitamos el '/api' predeterminado para evitar duplicación
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Log para depuración
console.log('API configurada con baseURL:', api.defaults.baseURL);
console.log('API environment:', { NODE_ENV: process.env.NODE_ENV, REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL });

// Interceptor para agregar el token a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
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
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.config?.url, error.response?.status, error.message);
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
