import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showLabel?: boolean;
}

const baseStyles = `
  w-full
  px-comfortable py-snug
  rounded-comfortable
  border border-border
  bg-surface
  text-ink
  placeholder:text-ink-whisper
  transition-all duration-fast ease-out
  focus:outline-none focus:ring-2 focus:ring-action focus:border-action
  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-canvas
`;

const errorStyles = `
  border-danger-500
  focus:ring-danger-500 focus:border-danger-500
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      showLabel = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block mb-tight font-medium text-body-sm text-ink',
              !showLabel && 'sr-only'
            )}
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            baseStyles,
            error && errorStyles,
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-tight text-body-sm text-ink-muted"
          >
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-tight text-body-sm text-danger-600 flex items-center gap-tight"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';