import { Head, Link } from '@inertiajs/react';
import {
    Receipt,
    Edit,
    Plus,
    Search,
    Eye,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
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
import paymentVouchers from '@/routes/payment-vouchers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Vouchers',
        href: paymentVouchers.index().url,
    },
];

const mockVouchers = [
    {
        id: '1',
        voucher_number: 'PV-2024-001',
        voucher_date: '2024-01-15',
        payee_name: 'ABC Suppliers Ltd',
        amount: 125000.0,
        status: 'approved',
        department: 'Finance',
        payment_method: 'cheque',
    },
    {
        id: '2',
        voucher_number: 'PV-2024-002',
        voucher_date: '2024-01-16',
        payee_name: 'XYZ Services',
        amount: 45000.0,
        status: 'pending',
        department: 'Procurement',
        payment_method: 'bank_transfer',
    },
    {
        id: '3',
        voucher_number: 'PV-2024-003',
        voucher_date: '2024-01-17',
        payee_name: 'Tech Solutions Inc',
        amount: 89000.0,
        status: 'draft',
        department: 'IT',
        payment_method: 'cheque',
    },
    {
        id: '4',
        voucher_number: 'PV-2024-004',
        voucher_date: '2024-01-18',
        payee_name: 'Office Supplies Co',
        amount: 15000.0,
        status: 'rejected',
        department: 'Admin',
        payment_method: 'cheque',
    },
    {
        id: '5',
        voucher_number: 'PV-2024-005',
        voucher_date: '2024-01-19',
        payee_name: 'Maintenance Services',
        amount: 67000.0,
        status: 'paid',
        department: 'Facilities',
        payment_method: 'bank_transfer',
    },
];

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export default function Index() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVouchers = mockVouchers.filter(
        (voucher) =>
            voucher.voucher_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            voucher.payee_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const statusCounts = {
        draft: mockVouchers.filter((v) => v.status === 'draft').length,
        pending: mockVouchers.filter((v) => v.status === 'pending').length,
        approved: mockVouchers.filter((v) => v.status === 'approved').length,
        rejected: mockVouchers.filter((v) => v.status === 'rejected').length,
        paid: mockVouchers.filter((v) => v.status === 'paid').length,
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Vouchers" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Payment Vouchers
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Manage and track all payment vouchers
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockVouchers.length}
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Pending
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {statusCounts.pending}
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
                                            Approved
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {statusCounts.approved}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Rejected
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {statusCounts.rejected}
                                        </p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>All Payment Vouchers</CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredVouchers.length} voucher
                                    {filteredVouchers.length !== 1 ? 's' : ''} found
                                    {searchQuery &&
                                        ` matching "${searchQuery}"`}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={paymentVouchers.create().url} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Create Voucher</span>
                                </Link>
                            </Button>
                        </div>
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

                        {/* Table */}

                        {filteredVouchers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery
                                        ? 'No vouchers found'
                                        : 'No payment vouchers found'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {searchQuery
                                        ? `No vouchers match "${searchQuery}". Try a different search term.`
                                        : 'Get started by creating a new payment voucher.'}
                                </p>
                                {!searchQuery && (
                                    <Button asChild>
                                        <Link
                                            href={paymentVouchers.create().url}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Create Voucher</span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full" role="table">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Voucher Number
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Payee
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Amount
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Department
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVouchers.map((voucher) => (
                                                <tr
                                                    key={voucher.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-4">
                                                        <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                            {voucher.voucher_number}
                                                        </code>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(
                                                                voucher.voucher_date
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-black dark:text-white">
                                                            {voucher.payee_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm font-semibold text-black dark:text-white">
                                                            GHS{' '}
                                                            {voucher.amount.toLocaleString(
                                                                undefined,
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-muted-foreground">
                                                            {voucher.department}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    voucher.status
                                                                ]
                                                            }
                                                        >
                                                            {voucher.status.charAt(0).toUpperCase() +
                                                                voucher.status.slice(1)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                title="View voucher"
                                                            >
                                                                <Link
                                                                    href={paymentVouchers.edit({ id: voucher.id }).url}
                                                                    className="gap-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">
                                                                        View
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                title="Edit voucher"
                                                            >
                                                                <Link
                                                                    href={paymentVouchers.edit({ id: voucher.id }).url}
                                                                    className="gap-2"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">
                                                                        Edit
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <Separator className="my-6" />
                                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <p className="text-sm text-muted-foreground">
                                        Showing{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            1
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredVouchers.length}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredVouchers.length}
                                        </span>{' '}
                                        vouchers
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" disabled>
                                            Previous
                                        </Button>
                                        <Button variant="default" size="sm">
                                            1
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            2
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
