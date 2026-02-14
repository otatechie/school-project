import { Link } from '@inertiajs/react';
import { ChevronDown, Mail, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { create as memosCreate } from '@/routes/memos';
import { create as paymentVouchersCreate } from '@/routes/payment-vouchers';

export default function QuickActions({
    className = '',
}: {
    className?: string;
}) {
    return (
        <div className={cn('', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        className="h-9 cursor-pointer gap-2"
                    >
                        <span>Quick Actions</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={paymentVouchersCreate().url} prefetch className="cursor-pointer">
                            <Receipt className="mr-2 h-4 w-4" />
                            <span>Create voucher</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={memosCreate().url} prefetch className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Create memo</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
