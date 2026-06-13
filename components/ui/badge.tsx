import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors',
  {
    variants: {
      variant: {
        default: 'border-white/[0.08] bg-white/[0.04] text-zinc-300',
        accent: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
        success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
        warning: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
        destructive: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
        muted: 'border-white/[0.06] bg-white/[0.02] text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
