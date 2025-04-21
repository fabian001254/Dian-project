import React from 'react';
import styled from 'styled-components';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const ToggleButton = styled.button`
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
  
  &:hover {
    background-color: var(--color-gray-light);
  }
`;

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <ToggleButton 
      onClick={toggleTheme} 
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
    </ToggleButton>
  );
};

export default ThemeToggle;
