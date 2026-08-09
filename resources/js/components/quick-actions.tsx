import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Mail, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { create as memosCreate } from '@/routes/memos';
import { create as paymentVouchersCreate } from '@/routes/payment-vouchers';
import type { SharedData } from '@/types';

/**
 * Shortcuts to the records a person is allowed to raise.
 *
 * Gated on the same permissions the controllers enforce: an approver or a
 * viewer cannot create a voucher, so offering them the option would only
 * produce a 403.
 */
export default function QuickActions({
    className = '',
}: {
    className?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    const actions = [
        {
            allowed: auth.can?.createVoucher,
            href: paymentVouchersCreate().url,
            icon: Receipt,
            label: 'New payment voucher',
        },
        {
            allowed: auth.can?.createMemo,
            href: memosCreate().url,
            icon: Mail,
            label: 'New memo',
        },
    ].filter((action) => action.allowed);

    if (actions.length === 0) return null;

    return (
        <div className={cn('', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="h-9 gap-2">
                        <span>New</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {actions.map((action) => (
                        <DropdownMenuItem key={action.href} asChild>
                            <Link
                                href={action.href}
                                prefetch
                                className="cursor-pointer"
                            >
                                <action.icon className="mr-2 h-4 w-4" />
                                <span>{action.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
