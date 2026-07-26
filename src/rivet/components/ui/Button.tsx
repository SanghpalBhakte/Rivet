import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'overdue';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantClass = `rv-btn--${variant}`;
  const sizeClass = size === 'sm' ? 'rv-btn--sm' : '';

  return (
    <button
      className={`rv-btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
