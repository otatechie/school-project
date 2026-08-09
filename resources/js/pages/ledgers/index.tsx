import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import ledgers from '@/routes/ledgers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General ledger', href: ledgers.index().url },
];

type Props = {
    summary: {
        entries: number;
        accounts: number;
        totalDebit: number;
        totalCredit: number;
    };
};

const money = (v: number): string =>
    v.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function LedgerIndex({ summary }: Props) {
    const isBalanced =
        Math.abs(summary.totalDebit - summary.totalCredit) < 0.005;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General ledger" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        General ledger
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Entries post automatically when a payment voucher is
                        marked paid.
                    </p>
                </header>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                        Total posted{' '}
                        <span className="font-semibold text-foreground tabular-nums">
                            GHS {money(summary.totalDebit)}
                        </span>
                    </span>
                    <span className="text-muted-foreground">
                        {summary.entries} entr
                        {summary.entries !== 1 ? 'ies' : 'y'} across{' '}
                        {summary.accounts} accounts
                    </span>
                    <span
                        className={
                            isBalanced
                                ? 'font-medium text-green-700 dark:text-green-400'
                                : 'font-medium text-red-700 dark:text-red-400'
                        }
                    >
                        {isBalanced
                            ? 'Debits and credits balance'
                            : `Out of balance by GHS ${money(Math.abs(summary.totalDebit - summary.totalCredit))}`}
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="py-5">
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <BookOpen
                                    className="h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <h2 className="text-base font-semibold text-black dark:text-white">
                                    Transactions
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Every debit and credit posted to the ledger,
                                searchable by reference or account.
                            </p>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={ledgers.transactions().url}
                                    className="gap-2"
                                    prefetch
                                >
                                    View transactions
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="py-5">
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ListTree
                                    className="h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <h2 className="text-base font-semibold text-black dark:text-white">
                                    Chart of accounts
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The account codes vouchers post against, with
                                balances for each.
                            </p>
                            <Button variant="outline" size="sm" asChild>
                                <Link
                                    href={ledgers.chartOfAccounts().url}
                                    className="gap-2"
                                    prefetch
                                >
                                    View accounts
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
