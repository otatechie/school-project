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
import AppLayout from '@/layouts/app-layout';
import ledgers from '@/routes/ledgers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Ledger', href: ledgers.index().url },
    { title: 'Chart of Accounts', href: ledgers.chartOfAccounts().url },
];

type Account = {
    id: string;
    code: string;
    name: string;
    type: string;
    is_active: boolean;
    debit_total: string | number | null;
    credit_total: string | number | null;
};

type Props = {
    accounts: Account[];
    types: string[];
    filters: { search?: string; type?: string };
};

const money = (value: string | number | null): string =>
    (typeof value === 'string'
        ? parseFloat(value)
        : (value ?? 0)
    ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function ChartOfAccounts({ accounts, types, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [typeFilter, setTypeFilter] = useState(filters.type ?? 'all');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const isFiltered = Boolean(filters.search || filters.type);

    const applyFilters = (search: string, type: string) => {
        router.get(
            ledgers.chartOfAccounts().url,
            {
                search: search || undefined,
                type: type === 'all' ? undefined : type,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chart of Accounts" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={ledgers.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Ledger</span>
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Chart of Accounts
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Account codes with posted balances, in GHS.
                    </p>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {accounts.length} account
                                {accounts.length !== 1 ? 's' : ''}
                                {isFiltered ? ' (filtered)' : ''}
                            </CardDescription>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-56">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by code or name..."
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
                                                        typeFilter,
                                                    ),
                                                300,
                                            );
                                        }}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(v) => {
                                        setTypeFilter(v);
                                        applyFilters(searchQuery, v);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All types
                                        </SelectItem>
                                        {types.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                <span className="capitalize">
                                                    {type}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {accounts.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    No accounts match your filters
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setTypeFilter('all');
                                        applyFilters('', 'all');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Code
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Account Name
                                            </th>
                                            <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Type</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Debits
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Credits
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accounts.map((account) => (
                                            <tr
                                                key={account.id}
                                                className="border-b border-border transition-colors hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium text-muted-foreground">
                                                        {account.code}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-black dark:text-white">
                                                    {account.name}
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground capitalize">
                                                    {account.type}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {money(account.debit_total)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {money(
                                                        account.credit_total,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
