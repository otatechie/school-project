import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentProps<'div'> {
    value: number;
    max?: number;
}

function Progress({ className, value, max = 100, ...props }: ProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div
            data-slot="progress"
            className={cn(
                'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
                className
            )}
            {...props}
        >
            <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

export { Progress };
