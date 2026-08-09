import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Edit,
    FileText,
    Plus,
    Receipt,
    Search,
    Send,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Paginated } from '@/types';
import FlashMessages from '@/components/flash-messages';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import paymentVouchers from '@/routes/payment-vouchers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payment Vouchers', href: paymentVouchers.index().url },
];

type Voucher = {
    id: string;
    voucher_number: string;
    voucher_date: string;
    voucher_date_label: string;
    payee_name: string;
    amount: string | number;
    status: string;
    payment_method: string;
    department?: { id: string; name: string; code: string } | null;
    creator?: { id: string; name: string } | null;
};

type Stats = {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
    draft: number;
};

type Props = {
    vouchers: Paginated<Voucher>;
    stats: Stats;
    filters: { search?: string; status?: string };
};

/** What staff read. The stored status stays 'rejected'. */
const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Returned',
    paid: 'Paid',
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending:
        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    approved:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export default function Index({ vouchers, stats, filters }: Props) {
    const { url, props } = usePage();
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    const items: Voucher[] = Array.isArray(vouchers)
        ? vouchers
        : (vouchers.data ?? []);
    const page = Array.isArray(vouchers) ? null : vouchers;

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, []);

    const applyFilters = (search: string, status: string) => {
        router.get(
            paymentVouchers.index().url,
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, replace: true },
        );
    };

    const [submitting, setSubmitting] = useState<Voucher | null>(null);
    const [processing, setProcessing] = useState(false);

    const submitVoucher = () => {
        if (!submitting) return;

        setProcessing(true);
        router.post(
            paymentVouchers.submit({ voucher: submitting.id }).url,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setSubmitting(null);
                },
            },
        );
    };

    const formatAmount = (amount: string | number): string => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return num.toLocaleString(undefined, { minimumFractionDigits: 2 });
    };

    const statCards = [
        {
            label: 'Total',
            value: stats.total,
            icon: FileText,
            iconClass: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Pending',
            value: stats.pending,
            icon: Clock,
            iconClass: 'text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Approved',
            value: stats.approved,
            icon: CheckCircle2,
            iconClass: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Returned',
            value: stats.rejected,
            icon: XCircle,
            iconClass: 'text-red-600 dark:text-red-400',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Vouchers" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <FlashMessages />
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Payment Vouchers
                        </h1>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        {statCards.map((s) => (
                            <Card key={s.label} className="py-4">
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {s.label}
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                                {s.value}
                                            </p>
                                        </div>
                                        <s.icon
                                            className={`h-8 w-8 ${s.iconClass}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>All Payment Vouchers</CardTitle>
                                <CardDescription className="mt-1">
                                    {page?.total ?? items.length} voucher
                                    {(page?.total ?? items.length) !== 1
                                        ? 's'
                                        : ''}
                                    {filters.search || filters.status
                                        ? ' match your filters'
                                        : ' total'}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link
                                    href={paymentVouchers.create().url}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Create Voucher</span>
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by voucher number or payee name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchQuery(value);
                                        if (searchTimer.current)
                                            clearTimeout(searchTimer.current);
                                        searchTimer.current = setTimeout(
                                            () =>
                                                applyFilters(
                                                    value,
                                                    statusFilter,
                                                ),
                                            300,
                                        );
                                    }}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    setStatusFilter(v);
                                    applyFilters(searchQuery, v);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Returned
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator className="mb-6" />
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {filters.search || filters.status
                                        ? 'No vouchers match your filters'
                                        : 'No payment vouchers yet'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {filters.search || filters.status
                                        ? 'Try a different search term or status.'
                                        : 'Get started by creating a new payment voucher.'}
                                </p>
                                {filters.search || filters.status ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                            applyFilters('', 'all');
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                ) : (
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Voucher
                                            </th>
                                            <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black lg:table-cell dark:text-white">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Payee
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Amount (GHS)
                                            </th>
                                            <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black md:table-cell dark:text-white">
                                                Department
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((voucher) => {
                                            // Only unsubmitted and returned
                                            // vouchers can be edited; offering
                                            // the link otherwise leads to a 403.
                                            const editable = [
                                                'draft',
                                                'rejected',
                                            ].includes(voucher.status);

                                            return (
                                                <tr
                                                    key={voucher.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {editable ? (
                                                            <Link
                                                                href={
                                                                    paymentVouchers.edit(
                                                                        {
                                                                            voucher:
                                                                                voucher.id,
                                                                        },
                                                                    ).url
                                                                }
                                                                className="font-mono text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white"
                                                            >
                                                                {
                                                                    voucher.voucher_number
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <span className="font-mono text-sm font-medium text-muted-foreground">
                                                                {
                                                                    voucher.voucher_number
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
                                                        {voucher.voucher_date_label}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-black dark:text-white">
                                                        {voucher.payee_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium whitespace-nowrap text-black tabular-nums dark:text-white">
                                                        {formatAmount(
                                                            voucher.amount,
                                                        )}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                                                        {voucher.department
                                                            ?.name ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    voucher
                                                                        .status
                                                                ]
                                                            }
                                                        >
                                                            {STATUS_LABELS[
                                                                voucher.status
                                                            ] ??
                                                                voucher.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {voucher.status ===
                                                                'draft' && (
                                                                <Button
                                                                    size="sm"
                                                                    className="gap-1.5"
                                                                    onClick={() =>
                                                                        setSubmitting(
                                                                            voucher,
                                                                        )
                                                                    }
                                                                >
                                                                    <Send className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">
                                                                        Submit
                                                                    </span>
                                                                </Button>
                                                            )}
                                                            {editable && (
                                                                <Button
                                                                    variant="ghost"
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
                                                                        className="gap-1.5"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        <span className="hidden sm:inline">
                                                                            Edit
                                                                        </span>
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                                <TablePagination page={page} />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={submitting !== null}
                onOpenChange={(open) => !open && setSubmitting(null)}
                title="Submit for approval?"
                description="Once submitted you cannot edit this voucher. An approver must return it before you can change anything."
                confirmLabel="Submit"
                processing={processing}
                onConfirm={submitVoucher}
                detail={
                    submitting && (
                        <dl className="space-y-1 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Voucher
                                </dt>
                                <dd className="font-mono">
                                    {submitting.voucher_number}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">Payee</dt>
                                <dd>{submitting.payee_name}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Amount
                                </dt>
                                <dd className="font-semibold tabular-nums">
                                    GHS {formatAmount(submitting.amount)}
                                </dd>
                            </div>
                        </dl>
                    )
                }
            />
        </AppLayout>
    );
}
