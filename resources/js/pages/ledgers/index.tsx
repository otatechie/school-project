import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, List } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Ledger', href: ledgers.index().url },
];

export default function LedgersIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Ledger" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={dashboard().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        General Ledger
                    </h1>
                    <p className="text-base text-muted-foreground">
                        View transactions and chart of accounts
                    </p>
                </header>

                <section
                    className="grid gap-4 md:grid-cols-2"
                    aria-labelledby="ledger-options-heading"
                >
                    <h2 id="ledger-options-heading" className="sr-only">
                        Ledger options
                    </h2>
                    <Card className="transition-colors hover:bg-muted/50">
                        <Link href={ledgers.transactions().url} prefetch>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <List className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>View Transactions</CardTitle>
                                        <CardDescription>
                                            Browse all ledger transactions
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    See debits, credits, dates, and references
                                    for every ledger entry.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card className="transition-colors hover:bg-muted/50">
                        <Link href={ledgers.chartOfAccounts().url} prefetch>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle>Chart of Accounts</CardTitle>
                                        <CardDescription>
                                            View account codes and names
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    List of all ledger accounts with codes and
                                    types.
                                </p>
                            </CardContent>
                        </Link>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
