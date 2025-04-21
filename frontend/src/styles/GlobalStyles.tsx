import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Modo claro (por defecto) */
    /* Colors */
    --color-primary: #0066cc;
    --color-primary-light: #4d94ff;
    --color-primary-dark: #004c99;
    
    --color-secondary: #6c757d;
    --color-secondary-light: #868e96;
    --color-secondary-dark: #495057;
    
    --color-accent: #ff9800;
    --color-accent-light: #ffb74d;
    --color-accent-dark: #f57c00;
    
    --color-success: #28a745;
    --color-warning: #ffc107;
    --color-error: #dc3545;
    --color-info: #17a2b8;
    
    --color-text: #212529;
    --color-text-light: #6c757d;
    --color-text-inverse: #ffffff;
    
    --color-background: #f8f9fa;
    --color-white: #ffffff;
    --color-black: #000000;
    
    --color-gray-lightest: #f8f9fa;
    --color-gray-light: #e9ecef;
    --color-gray: #dee2e6;
    --color-gray-dark: #6c757d;
    --color-gray-darkest: #343a40;
    
    --color-border: #dee2e6;
    
    /* Typography */
    --font-family-base: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    --font-family-heading: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    --font-family-monospace: 'Roboto Mono', source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    
    --font-size-xs: 0.75rem;   /* 12px */
    --font-size-sm: 0.875rem;  /* 14px */
    --font-size-md: 1rem;      /* 16px */
    --font-size-lg: 1.25rem;   /* 20px */
    --font-size-xl: 1.5rem;    /* 24px */
    --font-size-xxl: 2rem;     /* 32px */
    
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 700;
    
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-loose: 1.75;
    
    /* Spacing */
    --spacing-xs: 0.25rem;   /* 4px */
    --spacing-sm: 0.5rem;    /* 8px */
    --spacing-md: 1rem;      /* 16px */
    --spacing-lg: 1.5rem;    /* 24px */
    --spacing-xl: 2rem;      /* 32px */
    --spacing-xxl: 3rem;     /* 48px */
    
    /* Borders */
    --border-radius-sm: 0.25rem;   /* 4px */
    --border-radius-md: 0.5rem;    /* 8px */
    --border-radius-lg: 0.75rem;   /* 12px */
    --border-radius-circle: 50%;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    --shadow-md: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05);
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
    
    /* Z-index */
    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;
  }

  /* Variables para el modo oscuro */
  [data-theme='dark'] {
    /* Colors */
    --color-primary: #4d94ff;
    --color-primary-light: #66a3ff;
    --color-primary-dark: #0066cc;
    
    --color-secondary: #868e96;
    --color-secondary-light: #adb5bd;
    --color-secondary-dark: #495057;
    
    --color-accent: #ffb74d;
    --color-accent-light: #ffc980;
    --color-accent-dark: #f57c00;
    
    --color-success: #48c774;
    --color-warning: #ffdd57;
    --color-error: #f14668;
    --color-info: #3298dc;
    
    --color-text: #e9ecef;
    --color-text-light: #adb5bd;
    --color-text-inverse: #212529;
    
    --color-background: #121212;
    --color-white: #1e1e1e;
    --color-black: #f8f9fa;
    
    --color-gray-lightest: #343a40;
    --color-gray-light: #495057;
    --color-gray: #6c757d;
    --color-gray-dark: #adb5bd;
    --color-gray-darkest: #dee2e6;
    
    --color-border: #495057;
    
    /* Shadows para modo oscuro */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.6);
    --shadow-md: 0 3px 6px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.6), 0 3px 6px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 15px 25px rgba(0, 0, 0, 0.6), 0 5px 10px rgba(0, 0, 0, 0.5);
  }
  
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family-base);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-text);
    background-color: var(--color-background);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-family: var(--font-family-heading);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--color-text);
  }
  
  p {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    
    &:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
  }
  
  button, input, optgroup, select, textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }
  
  button, input {
    overflow: visible;
  }
  
  button, select {
    text-transform: none;
  }
  
  button, [type="button"], [type="reset"], [type="submit"] {
    -webkit-appearance: button;
  }
  
  button::-moz-focus-inner, [type="button"]::-moz-focus-inner, [type="reset"]::-moz-focus-inner, [type="submit"]::-moz-focus-inner {
    border-style: none;
    padding: 0;
  }
  
  button:-moz-focusring, [type="button"]:-moz-focusring, [type="reset"]:-moz-focusring, [type="submit"]:-moz-focusring {
    outline: 1px dotted ButtonText;
  }
  
  fieldset {
    padding: 0.35em 0.75em 0.625em;
  }
  
  legend {
    box-sizing: border-box;
    color: inherit;
    display: table;
    max-width: 100%;
    padding: 0;
    white-space: normal;
  }
  
  progress {
    vertical-align: baseline;
  }
  
  textarea {
    overflow: auto;
  }
  
  [type="checkbox"], [type="radio"] {
    box-sizing: border-box;
    padding: 0;
  }
  
  [type="number"]::-webkit-inner-spin-button, [type="number"]::-webkit-outer-spin-button {
    height: auto;
  }
  
  [type="search"] {
    -webkit-appearance: textfield;
    outline-offset: -2px;
  }
  
  [type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  
  ::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit;
  }
  
  /* Utility classes */
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  .text-left {
    text-align: left;
  }
  
  .hidden {
    display: none !important;
  }
  
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  /* Clase para el botón de cambio de tema */
  .theme-toggle {
    cursor: pointer;
    background: none;
    border: none;
    color: var(--color-text);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-circle);
    transition: background-color var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .theme-toggle:hover {
    background-color: var(--color-gray-light);
  }
`;

export default GlobalStyles;
