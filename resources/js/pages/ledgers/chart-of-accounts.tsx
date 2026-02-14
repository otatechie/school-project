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
    { title: 'Chart of Accounts', href: ledgers.chartOfAccounts().url },
];

const mockAccounts = [
    { code: '1100', name: 'Cash', type: 'Asset' },
    { code: '1200', name: 'Bank', type: 'Asset' },
    { code: '1300', name: 'Accounts Receivable', type: 'Asset' },
    { code: '2100', name: 'Accounts Payable', type: 'Liability' },
    { code: '2200', name: 'Accrued Expenses', type: 'Liability' },
    { code: '3100', name: 'Equity', type: 'Equity' },
    { code: '4100', name: 'Revenue', type: 'Revenue' },
    { code: '5100', name: 'Office Supplies', type: 'Expense' },
    { code: '5200', name: 'Salaries', type: 'Expense' },
];

const accountTypes = Array.from(
    new Set(mockAccounts.map((a) => a.type))
).sort();

export default function ChartOfAccounts() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const accounts = mockAccounts.filter((a) => {
        if (typeFilter !== 'all' && a.type !== typeFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            a.code.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.type.toLowerCase().includes(q)
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chart of Accounts" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={ledgers.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Ledger</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        Chart of Accounts
                    </h1>
                    <p className="text-base text-muted-foreground">
                        All ledger account codes and names
                    </p>
                </header>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Accounts</CardTitle>
                                <CardDescription className="mt-1">
                                    {accounts.length} account
                                    {accounts.length !== 1 ? 's' : ''} found
                                    {(searchQuery || typeFilter !== 'all') &&
                                        ' (filtered)'}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-56">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by code or name..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        {accountTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
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
                                            Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                            Account Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map((account) => (
                                        <tr
                                            key={account.code}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="px-4 py-4">
                                                <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                    {account.code}
                                                </code>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-black dark:text-white">
                                                {account.name}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-muted-foreground">
                                                {account.type}
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
