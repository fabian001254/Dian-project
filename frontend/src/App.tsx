import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import Layout from './components/layout/Layout';

// Auth Pages
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/auth';

// Main Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import CreateInvoicePage from './pages/invoices/CreateInvoicePage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import CustomerListPage from './pages/customers/CustomerListPage';
import CreateCustomerPage from './pages/customers/CreateCustomerPage';
import EditCustomerPage from './pages/customers/EditCustomerPage';
import ProductListPage from './pages/products/ProductListPage';
import CreateProductPage from './pages/products/CreateProductPage';
import EditProductPage from './pages/products/EditProductPage';
import HabilitacionPage from './pages/habilitacion/HabilitacionPage';
import ProfilePage from './pages/profile/ProfilePage';
import VendorListPage from './pages/vendors/VendorListPage';
import CreateVendorPage from './pages/vendors/CreateVendorPage';
import VendorDetailPage from './pages/vendors/VendorDetailPage';
import EditVendorPage from './pages/vendors/EditVendorPage';

// Certificate Pages
import { CertificatesPage, CertificateSimulator, CertificateConfigPage, CertificateDetailPage } from './pages/certificates';

// Report Pages
import { ReportsDashboardPage, IvaReportPage, SalesByPeriodPage, DocumentStatusPage } from './pages/reports';

// Settings Page
import SettingsPage from './pages/settings/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Verificando autenticación..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Preparando la aplicación..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// Nota: Se han eliminado los componentes PlaceholderPage y RootRedirect
// ya que no se utilizan en la aplicación y generaban advertencias de ESLint

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalStyles />
        <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/auth/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/auth/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          
          {/* Protected Routes with Dashboard Layout (sidebar + content + dashboard) */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
          
          {/* Protected Routes with Standard Layout (sidebar + content) */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Invoice Routes */}
            <Route path="invoices" element={<InvoiceListPage />} />
            <Route path="invoices/create" element={<CreateInvoicePage />} />
            <Route path="invoices/:id" element={<InvoiceDetailPage />} />
            
            {/* Customer Routes */}
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/create" element={<CreateCustomerPage />} />
            <Route path="customers/:id/edit" element={<EditCustomerPage />} />
            
            {/* Vendor Routes */}
            <Route path="vendors" element={<VendorListPage />} />
            <Route path="vendors/create" element={<CreateVendorPage />} />
            <Route path="vendors/:id" element={<VendorDetailPage />} />
            <Route path="vendors/:id/edit" element={<EditVendorPage />} />
            
            {/* Product Routes */}
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/create" element={<CreateProductPage />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            
            {/* Habilitación Routes */}
            <Route path="habilitacion" element={<HabilitacionPage />} />
            
            {/* Certificate Routes */}
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="certificates/simulator" element={<CertificateSimulator />} />
            <Route path="certificates/config" element={<CertificateConfigPage />} />
            <Route path="certificates/:id" element={<CertificateDetailPage />} />
            
            {/* Report Routes */}
            <Route path="reports" element={<ReportsDashboardPage />} />
            <Route path="reports/tax/iva" element={<IvaReportPage />} />
            <Route path="reports/sales/period" element={<SalesByPeriodPage />} />
            <Route path="reports/documents/status" element={<DocumentStatusPage />} />
            
            {/* Settings */}
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Profile Routes */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Redirect root and all unmatched routes to login */}
          <Route path="/" element={<Navigate to="/auth/login" />} />
          
          {/* 404 Route - también redirige al login */}
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
