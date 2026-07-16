import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export const Main = ({ className, ...props }: ComponentProps<'main'>) => {
    return (
        <main
            className={cn(
                'flex min-h-screen items-center justify-center p-4',
                className,
            )}
            {...props}
        />
    );
};
