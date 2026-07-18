import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export const Eyebrow = ({ className, ...props }: ComponentProps<'span'>) => (
    <span
        className={cn(
            'font-mono text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground uppercase',
            className,
        )}
        {...props}
    />
);
