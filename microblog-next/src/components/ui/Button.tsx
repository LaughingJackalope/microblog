import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-action hover:bg-action-hover active:bg-primary-800
    text-surface
    shadow-medium hover:shadow-lifted
    border border-transparent
  `,
  secondary: `
    bg-surface hover:bg-action-muted active:bg-primary-100
    text-ink border border-border
    shadow-soft hover:shadow-medium
  `,
  danger: `
    bg-danger-500 hover:bg-danger-600 active:bg-danger-700
    text-surface
    shadow-medium hover:shadow-lifted
    border border-transparent
  `,
  ghost: `
    bg-transparent hover:bg-action-muted active:bg-primary-100
    text-ink-muted hover:text-ink
    border border-transparent
  `,
  accent: `
    bg-highlight hover:bg-highlight-hover active:bg-accent-700
    text-ink
    shadow-medium hover:shadow-lifted
    border border-transparent
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-snug py-tight text-body-sm rounded-tight',
  md: 'px-comfortable py-snug text-body rounded-comfortable',
  lg: 'px-relaxed py-comfortable text-body-lg rounded-comfortable',
};

const baseStyles = `
  inline-flex items-center justify-center
  font-semibold
  transition-all duration-fast ease-out
  focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
  select-none
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';