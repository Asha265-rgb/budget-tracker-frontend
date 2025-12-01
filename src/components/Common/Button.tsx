import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '12px',
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
  };

  const sizeStyles = {
    sm: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
    },
    md: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.text.white,
      border: `1px solid ${colors.primary[500]}`,
    },
    secondary: {
      backgroundColor: colors.background.secondary,
      color: colors.text.primary,
      border: `1px solid ${colors.border.medium}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[500],
      border: `1px solid ${colors.primary[500]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      border: '1px solid transparent',
    },
  };

  const hoverStyles = {
    primary: {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
    },
    secondary: {
      backgroundColor: colors.gray[100],
    },
    outline: {
      backgroundColor: colors.primary[50],
    },
    ghost: {
      backgroundColor: colors.gray[100],
    },
  };

  return (
    <button
      type={type}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      onClick={disabled ? undefined : onClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;