'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'gold' | 'navy';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#c9a44c] hover:bg-[#b8933b] text-[#0f1e3a] font-semibold shadow-xs focus:ring-[#c9a44c] border border-transparent',
    gold:
      'bg-[#c9a44c] hover:bg-[#b8933b] text-[#0f1e3a] font-semibold shadow-xs focus:ring-[#c9a44c] border border-transparent',
    navy:
      'bg-[#1f5e8c] hover:bg-[#184d73] text-white font-medium shadow-xs focus:ring-[#1f5e8c] border border-transparent',
    secondary:
      'bg-[#eef2f6] hover:bg-[#e2e8f0] text-[#0f1e3a] font-medium focus:ring-[#9fb3c8] border border-[#bcccdc]',
    outline:
      'bg-transparent hover:bg-[#f8fafc] text-[#0f1e3a] border border-[#243b53] focus:ring-[#1f5e8c]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 border border-transparent',
    ghost:
      'bg-transparent hover:bg-[#eef2f6] text-[#334e68] hover:text-[#0f1e3a] focus:ring-[#9fb3c8]',
    success:
      'bg-[#1f5e8c] hover:bg-[#184d73] text-white shadow-xs focus:ring-[#1f5e8c] border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}

export default Button;
