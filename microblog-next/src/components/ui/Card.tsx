import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'elevated' | 'outlined' | 'flat';
type CardPadding = 'none' | 'snug' | 'comfortable' | 'relaxed' | 'spacious';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  elevated: `
    bg-surface
    shadow-soft
    border border-border
  `,
  outlined: `
    bg-transparent
    border border-border
  `,
  flat: `
    bg-surface
    border-none
  `,
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  snug: 'p-snug',
  comfortable: 'p-comfortable',
  relaxed: 'p-relaxed',
  spacious: 'p-spacious',
};

const baseStyles = `
  rounded-comfortable
  transition-all duration-base ease-out
`;

const interactiveStyles = `
  cursor-pointer
  hover:shadow-medium
  active:scale-[0.98]
`;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      padding = 'relaxed',
      interactive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          interactive && interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Panel - No border, just background with padding
interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      padding = 'relaxed',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface rounded-comfortable',
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Panel.displayName = 'Panel';

// Section - Card with header and optional footer
interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: CardPadding;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      title,
      description,
      action,
      footer,
      padding = 'relaxed',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'bg-surface rounded-comfortable shadow-soft border border-border',
          className
        )}
        {...props}
      >
        {(title || description || action) && (
          <header className={cn('border-b border-border', paddingStyles[padding])}>
            <div className="flex items-start justify-between gap-comfortable">
              <div className="flex-1">
                {title && (
                  <h2 className="text-h4 font-bold text-ink">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-tight text-body-sm text-ink-muted">
                    {description}
                  </p>
                )}
              </div>
              {action && (
                <div className="flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
          </header>
        )}

        <div className={paddingStyles[padding]}>
          {children}
        </div>

        {footer && (
          <footer className={cn('border-t border-border bg-canvas', paddingStyles[padding])}>
            {footer}
          </footer>
        )}
      </section>
    );
  }
);

Section.displayName = 'Section';