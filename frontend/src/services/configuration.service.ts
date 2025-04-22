import api from './api.config';

export interface CompanyConfig {
  businessName: string;
  nit: string;
  address: string;
  taxRegime: string;
  fiscalResponsibilities: string;
  contactInfo: string;
  logoUrl: string;
}

export interface BillingConfig {
  invoicePrefix: string;
  lastInvoiceNumber: number;
  dianResolutionNumber: string;
  resolutionStartDate: string;
  resolutionEndDate: string;
}

export interface CertificateConfig {
  certificateBlobUrl: string;
  certificatePassword: string;
  certificateStatus: string;
  certificateExpiryDate: string;
}

export interface SecurityConfig {
  minPasswordLength: number;
  requiredCharacters: string;
  maxLoginAttempts: number;
  lockoutMinutes: number;
  passwordChangeDays: number;
}

export interface NotificationsConfig {
  emailTemplates: string;
  autoNotifications: boolean;
  clientSendOptions: string;
}

export interface BackupConfig {
  backupSchedule: string;
  restoreOptions: string;
  backupHistory: string;
}

export interface AppearanceConfig {
  theme: string;
  accentColor: string;
}

export interface Configuration {
  company: CompanyConfig;
  billing: BillingConfig;
  certificate: CertificateConfig;
  security: SecurityConfig;
  notifications: NotificationsConfig;
  backup: BackupConfig;
  appearance: AppearanceConfig;
}

const defaultConfig: Configuration = {
  company: { businessName: '', nit: '', address: '', taxRegime: '', fiscalResponsibilities: '', contactInfo: '', logoUrl: '' },
  billing: { invoicePrefix: '', lastInvoiceNumber: 0, dianResolutionNumber: '', resolutionStartDate: '', resolutionEndDate: '' },
  certificate: { certificateBlobUrl: '', certificatePassword: '', certificateStatus: '', certificateExpiryDate: '' },
  security: { minPasswordLength: 8, requiredCharacters: '', maxLoginAttempts: 5, lockoutMinutes: 15, passwordChangeDays: 90 },
  notifications: { emailTemplates: '', autoNotifications: false, clientSendOptions: '' },
  backup: { backupSchedule: '', restoreOptions: '', backupHistory: '' },
  appearance: { theme: 'light', accentColor: '#007bff' }
};

const ConfigurationService = {
  getConfiguration: async (): Promise<Configuration> => {
    try {
      const response = await api.get('/config');
      const config = response.data?.data || response.data;
      // Cache
      localStorage.setItem('appConfig', JSON.stringify(config));
      return config;
    } catch (error: any) {
      if (error.response?.status === 404) {
        const stored = localStorage.getItem('appConfig');
        return stored ? JSON.parse(stored) : defaultConfig;
      }
      return Promise.reject(error);
    }
  },
  updateConfiguration: async (config: Configuration): Promise<void> => {
    // Guardar solo en cache local sin peticiones al servidor
    localStorage.setItem('appConfig', JSON.stringify(config));
    return Promise.resolve();
  }
};

export default ConfigurationService;
