import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Plus, Search } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import memos from '@/routes/memos';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Memos', href: memos.index().url },
];

const mockMemos = [
    {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        memo_number: 'MEMO-2024-001',
        memo_date: '2024-01-27',
        subject: 'Budget approval for Q1',
        to_name: 'Finance Director',
        from_name: 'Admin Office',
        status: 'finalized',
    },
    {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FB0',
        memo_number: 'MEMO-2024-002',
        memo_date: '2024-01-26',
        subject: 'Payment voucher clearance',
        to_name: 'Accounts Department',
        from_name: 'Finance Director',
        status: 'draft',
    },
    {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FB1',
        memo_number: 'MEMO-2024-003',
        memo_date: '2024-01-25',
        subject: 'Staff training schedule',
        to_name: 'HR Department',
        from_name: 'Director',
        status: 'printed',
    },
];

type StatusFilter = 'all' | 'draft' | 'finalized' | 'printed';

export default function Index() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const filteredMemos = mockMemos.filter((m) => {
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            m.memo_number.toLowerCase().includes(q) ||
            m.subject.toLowerCase().includes(q) ||
            m.to_name.toLowerCase().includes(q)
        );
    });
    const draftCount = mockMemos.filter((m) => m.status === 'draft').length;
    const finalizedCount = mockMemos.filter(
        (m) => m.status === 'finalized' || m.status === 'printed'
    ).length;

    const statusVariant = (
        status: string
    ): 'default' | 'secondary' | 'outline' => {
        if (status === 'printed') return 'default';
        if (status === 'finalized') return 'secondary';
        return 'outline';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Memos" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={dashboard().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        Memos
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Create and manage internal memorandums
                    </p>
                </header>

                <section aria-labelledby="memos-stats-heading">
                    <h2 id="memos-stats-heading" className="sr-only">
                        Memo statistics
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Memos
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockMemos.length}
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
                                            Draft
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {draftCount}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Finalized / Printed
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {finalizedCount}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>All Memos</CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredMemos.length} memo{filteredMemos.length !== 1 ? 's' : ''}{' '}
                                    found
                                    {(searchQuery || statusFilter !== 'all') &&
                                        ` (filtered)`}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={memos.create().url} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>New Memo</span>
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by memo number, subject, or recipient..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) =>
                                    setStatusFilter(v as StatusFilter)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="finalized">Finalized</SelectItem>
                                    <SelectItem value="printed">Printed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Separator className="mb-6" />

                        {filteredMemos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'No memos found'
                                        : 'No memos yet'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {searchQuery || statusFilter !== 'all'
                                        ? 'No memos match your search or filter. Try changing them.'
                                        : 'Create a memo to get started.'}
                                </p>
                                {!searchQuery && (
                                    <Button asChild>
                                        <Link href={memos.create().url} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            <span>New Memo</span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full" role="table">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Memo No
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Subject
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                To
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
                                        {filteredMemos.map((memo) => (
                                            <tr
                                                key={memo.id}
                                                className="border-b border-border transition-colors hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-4">
                                                    <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                        {memo.memo_number}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {memo.memo_date}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-black dark:text-white">
                                                    {memo.subject}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {memo.to_name}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge
                                                        variant={statusVariant(
                                                            memo.status
                                                        )}
                                                    >
                                                        {memo.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled
                                                        >
                                                            View
                                                        </Button>
                                                    </div>
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
