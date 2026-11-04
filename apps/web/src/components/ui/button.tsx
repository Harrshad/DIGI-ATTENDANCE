import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm',
      secondary:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-brand-500 shadow-sm',
      outline:
        'bg-transparent border border-brand-600 text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      ghost:
        'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs h-8',
      md: 'px-4 py-2 text-sm h-9',
      lg: 'px-5 py-2.5 text-base h-11',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
