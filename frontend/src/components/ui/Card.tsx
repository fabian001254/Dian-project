import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  elevation?: 'low' | 'medium' | 'high';
  padding?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  className?: string;
}

const CardContainer = styled.div<Omit<CardProps, 'children' | 'title' | 'subtitle'>>`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  
  ${props => props.bordered && css`
    border: 1px solid var(--color-gray-light);
  `}
  
  ${props => {
    switch (props.elevation) {
      case 'low':
        return css`box-shadow: var(--shadow-sm);`;
      case 'high':
        return css`box-shadow: var(--shadow-lg);`;
      case 'medium':
      default:
        return css`box-shadow: var(--shadow-md);`;
    }
  }}
  
  ${props => {
    switch (props.padding) {
      case 'small':
        return css`padding: var(--spacing-md);`;
      case 'large':
        return css`padding: var(--spacing-xl);`;
      case 'medium':
      default:
        return css`padding: var(--spacing-lg);`;
    }
  }}
`;

const CardHeader = styled.div`
  margin-bottom: var(--spacing-md);
`;

const CardTitle = styled.h3`
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
`;

const CardSubtitle = styled.p`
  color: var(--color-gray-dark);
  font-size: var(--font-size-sm);
  margin-bottom: 0;
`;

const CardContent = styled.div``;

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  elevation = 'medium',
  padding = 'medium',
  bordered = false,
  className,
}) => {
  return (
    <CardContainer 
      elevation={elevation} 
      padding={padding} 
      bordered={bordered}
      className={className}
    >
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </CardContainer>
  );
};

export default Card;
