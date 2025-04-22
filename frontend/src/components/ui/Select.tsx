import React, { SelectHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const SelectContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

const SelectLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select<{ hasError?: boolean; hasLeftIcon?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  padding-right: 32px; /* Space for the dropdown icon */
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-md);
  background-color: var(--color-white);
  transition: all var(--transition-fast);
  appearance: none; /* Remove default arrow */
  
  ${props => props.hasLeftIcon && css`
    padding-left: 40px;
  `}
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(48, 102, 190, 0.1);
  }
  
  &:disabled {
    background-color: var(--color-gray-light);
    cursor: not-allowed;
  }
  
  /* Dark mode overrides */
  html[data-theme='dark'] & {
    background-color: var(--color-gray-light);
    border-color: var(--color-border);
    color: var(--color-text);
    &::placeholder { color: var(--color-text-light); }
    /* Opciones en dropdown también en tema oscuro */
    option {
      background-color: var(--color-background);
      color: var(--color-text);
    }
  }
  
  ${props => props.hasError && css`
    border-color: var(--color-error);
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
    }
  `}
`;

const IconContainer = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray);
  pointer-events: none;
  
  ${props => props.position === 'left' && css`
    left: 12px;
  `}
  
  ${props => props.position === 'right' && css`
    right: 12px;
  `}
`;

const HelperText = styled.p<{ isError?: boolean }>`
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
  margin-bottom: 0;
  
  ${props => props.isError ? css`
    color: var(--color-error);
  ` : css`
    color: var(--color-gray-dark);
  `}
`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth, leftIcon, children, ...props }, ref) => {
    return (
      <SelectContainer fullWidth={fullWidth}>
        {label && <SelectLabel>{label}</SelectLabel>}
        <SelectWrapper>
          {leftIcon && <IconContainer position="left">{leftIcon}</IconContainer>}
          <StyledSelect
            ref={ref}
            hasError={!!error}
            hasLeftIcon={!!leftIcon}
            {...props}
          >
            {children}
          </StyledSelect>
          <IconContainer position="right">
            <FaChevronDown size={12} />
          </IconContainer>
        </SelectWrapper>
        {(error || helperText) && (
          <HelperText isError={!!error}>{error || helperText}</HelperText>
        )}
      </SelectContainer>
    );
  }
);

Select.displayName = 'Select';

export default Select;
