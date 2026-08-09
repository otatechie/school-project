import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Banknote,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileCheck,
    FilePen,
    FileText,
    History,
    Mail,
    Printer,
    Receipt,
} from 'lucide-react';
import {
    DepartmentExpenditureChart,
    MonthlyExpenditureChart,
    type DepartmentPoint,
    type MonthlyPoint,
} from '@/components/expenditure-charts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import ledgers from '@/routes/ledgers';
import memos from '@/routes/memos';
import paymentVouchers from '@/routes/payment-vouchers';
import systemLogs from '@/routes/system-logs';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

type DashboardStats = {
    draftVouchers: number;
    pendingApprovals: number;
    approvedVouchers: number;
    paidVouchers: number;
    rejectedVouchers: number;
    draftMemos: number;
    finalizedMemos: number;
    printedMemos: number;
};

type DashboardCharts = {
    monthly: MonthlyPoint[];
    departments: DepartmentPoint[];
};

export default function Dashboard({
    stats,
    charts,
}: {
    stats: DashboardStats;
    charts: DashboardCharts;
}) {
    const { auth } = usePage<SharedData>().props;
    const displayName = auth.user?.name?.trim().split(/\s+/)[0] ?? 'there';

    const appName = import.meta.env.VITE_APP_NAME || 'GovPay Desk';

    // The payment file moves through one continuous chain: a voucher is
    // drafted, approved and paid, after which a memo is raised against the
    // paid voucher, finalized and printed for the file.
    const pipeline = [
        {
            phase: 'Payment voucher',
            label: 'Draft',
            value: stats.draftVouchers,
            icon: FilePen,
            href: `${paymentVouchers.index().url}?status=draft`,
            description: 'Being prepared. Not yet submitted for approval.',
        },
        {
            phase: 'Payment voucher',
            label: 'Pending',
            value: stats.pendingApprovals,
            icon: Clock,
            href: paymentVouchers.pending().url,
            description: 'Submitted and awaiting an approval decision.',
        },
        {
            phase: 'Payment voucher',
            label: 'Approved',
            value: stats.approvedVouchers,
            icon: CheckCircle2,
            href: `${paymentVouchers.index().url}?status=approved`,
            description: 'Approved and cleared for payment.',
        },
        {
            phase: 'Payment voucher',
            label: 'Paid',
            value: stats.paidVouchers,
            icon: Banknote,
            href: `${paymentVouchers.index().url}?status=paid`,
            description: 'Payment released. A memo may now be raised.',
        },
        {
            phase: 'Memo',
            label: 'Drafted',
            value: stats.draftMemos,
            icon: FileText,
            href: `${memos.index().url}?status=draft`,
            description: 'Memo raised against a paid voucher.',
        },
        {
            phase: 'Memo',
            label: 'Finalized',
            value: stats.finalizedMemos,
            icon: FileCheck,
            href: `${memos.index().url}?status=finalized`,
            description: 'Memo completed and ready for printing.',
        },
        {
            phase: 'Memo',
            label: 'Printed',
            value: stats.printedMemos,
            icon: Printer,
            href: `${memos.index().url}?status=printed`,
            description: 'Printed and filed. The record is complete.',
        },
    ];

    const pipelineTotal = pipeline.reduce((sum, s) => sum + s.value, 0);

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getFormattedDate = (): string => {
        return new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Everything a human still has to act on, named so the count is auditable.
    const actionable = [
        {
            label: `${stats.pendingApprovals} awaiting approval`,
            count: stats.pendingApprovals,
            href: paymentVouchers.pending().url,
        },
        {
            label: `${stats.approvedVouchers} approved, awaiting payment`,
            count: stats.approvedVouchers,
            href: `${paymentVouchers.index().url}?status=approved`,
        },
        {
            label: `${stats.rejectedVouchers} returned for correction`,
            count: stats.rejectedVouchers,
            href: paymentVouchers.rejected().url,
        },
    ].filter((item) => item.count > 0);

    const actionableTotal = actionable.reduce((sum, i) => sum + i.count, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* System header: orientation */}
                <header className="rounded-lg border border-border bg-muted/30 px-4 py-5 md:px-6">
                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {appName} &middot; Dashboard
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black md:text-3xl dark:text-white">
                        {getGreeting()}, {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {getFormattedDate()}
                    </p>
                </header>

                {/* Actionable status - full-width band, reads left to right */}
                {actionableTotal > 0 ? (
                    <section
                        aria-labelledby="action-heading"
                        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-4 md:px-6 dark:border-amber-800 dark:bg-amber-950/40"
                        role="status"
                    >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
                            <p
                                id="action-heading"
                                className="flex shrink-0 items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200"
                            >
                                <AlertTriangle
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="tabular-nums">
                                    {actionableTotal}
                                </span>
                                {actionableTotal === 1
                                    ? 'item needs action'
                                    : 'items need action'}
                            </p>
                            <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                                {actionable.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className="inline-flex items-center gap-1 text-sm text-amber-900 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:text-amber-200"
                                        >
                                            {item.label}
                                            <ArrowRight
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                ) : (
                    <section
                        className="rounded-lg border border-green-300 bg-green-50 px-4 py-4 md:px-6 dark:border-green-800 dark:bg-green-950/40"
                        role="status"
                    >
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-green-900 dark:text-green-200">
                            <CheckCircle2
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                            />
                            Nothing awaiting action
                            <span className="font-normal text-green-900/80 dark:text-green-200/80">
                                &mdash; no vouchers are pending approval,
                                payment or correction.
                            </span>
                        </p>
                    </section>
                )}

                {/* Quick actions - prominent, always visible */}
                <section aria-labelledby="quick-actions-heading">
                    <h2
                        id="quick-actions-heading"
                        className="text-sm font-medium tracking-wider text-muted-foreground uppercase"
                    >
                        Quick actions
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" className="gap-2" asChild>
                            <Link href={paymentVouchers.create().url} prefetch>
                                <Receipt className="h-4 w-4" />
                                New payment voucher
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            asChild
                        >
                            <Link href={memos.create().url} prefetch>
                                <Mail className="h-4 w-4" />
                                New memo
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            asChild
                        >
                            <Link href={ledgers.transactions().url} prefetch>
                                <BookOpen className="h-4 w-4" />
                                View transactions
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            asChild
                        >
                            <Link href={systemLogs.index().url} prefetch>
                                <History className="h-4 w-4" />
                                System audit log
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* End-to-end process chain - one continuous mental model */}
                <section aria-labelledby="workflow-heading">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle
                                id="workflow-heading"
                                className="text-base font-semibold text-black dark:text-white"
                            >
                                Payment file progress
                            </CardTitle>
                            <CardDescription>
                                Voucher preparation through to a printed memo on
                                record. {pipelineTotal} file
                                {pipelineTotal === 1 ? '' : 's'} in the chain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pipelineTotal === 0 ? (
                                <div className="flex flex-col items-start gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        No payment files on record yet. Raise a
                                        payment voucher to begin.
                                    </p>
                                    <Button size="sm" className="gap-2" asChild>
                                        <Link
                                            href={paymentVouchers.create().url}
                                            prefetch
                                        >
                                            <Receipt className="h-4 w-4" />
                                            New payment voucher
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <ol className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-stretch">
                                    {pipeline.map((stage, index) => (
                                        <li
                                            key={`${stage.phase}-${stage.label}`}
                                            className="flex items-center gap-1 sm:flex-1"
                                        >
                                            <Link
                                                href={stage.href}
                                                prefetch
                                                title={stage.description}
                                                className="group flex-1 rounded-md border border-transparent px-2.5 py-2 transition-colors hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                                aria-label={`${stage.phase} ${stage.label}: ${stage.value} ${stage.value === 1 ? 'item' : 'items'}. ${stage.description}`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <stage.icon
                                                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                        {stage.label}
                                                    </span>
                                                </span>
                                                <span className="mt-1 block text-2xl font-semibold text-black tabular-nums group-hover:underline dark:text-white">
                                                    {stage.value}
                                                </span>
                                            </Link>
                                            {index < pipeline.length - 1 && (
                                                <ChevronRight
                                                    className="hidden h-4 w-4 shrink-0 text-muted-foreground/40 sm:block"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Expenditure at a glance — the same figures as the reports,
                    shown so a non-accountant can read the position quickly. */}
                <section aria-labelledby="expenditure-heading">
                    <h2 id="expenditure-heading" className="sr-only">
                        Expenditure overview
                    </h2>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <Card className="py-5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-black dark:text-white">
                                    Expenditure by month
                                </CardTitle>
                                <CardDescription>
                                    Vouchers paid over the last twelve months.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MonthlyExpenditureChart
                                    data={charts.monthly}
                                />
                            </CardContent>
                        </Card>

                        <Card className="py-5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-black dark:text-white">
                                    Expenditure by department
                                </CardTitle>
                                <CardDescription>
                                    Paid this year, largest first.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DepartmentExpenditureChart
                                    data={charts.departments}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
