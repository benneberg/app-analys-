import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils';

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 uppercase tracking-wide',
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
