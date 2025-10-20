import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-semibold ring-offset-background transition-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-wide border-brutal',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-brutal',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-brutal',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-brutal',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-brutal',
        outline: 'border-brutal bg-background hover:bg-muted text-foreground',
        ghost: 'hover:bg-muted border-transparent text-foreground',
      },
      size: {
        default: 'h-12 px-6 py-3 text-base',
        sm: 'h-10 px-4 py-2 text-sm',
        lg: 'h-14 px-8 py-4 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
