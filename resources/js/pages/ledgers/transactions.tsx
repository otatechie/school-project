import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import ledgers from '@/routes/ledgers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Ledger', href: ledgers.index().url },
    { title: 'Transactions', href: ledgers.transactions().url },
];

const mockTransactions = [
    {
        id: 'TXN-001',
        date: '2024-01-27',
        account_code: '1100',
        account_name: 'Cash',
        description: 'Payment voucher PV-2024-001',
        debit: 15000,
        credit: 0,
    },
    {
        id: 'TXN-002',
        date: '2024-01-27',
        account_code: '2100',
        account_name: 'Accounts Payable',
        description: 'Payment voucher PV-2024-001',
        debit: 0,
        credit: 15000,
    },
    {
        id: 'TXN-003',
        date: '2024-01-26',
        account_code: '5100',
        account_name: 'Office Supplies',
        description: 'Purchase of stationery',
        debit: 2500,
        credit: 0,
    },
    {
        id: 'TXN-004',
        date: '2024-01-26',
        account_code: '1100',
        account_name: 'Cash',
        description: 'Purchase of stationery',
        debit: 0,
        credit: 2500,
    },
];

const uniqueAccounts = Array.from(
    new Map(
        mockTransactions.map((t) => [t.account_code, { code: t.account_code, name: t.account_name }])
    ).values()
).sort((a, b) => a.code.localeCompare(b.code));

export default function LedgerTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [accountFilter, setAccountFilter] = useState<string>('all');

    const transactions = mockTransactions.filter((t) => {
        if (accountFilter !== 'all' && t.account_code !== accountFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.account_code.toLowerCase().includes(q) ||
            t.account_name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ledger Transactions" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={ledgers.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Ledger</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        Ledger Transactions
                    </h1>
                    <p className="text-base text-muted-foreground">
                        All general ledger entries (GHS)
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Transactions</CardTitle>
                                <CardDescription className="mt-1">
                                    {transactions.length} transaction
                                    {transactions.length !== 1 ? 's' : ''}{' '}
                                    found
                                    {(searchQuery || accountFilter !== 'all') &&
                                        ' (filtered)'}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-56">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by account or description..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={accountFilter}
                                    onValueChange={setAccountFilter}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All accounts</SelectItem>
                                        {uniqueAccounts.map((acc) => (
                                            <SelectItem
                                                key={acc.code}
                                                value={acc.code}
                                            >
                                                {acc.code} {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full" role="table">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                            Ref
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                            Account
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                            Debit
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                            Credit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr
                                            key={txn.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-4">
                                                <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                    {txn.id}
                                                </code>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {txn.date}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {txn.account_code}
                                                </span>
                                                <span className="ml-1 block text-sm text-black dark:text-white">
                                                    {txn.account_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {txn.description}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm tabular-nums text-black dark:text-white">
                                                {txn.debit > 0
                                                    ? txn.debit.toLocaleString()
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm tabular-nums text-black dark:text-white">
                                                {txn.credit > 0
                                                    ? txn.credit.toLocaleString()
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
