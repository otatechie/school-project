import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    XCircle,
    Eye,
    Edit,
    Search,
    AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Vouchers',
        href: '/payment-vouchers',
    },
    {
        title: 'Rejected',
        href: '#',
    },
];

const mockRejectedVouchers = [
    {
        id: '1',
        voucher_number: 'PV-2024-004',
        voucher_date: '2024-01-18',
        payee_name: 'Office Supplies Co',
        amount: 15000.0,
        department: 'Admin',
        rejected_at: '2024-01-19T10:00:00',
        rejection_reason:
            'Missing supporting documents. Please attach invoice and delivery note.',
        rejected_by: 'John Doe',
    },
    {
        id: '2',
        voucher_number: 'PV-2024-008',
        voucher_date: '2024-01-22',
        payee_name: 'Service Provider XYZ',
        amount: 95000.0,
        department: 'Procurement',
        rejected_at: '2024-01-22T15:30:00',
        rejection_reason:
            'Amount exceeds budget limit. Requires additional approval.',
        rejected_by: 'Jane Smith',
    },
];

export default function Rejected() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVouchers = mockRejectedVouchers.filter(
        (voucher) =>
            voucher.voucher_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            voucher.payee_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rejected Vouchers" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Rejected Vouchers
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Payment vouchers that have been rejected and require
                            correction
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total Rejected
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                        {mockRejectedVouchers.length}
                                    </p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rejected Payment Vouchers</CardTitle>
                        <CardDescription>
                            {filteredVouchers.length} rejected voucher
                            {filteredVouchers.length !== 1 ? 's' : ''} found
                            {searchQuery &&
                                ` matching "${searchQuery}"`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search and Filter Section */}
                        <div className="mb-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by voucher number or payee name..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Separator className="mb-6" />

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
                                        className="border-red-200 dark:border-red-900 transition-shadow hover:shadow-md"
                                    >
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-black dark:text-white">
                                                                {voucher.voucher_number}
                                                            </span>
                                                            <Badge
                                                                variant="destructive"
                                                            >
                                                                Rejected
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm font-medium text-black dark:text-white">
                                                            {voucher.payee_name}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                            <span>
                                                                Amount: GHS{' '}
                                                                {voucher.amount.toLocaleString(
                                                                    undefined,
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                    }
                                                                )}
                                                            </span>
                                                            <span>
                                                                Department:{' '}
                                                                {voucher.department}
                                                            </span>
                                                            <span>
                                                                Rejected by:{' '}
                                                                {voucher.rejected_by}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/payment-vouchers/${voucher.id}`}
                                                                className="gap-2"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                <span>View</span>
                                                            </Link>
                                                        </Button>
                                                        <Button size="sm" asChild>
                                                            <Link
                                                                href={`/payment-vouchers/${voucher.id}/edit`}
                                                                className="gap-2"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span>Edit</span>
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/20">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                                                Rejection Reason
                                                            </p>
                                                            <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                                                                {
                                                                    voucher.rejection_reason
                                                                }
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
