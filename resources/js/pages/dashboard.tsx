import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    FilePen,
    FileText,
    History,
    Mail,
    Printer,
    Receipt,
    XCircle,
} from 'lucide-react';
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

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const displayName = auth.user?.name?.trim().split(/\s+/)[0] ?? 'there';

    // Placeholder stats for UI design only; replace with server data when backend is ready.
    const stats = {
        pendingApprovals: 6,
        rejectedVouchers: 1,
        draftVouchers: 3,
        draftMemos: 2,
        finalizedMemos: 7,
        printedMemos: 3,
    };

    const attentionCount =
        stats.pendingApprovals + stats.rejectedVouchers;

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getFormattedDate = (): string => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 md:p-6">
                <header className="rounded-lg border border-border bg-muted/30 px-4 py-5 md:px-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white md:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground md:text-base">
                        {getGreeting()}, {displayName} · {getFormattedDate()}
                    </p>
                    {attentionCount > 0 && (
                        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                            {attentionCount} item{attentionCount !== 1 ? 's' : ''} need your attention
                        </p>
                    )}
                </header>

                <section aria-labelledby="payment-vouchers-heading">
                    <h2
                        id="payment-vouchers-heading"
                        className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Payment vouchers
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Pending approval
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-black dark:text-white">
                                            {stats.pendingApprovals}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link href={paymentVouchers.pending().url} prefetch>
                                        Review
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Rejected
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-black dark:text-white">
                                            {stats.rejectedVouchers}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50">
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link href={paymentVouchers.rejected().url} prefetch>
                                        View
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Draft vouchers
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-black dark:text-white">
                                            {stats.draftVouchers}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                                        <FilePen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link href={paymentVouchers.index().url} prefetch>
                                        View all
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section aria-labelledby="memos-heading">
                    <h2
                        id="memos-heading"
                        className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        Memos
                    </h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Draft
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-black dark:text-white">
                                            {stats.draftMemos}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link href={memos.index().url} prefetch>
                                        View
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Finalized
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-black dark:text-white">
                                            {stats.finalizedMemos}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/50">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link href={memos.index().url} prefetch>
                                        View
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Printed
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tabular-nums text-black dark:text-white">
                                            {stats.printedMemos}
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                        <Printer className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 w-full"
                                    asChild
                                >
                                    <Link href={memos.index().url} prefetch>
                                        View all
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section aria-labelledby="shortcuts-heading">
                    <Card className="transition-shadow hover:shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle
                                id="shortcuts-heading"
                                className="text-base font-semibold text-black dark:text-white"
                            >
                                Shortcuts
                            </CardTitle>
                            <CardDescription>
                                Create a voucher or memo, view ledger, or open the audit log
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button size="sm" className="gap-2" asChild>
                                <Link href={paymentVouchers.create().url} prefetch>
                                    <Receipt className="h-4 w-4" />
                                    New payment voucher
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2" asChild>
                                <Link href={memos.create().url} prefetch>
                                    <Mail className="h-4 w-4" />
                                    New memo
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2" asChild>
                                <Link href={ledgers.transactions().url} prefetch>
                                    <BookOpen className="h-4 w-4" />
                                    View transactions
                                </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2" asChild>
                                <Link href={systemLogs.index().url} prefetch>
                                    <History className="h-4 w-4" />
                                    System audit log
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
