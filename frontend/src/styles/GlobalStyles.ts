import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Paleta de colores */
    --color-primary: #3066BE;
    --color-secondary: #119DA4;
    --color-accent: #FF6B35;
    --color-background: #F5F5F5;
    --color-text: #333333;
    --color-error: #E63946;
    --color-warning: #FFD166;
    --color-success: #06D6A0;
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
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: var(--font-family-body);
    background-color: var(--color-background);
    color: var(--color-text);
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
