import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import ledgers from '@/routes/ledgers';
import type { BreadcrumbItem, Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Ledger', href: ledgers.index().url },
    { title: 'Transactions', href: ledgers.transactions().url },
];

type Entry = {
    id: string;
    reference: string;
    entry_date: string;
    entry_date_label: string;
    description: string;
    debit: string | number;
    credit: string | number;
    account: { id: string; code: string; name: string } | null;
};

type Props = {
    entries: Paginated<Entry>;
    accounts: Array<{ id: string; code: string; name: string }>;
    totals: { debit: number; credit: number };
    filters: { search?: string; account?: string };
};

const money = (value: string | number): string =>
    (typeof value === 'string' ? parseFloat(value) : value).toLocaleString(
        undefined,
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );

export default function LedgerTransactions({
    entries,
    accounts,
    totals,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [accountFilter, setAccountFilter] = useState(
        filters.account ?? 'all',
    );
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const items = entries.data ?? [];
    const isFiltered = Boolean(filters.search || filters.account);
    const isBalanced = Math.abs(totals.debit - totals.credit) < 0.005;

    const applyFilters = (search: string, account: string) => {
        router.get(
            ledgers.transactions().url,
            {
                search: search || undefined,
                account: account === 'all' ? undefined : account,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ledger Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={ledgers.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Ledger</span>
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Ledger Transactions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        All general ledger entries, in GHS.
                    </p>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {entries.total} entr
                                {entries.total !== 1 ? 'ies' : 'y'}
                                {isFiltered ? ' (filtered)' : ''}
                            </CardDescription>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-56">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search reference or description..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchQuery(value);
                                            if (timer.current)
                                                clearTimeout(timer.current);
                                            timer.current = setTimeout(
                                                () =>
                                                    applyFilters(
                                                        value,
                                                        accountFilter,
                                                    ),
                                                300,
                                            );
                                        }}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={accountFilter}
                                    onValueChange={(v) => {
                                        setAccountFilter(v);
                                        applyFilters(searchQuery, v);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[220px]">
                                        <SelectValue placeholder="Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All accounts
                                        </SelectItem>
                                        {accounts.map((acc) => (
                                            <SelectItem
                                                key={acc.id}
                                                value={acc.code}
                                            >
                                                {acc.code} {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    {isFiltered
                                        ? 'No entries match your filters'
                                        : 'No ledger entries yet'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {isFiltered
                                        ? 'Try a different search term or account.'
                                        : 'Entries post automatically when a voucher is marked paid.'}
                                </p>
                                {isFiltered && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setAccountFilter('all');
                                            applyFilters('', 'all');
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Reference
                                                </th>
                                                <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Account
                                                </th>
                                                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Description</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Debit
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Credit
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((entry) => (
                                                <tr
                                                    key={entry.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium text-muted-foreground">
                                                            {entry.reference}
                                                        </code>
                                                    </td>
                                                    <td className="hidden lg:table-cell px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                                                        {entry.entry_date_label}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="text-sm text-muted-foreground">
                                                            {entry.account
                                                                ?.code ?? '—'}
                                                        </span>
                                                        <span className="block text-sm text-black dark:text-white">
                                                            {entry.account
                                                                ?.name ?? '—'}
                                                        </span>
                                                    </td>
                                                    <td className="hidden md:table-cell max-w-xs px-4 py-3 text-sm text-muted-foreground">
                                                        {entry.description}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                        {parseFloat(
                                                            String(entry.debit),
                                                        ) > 0
                                                            ? money(entry.debit)
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                        {parseFloat(
                                                            String(
                                                                entry.credit,
                                                            ),
                                                        ) > 0
                                                            ? money(
                                                                  entry.credit,
                                                              )
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-border font-semibold">
                                                <td className="px-4 py-3 text-sm text-black dark:text-white">
                                                    Totals
                                                    {isFiltered
                                                        ? ' (filtered)'
                                                        : ''}
                                                </td>
                                                {/* Spacers for Date (lg only),
                                                    Account (always) and
                                                    Description (md and up), so
                                                    the totals sit under their
                                                    own column headings. */}
                                                <td className="hidden lg:table-cell" />
                                                <td />
                                                <td className="hidden md:table-cell" />
                                                <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {money(totals.debit)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {money(totals.credit)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {!isBalanced && (
                                    <p
                                        className="text-sm text-red-700 dark:text-red-400"
                                        role="alert"
                                    >
                                        Debits and credits do not balance.
                                        Difference:{' '}
                                        {money(
                                            Math.abs(
                                                totals.debit - totals.credit,
                                            ),
                                        )}
                                    </p>
                                )}
                                <TablePagination page={entries} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
