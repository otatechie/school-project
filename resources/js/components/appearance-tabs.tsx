import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const options: { value: Appearance; icon: typeof Sun; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const currentOption = options.find((opt) => opt.value === appearance);
    const CurrentIcon = currentOption?.icon || Monitor;

    return (
        <div className={cn('', className)} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 cursor-pointer"
                    >
                        <CurrentIcon className="h-4 w-4" />
                        <span className="sr-only">Appearance</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                        value={appearance}
                        onValueChange={(value) =>
                            updateAppearance(value as Appearance)
                        }
                    >
                        {options.map(({ value, icon: Icon, label }) => (
                            <DropdownMenuRadioItem
                                key={value}
                                value={value}
                                className="cursor-pointer"
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
