import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const ButtonStyled = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-normal);
  border: none;
  cursor: pointer;
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  /* Size variants */
  ${props => props.size === 'small' && css`
    padding: 6px 12px;
    font-size: var(--font-size-xs);
  `}
  
  ${props => props.size === 'medium' || !props.size ? css`
    padding: 10px 16px;
    font-size: var(--font-size-sm);
  ` : ''}
  
  ${props => props.size === 'large' && css`
    padding: 12px 24px;
    font-size: var(--font-size-md);
  `}
  
  /* Color variants */
  ${props => props.variant === 'primary' || !props.variant ? css`
    background-color: var(--color-primary);
    color: var(--color-white);
    
    &:hover, &:focus {
      background-color: #2857a4;
      box-shadow: var(--shadow-md);
    }
    
    &:active {
      background-color: #1f4c8f;
    }
  ` : ''}
  
  ${props => props.variant === 'secondary' && css`
    background-color: var(--color-secondary);
    color: var(--color-white);
    
    &:hover, &:focus {
      background-color: #0e8a8f;
      box-shadow: var(--shadow-md);
    }
    
    &:active {
      background-color: #0b7a7f;
    }
  `}
  
  ${props => props.variant === 'accent' && css`
    background-color: var(--color-accent);
    color: var(--color-white);
    
    &:hover, &:focus {
      background-color: var(--color-accent-hover);
      box-shadow: var(--shadow-md);
    }
    
    &:active {
      background-color: var(--color-accent-active);
    }
  `}
  
  ${props => props.variant === 'outline' && css`
    background-color: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    
    &:hover, &:focus {
      background-color: rgba(48, 102, 190, 0.05);
      box-shadow: var(--shadow-sm);
    }
    
    &:active {
      background-color: rgba(48, 102, 190, 0.1);
    }
  `}
  
  ${props => props.variant === 'text' && css`
    background-color: transparent;
    color: var(--color-primary);
    padding-left: 8px;
    padding-right: 8px;
    
    &:hover, &:focus {
      background-color: rgba(48, 102, 190, 0.05);
    }
    
    &:active {
      background-color: rgba(48, 102, 190, 0.1);
    }
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  /* Loading state */
  ${props => props.isLoading && css`
    position: relative;
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-top: -8px;
      margin-left: -8px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--color-white);
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  ...props
}) => {
  return (
    <ButtonStyled
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      isLoading={isLoading}
      {...props}
    >
      {children}
    </ButtonStyled>
  );
};

export default Button;
