import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, Plus, Printer, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import FlashMessages from '@/components/flash-messages';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import memos from '@/routes/memos';
import type { BreadcrumbItem, Paginated, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Memos', href: memos.index().url },
];

type Memo = {
    id: string;
    memo_number: string;
    memo_date: string;
    memo_date_label: string;
    subject: string;
    to_name: string;
    from_name: string;
    status: string;
    department: { id: string; name: string } | null;
};

type Props = {
    memos: Paginated<Memo>;
    stats: { total: number; draft: number; finalized: number; printed: number };
    filters: { search?: string; status?: string };
};

export default function MemosIndex({ memos: data, stats, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const items = data.data ?? [];
    const isFiltered = Boolean(filters.search || filters.status);

    const applyFilters = (search: string, status: string) => {
        router.get(
            memos.index().url,
            {
                search: search || undefined,
                status: status === 'all' ? undefined : status,
            },
            { preserveState: true, replace: true },
        );
    };

    const statusVariant = (
        status: string,
    ): 'default' | 'secondary' | 'outline' => {
        if (status === 'printed') return 'default';
        if (status === 'finalized') return 'secondary';
        return 'outline';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Memos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <FlashMessages />

                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Memos
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {stats.total} total &middot; {stats.draft} draft
                            &middot; {stats.finalized} finalized &middot;{' '}
                            {stats.printed} printed
                        </p>
                    </div>
                    {auth.can?.createMemo && (
                        <Button asChild>
                            <Link href={memos.create().url} className="gap-2">
                                <Plus className="h-4 w-4" />
                                <span>New memo</span>
                            </Link>
                        </Button>
                    )}
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {data.total} memo{data.total !== 1 ? 's' : ''}
                                {isFiltered ? ' (filtered)' : ''}
                            </CardDescription>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search number, subject or recipient..."
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
                                    <SelectTrigger className="w-full sm:w-[170px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="finalized">
                                            Finalized
                                        </SelectItem>
                                        <SelectItem value="printed">
                                            Printed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <FileText
                                    className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium text-black dark:text-white">
                                    {isFiltered
                                        ? 'No memos match your filters'
                                        : 'No memos yet'}
                                </p>
                                {isFiltered ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setStatusFilter('all');
                                            applyFilters('', 'all');
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                ) : (
                                    <Button asChild size="sm" className="mt-3">
                                        <Link href={memos.create().url}>
                                            New memo
                                        </Link>
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
                                                    Memo No.
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black lg:table-cell dark:text-white">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Subject
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black md:table-cell dark:text-white">
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
                                            {items.map((memo) => (
                                                <tr
                                                    key={memo.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium text-muted-foreground">
                                                            {memo.memo_number}
                                                        </code>
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
                                                        {memo.memo_date_label}
                                                    </td>
                                                    <td className="max-w-xs px-4 py-3 text-sm text-black dark:text-white">
                                                        {memo.subject}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                                                        {memo.to_name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={statusVariant(
                                                                memo.status,
                                                            )}
                                                            className="capitalize"
                                                        >
                                                            {memo.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {memo.status ===
                                                                'draft' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        router.post(
                                                                            memos.finalize(
                                                                                memo.id,
                                                                            )
                                                                                .url,
                                                                            {},
                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    Finalize
                                                                </Button>
                                                            )}
                                                            {memo.status ===
                                                                'finalized' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-2"
                                                                    onClick={() =>
                                                                        router.post(
                                                                            memos.print(
                                                                                memo.id,
                                                                            )
                                                                                .url,
                                                                            {},
                                                                            {
                                                                                preserveScroll: true,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <Printer className="h-4 w-4" />
                                                                    Mark printed
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <TablePagination page={data} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
