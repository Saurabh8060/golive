import * as React from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out rounded-md font-semibold',
  {
    variants: {
      variant: {
        icon: 'p-2 rounded-full hover:bg-slate-200',
        primary: 'bg-golivehub-purple text-white hover:bg-golivehub-purple/90',
        secondary: 'bg-slate-200 text-black hover:bg-slate-300',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'text-sm px-2 py-1 leading-tight',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
