import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Variables de tema */
  :root[data-theme="light"] {
    /* Paleta de colores */
    --color-primary: #3066BE;
    --color-secondary: #119DA4;
    --color-accent: #FF6B35;
    --color-accent-hover: #E55A29;
    --color-accent-active: #D04D1F;
    --color-background: #FFFFFF;
    --color-text: #000000;
    --color-error: #E63946;
    --color-warning: #FFD166;
    --color-success:rgb(6, 161, 120);
    --color-white: #FFFFFF;
    --color-gray-light: #E0E0E0;
    --color-gray: #9E9E9E;
    --color-gray-dark: #616161;
    
    /* Espaciado */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;
    
    /* Bordes */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 10px;
    --border-radius-xl: 16px;
    --border-radius-circle: 50%;
    
    /* Sombras */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    /* Tipografía */
    --font-family-heading: 'Poppins', sans-serif;
    --font-family-body: 'Inter', sans-serif;
    
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
    
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* Transiciones */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
    /* Glass variables */
    --glass-bg: #FFFFFF;
    --glass-border: #E0E0E0;
    /* Sidebar background in light mode */
    --sidebar-bg: #F0F4FF;
    /* Fondo degradado para transición suave */
    --background-gradient: linear-gradient(135deg, #FFFFFF, #F5F5F5);
  }
  
  :root[data-theme="dark"] {
    --color-primary: #3066BE;
    --color-secondary:rgb(2, 161, 161);
    /* Mantener mismo color de acento que el modo claro */
    --color-accent: #FF6B35;
    --color-accent-hover: #E55A29;
    --color-accent-active: #D04D1F;
    --color-background: #000000;
    --color-text: #FFFFFF;
    --color-error: #FF6B6B;
    --color-warning:rgb(253, 192, 36);
    --color-success: #6BE2A1;
    --color-white: #FFFFFF;
    --color-gray-light: rgba(255,255,255,0.1);
    --color-gray: #BBBBBB;
    --color-gray-dark: #888888;
    
    /* Espaciado */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;
    
    /* Bordes */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 10px;
    --border-radius-xl: 16px;
    --border-radius-circle: 50%;
    
    /* Sombras */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    /* Tipografía */
    --font-family-heading: 'Poppins', sans-serif;
    --font-family-body: 'Inter', sans-serif;
    
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
    
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* Transiciones */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
    /* Glass variables */
    --glass-bg: #000000;
    --glass-border: #333333;
    /* Sidebar background in dark mode */
    --sidebar-bg: var(--glass-bg);
    /* Fondo degradado para transición suave */
    --background-gradient: linear-gradient(135deg, #000000, #121212);
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    /* Transición suave en cambio de tema */
    transition: background var(--transition-normal), background-color var(--transition-normal), color var(--transition-normal), border-color var(--transition-normal);
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: var(--font-family-body);
    /* Fondo según tema: degradado animado */
    background: var(--background-gradient);
    color: var(--color-text);
    transition: background var(--transition-slow), color var(--transition-normal);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-family-heading);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-md);
  }
  
  h1 {
    font-size: var(--font-size-xxl);
  }
  
  h2 {
    font-size: var(--font-size-xl);
  }
  
  h3 {
    font-size: var(--font-size-lg);
  }
  
  p {
    margin-bottom: var(--spacing-md);
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--color-secondary);
    }
  }
  
  button {
    cursor: pointer;
  }
  
  ul, ol {
    list-style-position: inside;
    margin-bottom: var(--spacing-md);
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Clases de utilidad */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  .text-primary {
    color: var(--color-primary);
  }
  
  .text-secondary {
    color: var(--color-secondary);
  }
  
  .text-accent {
    color: var(--color-accent);
  }
  
  .text-success {
    color: var(--color-success);
  }
  
  .text-error {
    color: var(--color-error);
  }
  
  .text-warning {
    color: var(--color-warning);
  }
  
  .mb-0 {
    margin-bottom: 0;
  }
  
  .mb-sm {
    margin-bottom: var(--spacing-sm);
  }
  
  .mb-md {
    margin-bottom: var(--spacing-md);
  }
  
  .mb-lg {
    margin-bottom: var(--spacing-lg);
  }
  
  .mt-0 {
    margin-top: 0;
  }
  
  .mt-sm {
    margin-top: var(--spacing-sm);
  }
  
  .mt-md {
    margin-top: var(--spacing-md);
  }
  
  .mt-lg {
    margin-top: var(--spacing-lg);
  }
`;

export default GlobalStyles;
