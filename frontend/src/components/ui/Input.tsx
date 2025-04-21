import React, { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';

export interface InputBaseProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  type?: string;
}

export interface InputProps extends InputBaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: string;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

const InputLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const inputStyles = css<{ hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--border-radius-md);
  background-color: var(--color-white);
  transition: all var(--transition-fast);
  
  ${props => props.hasLeftIcon && css`
    padding-left: 40px;
  `}
  
  ${props => props.hasRightIcon && css`
    padding-right: 40px;
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

const StyledInput = styled.input<{ hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`${inputStyles}`;
const StyledSelect = styled.select<{ hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`${inputStyles}`;

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({ label, error, helperText, fullWidth, leftIcon, rightIcon, children, type, ...props }, ref) => {
    const isSelect = type === 'select';
    
    return (
      <InputContainer fullWidth={fullWidth}>
        {label && <InputLabel>{label}</InputLabel>}
        <InputWrapper>
          {leftIcon && <IconContainer position="left">{leftIcon}</IconContainer>}
          
          {isSelect ? (
            <StyledSelect
              ref={ref as React.Ref<HTMLSelectElement>}
              hasError={!!error}
              hasLeftIcon={!!leftIcon}
              hasRightIcon={!!rightIcon}
            >
              {children}
            </StyledSelect>
          ) : (
            <StyledInput
              ref={ref as React.Ref<HTMLInputElement>}
              hasError={!!error}
              hasLeftIcon={!!leftIcon}
              hasRightIcon={!!rightIcon}
              type={type}
              {...props}
            />
          )}
          
          {rightIcon && <IconContainer position="right">{rightIcon}</IconContainer>}
        </InputWrapper>
        {(error || helperText) && (
          <HelperText isError={!!error}>{error || helperText}</HelperText>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;
