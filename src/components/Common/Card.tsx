import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg'; // ADDED 'none'
  backgroundColor?: string;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  backgroundColor = colors.background.card,
  shadow = 'md',
  style = {},
  onMouseEnter,
  onMouseLeave,
}) => {
  const paddingMap = {
    none: '0', // ADDED 'none'
    sm: spacing[3],
    md: spacing[5],
    lg: spacing[6],
  };

  const shadowMap = {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div
      style={{
        backgroundColor,
        borderRadius: '12px',
        padding: paddingMap[padding],
        boxShadow: shadowMap[shadow],
        border: `1px solid ${colors.border.light}`,
        ...style,
      }}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

export default Card;