import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { XCircle, Edit, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import paymentVouchers from '@/routes/payment-vouchers';
import type { Paginated } from '@/types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment vouchers',
        href: paymentVouchers.index().url,
    },
    {
        title: 'Returned',
        href: '#',
    },
];

type Voucher = {
    id: string;
    voucher_number: string;
    voucher_date: string;
    payee_name: string;
    amount: string | number;
    department?: { id: string; name: string } | null;
    rejector?: { id: string; name: string } | null;
    rejected_at?: string | null;
    rejection_reason?: string | null;
};

export default function Rejected({
    vouchers,
}: {
    vouchers: Paginated<Voucher>;
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const items: Voucher[] = Array.isArray(vouchers)
        ? vouchers
        : (vouchers.data ?? []);
    const page = Array.isArray(vouchers) ? null : vouchers;

    const filteredVouchers = items.filter(
        (voucher) =>
            voucher.voucher_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            voucher.payee_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    const formatAmount = (amount: string | number): string =>
        (typeof amount === 'string'
            ? parseFloat(amount)
            : amount
        ).toLocaleString(undefined, { minimumFractionDigits: 2 });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Returned for correction" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Returned for correction
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Vouchers sent back to the preparer. Each can be
                            corrected and submitted again.
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <CardDescription>
                            {filteredVouchers.length} voucher
                            {filteredVouchers.length !== 1 ? 's' : ''}
                            {searchQuery ? ` matching "${searchQuery}"` : ''}
                        </CardDescription>
                        {/* Search and Filter Section */}
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by voucher number or payee name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {filteredVouchers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <XCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery
                                        ? 'No rejected vouchers found'
                                        : 'No rejected vouchers'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery
                                        ? `No rejected vouchers match "${searchQuery}".`
                                        : 'All vouchers are in good standing.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredVouchers.map((voucher) => (
                                    <Card
                                        key={voucher.id}
                                        className="border-red-200 transition-shadow hover:shadow-md dark:border-red-900"
                                    >
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-black dark:text-white">
                                                                {
                                                                    voucher.voucher_number
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-black dark:text-white">
                                                            {voucher.payee_name}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                            <span>
                                                                Amount: GHS{' '}
                                                                {formatAmount(
                                                                    voucher.amount,
                                                                )}
                                                            </span>
                                                            <span>
                                                                Department:{' '}
                                                                {voucher
                                                                    .department
                                                                    ?.name ??
                                                                    '—'}
                                                            </span>
                                                            <span>
                                                                Returned by:{' '}
                                                                {voucher
                                                                    .rejector
                                                                    ?.name ??
                                                                    'Unknown'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    paymentVouchers.edit(
                                                                        {
                                                                            voucher:
                                                                                voucher.id,
                                                                        },
                                                                    ).url
                                                                }
                                                                className="gap-2"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span>
                                                                    Edit
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-red-50 px-3 py-2.5 dark:bg-red-950/20">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                                        <div className="flex-1">
                                                            <p className="text-sm text-red-900 dark:text-red-200">
                                                                {voucher.rejection_reason || (
                                                                    <span className="italic opacity-80">
                                                                        No
                                                                        reason
                                                                        was
                                                                        recorded.
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
