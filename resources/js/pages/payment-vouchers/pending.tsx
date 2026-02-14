import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Clock,
    Eye,
    CheckCircle2,
    XCircle,
    Search,
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
        title: 'Pending Approval',
        href: '#',
    },
];

const mockPendingVouchers = [
    {
        id: '1',
        voucher_number: 'PV-2024-002',
        voucher_date: '2024-01-16',
        payee_name: 'XYZ Services',
        amount: 45000.0,
        department: 'Procurement',
        submitted_at: '2024-01-16T10:30:00',
        days_pending: 2,
        approval_level: 1,
    },
    {
        id: '2',
        voucher_number: 'PV-2024-006',
        voucher_date: '2024-01-20',
        payee_name: 'Contractor ABC',
        amount: 125000.0,
        department: 'Finance',
        submitted_at: '2024-01-20T14:15:00',
        days_pending: 5,
        approval_level: 2,
    },
    {
        id: '3',
        voucher_number: 'PV-2024-007',
        voucher_date: '2024-01-21',
        payee_name: 'Service Provider Ltd',
        amount: 78000.0,
        department: 'IT',
        submitted_at: '2024-01-21T09:00:00',
        days_pending: 1,
        approval_level: 1,
    },
];

export default function Pending() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVouchers = mockPendingVouchers.filter(
        (voucher) =>
            voucher.voucher_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            voucher.payee_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const urgentCount = mockPendingVouchers.filter(
        (v) => v.days_pending >= 3
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Approval" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Pending Approval
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Payment vouchers awaiting your approval
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Pending
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockPendingVouchers.length}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Urgent (3+ days)
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {urgentCount}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Amount
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-black dark:text-white">
                                            GHS{' '}
                                            {mockPendingVouchers
                                                .reduce((sum, v) => sum + v.amount, 0)
                                                .toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vouchers Pending Approval</CardTitle>
                        <CardDescription>
                            {filteredVouchers.length} voucher
                            {filteredVouchers.length !== 1 ? 's' : ''} requiring
                            approval
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
                                <CheckCircle2 className="mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    No pending vouchers
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    All vouchers have been processed.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredVouchers.map((voucher) => (
                                    <Card
                                        key={voucher.id}
                                        className="transition-shadow hover:shadow-md"
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-black dark:text-white">
                                                            {voucher.voucher_number}
                                                        </span>
                                                        {voucher.days_pending >= 3 && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="text-sm"
                                                            >
                                                                Urgent
                                                            </Badge>
                                                        )}
                                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                            Level{' '}
                                                            {voucher.approval_level}
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
                                                            Pending:{' '}
                                                            {voucher.days_pending}{' '}
                                                            day
                                                            {voucher.days_pending !==
                                                            1
                                                                ? 's'
                                                                : ''}
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
                                                            href={`/payment-vouchers/${voucher.id}/approve`}
                                                            className="gap-2"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            <span>Approve</span>
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/payment-vouchers/${voucher.id}/reject`}
                                                            className="gap-2"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span>Reject</span>
                                                        </Link>
                                                    </Button>
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
