import api from './api.config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId?: string;
  role?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    nit: string;
    isAuthorized: boolean;
  };
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

/**
 * Servicio para manejar la autenticación de usuarios
 */
export const AuthService = {
  /**
   * Iniciar sesión con email y contraseña
   * @param credentials Credenciales de inicio de sesión
   * @returns Respuesta con token y datos del usuario
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Registrar un nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Respuesta con token y datos del usuario
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener el perfil del usuario actual
   * @returns Datos del usuario
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<{ success: boolean; data: User }>('/auth/profile');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar el perfil del usuario
   * @param userData Datos actualizados del usuario
   * @returns Usuario actualizado
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<{ success: boolean; data: User }>('/auth/profile', userData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cambiar la contraseña del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Mensaje de éxito
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data.message;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Solicitar restablecimiento de contraseña
   * @param email Email del usuario
   * @returns Mensaje de éxito
   */
  forgotPassword: async (email: string): Promise<string> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
      return response.data.message;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Restablecer contraseña con token
   * @param token Token de restablecimiento
   * @param newPassword Nueva contraseña
   * @returns Mensaje de éxito
   */
  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data.message;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cerrar sesión (solo limpia el token en el cliente)
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default AuthService;
