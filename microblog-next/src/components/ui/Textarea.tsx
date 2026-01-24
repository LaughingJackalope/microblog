'use client';

import { TextareaHTMLAttributes, forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showLabel?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  autoGrow?: boolean;
  minRows?: number;
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
  resize-none
`;

const errorStyles = `
  border-danger-500
  focus:ring-danger-500 focus:border-danger-500
`;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showLabel = true,
      maxLength,
      showCharCount = !!maxLength,
      autoGrow = true,
      minRows = 3,
      className,
      id,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const [charCount, setCharCount] = useState(0);

    // Auto-grow functionality
    useEffect(() => {
      if (!autoGrow) return;

      const textarea = internalRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate minimum height based on minRows
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;

      // Set new height
      textarea.style.height = `${Math.max(minHeight, textarea.scrollHeight)}px`;
    }, [value, autoGrow, minRows]);

    // Character count
    useEffect(() => {
      const currentValue = value?.toString() || '';
      setCharCount(currentValue.length);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    const isNearLimit = maxLength && charCount > maxLength * 0.9;
    const isOverLimit = maxLength && charCount > maxLength;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-tight">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'block font-medium text-body-sm text-ink',
                !showLabel && 'sr-only'
              )}
            >
              {label}
            </label>
          )}

          {showCharCount && maxLength && (
            <span
              className={cn(
                'text-caption transition-colors duration-fast',
                isOverLimit && 'text-danger-600 font-semibold',
                isNearLimit && !isOverLimit && 'text-warning-600',
                !isNearLimit && 'text-ink-whisper'
              )}
              aria-live="polite"
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          id={inputId}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          rows={minRows}
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

Textarea.displayName = 'Textarea';